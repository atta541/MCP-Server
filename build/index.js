import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import nodemailer from "nodemailer";
import Imap from "node-imap";
import { simpleParser } from "mailparser";
const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";
// Create server instance
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Helper function for making NWS API requests
async function makeNWSRequest(url) {
    const headers = {
        "User-Agent": USER_AGENT,
        Accept: "application/geo+json",
    };
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error("Error making NWS request:", error);
        return null;
    }
}
// Format alert data
function formatAlert(feature) {
    const props = feature.properties;
    return [
        `Event: ${props.event || "Unknown"}`,
        `Area: ${props.areaDesc || "Unknown"}`,
        `Severity: ${props.severity || "Unknown"}`,
        `Status: ${props.status || "Unknown"}`,
        `Headline: ${props.headline || "No headline"}`,
        "---",
    ].join("\n");
}
// Register weather tools
server.tool("get-alerts", "Get weather alerts for a state", {
    state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
}, async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest(alertsUrl);
    if (!alertsData) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve alerts data",
                },
            ],
        };
    }
    const features = alertsData.features || [];
    if (features.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `No active alerts for ${stateCode}`,
                },
            ],
        };
    }
    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;
    return {
        content: [
            {
                type: "text",
                text: alertsText,
            },
        ],
    };
});
server.tool("get-forecast", "Get weather forecast for a location", {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z
        .number()
        .min(-180)
        .max(180)
        .describe("Longitude of the location"),
}, async ({ latitude, longitude }) => {
    // Get grid point data
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await makeNWSRequest(pointsUrl);
    if (!pointsData) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
                },
            ],
        };
    }
    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to get forecast URL from grid point data",
                },
            ],
        };
    }
    // Get forecast data
    const forecastData = await makeNWSRequest(forecastUrl);
    if (!forecastData) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve forecast data",
                },
            ],
        };
    }
    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "No forecast periods available",
                },
            ],
        };
    }
    // Format forecast periods
    const formattedForecast = periods.map((period) => [
        `${period.name || "Unknown"}:`,
        `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
        `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
        `${period.shortForecast || "No forecast available"}`,
        "---",
    ].join("\n"));
    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;
    return {
        content: [
            {
                type: "text",
                text: forecastText,
            },
        ],
    };
});
server.tool("get-recent-emails", "Get the last N received emails", {
    count: z.number().min(1).max(10).default(2).describe("Number of recent emails to fetch"),
}, async ({ count }) => {
    const imap = new Imap({
        user: 'attareh542@gmail.com',
        password: 'kuik kfvq vbsw qjkv',
        host: "imap.gmail.com",
        port: 993,
        tls: true,
    });
    function openInbox(cb) {
        imap.openBox("INBOX", true, cb);
    }
    return new Promise((resolve, reject) => {
        imap.once("ready", function () {
            openInbox((err, box) => {
                if (err)
                    return reject({
                        content: [{ type: "text", text: `Error opening inbox: ${err.message}` }],
                    });
                const total = box.messages.total;
                if (total === 0) {
                    imap.end();
                    return resolve({
                        content: [{ type: "text", text: "No emails found in your inbox." }],
                    });
                }
                // Calculate the range for the last N emails
                const start = Math.max(1, total - count + 1);
                const fetch = imap.seq.fetch(`${start}:${total}`, {
                    bodies: "",
                    struct: true,
                });
                const emails = [];
                const parsePromises = [];
                fetch.on("message", function (msg, seqno) {
                    parsePromises.push(new Promise((res) => {
                        msg.on("body", function (stream) {
                            simpleParser(stream, (err, parsed) => {
                                if (parsed) {
                                    emails.push(`From: ${parsed.from?.text || "Unknown"}\nSubject: ${parsed.subject || "(No subject)"}\nSnippet: ${parsed.text?.slice(0, 100) || ""}`);
                                }
                                res();
                            });
                        });
                    }));
                });
                fetch.once("end", async function () {
                    await Promise.all(parsePromises);
                    imap.end();
                    if (emails.length === 0) {
                        return resolve({
                            content: [{ type: "text", text: "No emails could be parsed." }],
                        });
                    }
                    // Show most recent first
                    emails.reverse();
                    resolve({
                        content: [
                            {
                                type: "text",
                                text: `Here are your last ${emails.length} emails:\n\n${emails.join("\n\n")}`,
                            },
                        ],
                    });
                });
            });
        });
        imap.once("error", function (err) {
            reject({
                content: [{ type: "text", text: `Error fetching emails: ${err.message}` }],
            });
        });
        imap.connect();
    });
});
server.tool("send-email", "Send an email to a specific recipient", {
    to: z.string().email().describe("Recipient email address"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body content"),
}, async ({ to, subject, body }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "attareh542@gmail.com",
            pass: "kuik kfvq vbsw qjkv",
        },
    });
    try {
        await transporter.sendMail({
            from: "attareh542@gmail.com",
            to,
            subject,
            text: body,
        });
        return {
            content: [
                {
                    type: "text",
                    text: `Email successfully sent to ${to}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});
server.tool("get-random-joke", "Get a random joke", {}, async () => {
    const jokeApiUrl = "https://official-joke-api.appspot.com/random_joke";
    try {
        const response = await fetch(jokeApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const joke = await response.json();
        return {
            content: [
                {
                    type: "text",
                    text: `${joke.setup}\n${joke.punchline}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to fetch a joke. Please try again later.",
                },
            ],
        };
    }
});
server.tool("get-bitcoin-price", "Get current Bitcoin price in USD", {}, async () => {
    const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice/USD.json");
    const data = await res.json();
    const price = data.bpi.USD.rate;
    return {
        content: [
            { type: "text", text: `Current Bitcoin Price: $${price}` }
        ]
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
