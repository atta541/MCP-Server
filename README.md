Weather MCP Server
A Node.js/TypeScript server that provides weather data, email integration, and utility tools via the Model Context Protocol (MCP).
It fetches weather alerts and forecasts from the US National Weather Service, allows sending and receiving emails via Gmail, and includes fun extras like jokes and Bitcoin price.
Features
Weather Alerts: Get current weather alerts for any US state.
Weather Forecast: Fetch detailed weather forecasts for any US location (latitude/longitude).
Email Integration:# Weather MCP Server

A Node.js/TypeScript server that provides weather data, email integration, and utility tools via the Model Context Protocol (MCP). It fetches weather alerts and forecasts from the US National Weather Service, allows sending and receiving emails via Gmail, and includes fun extras like jokes and Bitcoin price.

## Features

- **Weather Alerts**: Get current weather alerts for any US state
- **Weather Forecast**: Fetch detailed weather forecasts for any US location (latitude/longitude)
- **Email Integration**:
  - Fetch your most recent emails from Gmail
  - Send emails via Gmail
- **Utilities**:
  - Get a random joke
  - Get the current Bitcoin price in USD

## Requirements

- Node.js v16 or higher
- TypeScript

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd weather-mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the project root with the following content:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```
   
   > **Note**: For Gmail, you must use an App Password if 2FA is enabled.

4. **Build the project:**
   ```bash
   npm run build
   ```

## Usage

The server is designed to run as an MCP (Model Context Protocol) server over stdio. You can integrate it with MCP-compatible clients or tools.

To start the server:
```bash
npm start
```

## MCP Tools Provided

| Tool | Description |
|------|-------------|
| `get-alerts` | Get weather alerts for a US state |
| `get-forecast` | Get weather forecast for a latitude/longitude |
| `get-recent-emails` | Fetch your most recent emails from Gmail |
| `send-email` | Send an email via Gmail |
| `get-random-joke` | Get a random joke |
| `get-bitcoin-price` | Get the current Bitcoin price in USD |

## Development

- Source code is in the `src/` directory
- TypeScript configuration is in `tsconfig.json`

### Available Scripts

```bash
npm run build    # Build the TypeScript project
npm start        # Start the MCP server
npm run dev      # Development mode (if configured)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASSWORD` | Your Gmail app password |

⚠️ **Never commit your `.env` file or credentials to version control!**

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

ISC
Fetch your most recent emails from Gmail.
Send emails via Gmail.
Utilities:
Get a random joke.
Get the current Bitcoin price in USD.
Requirements
Node.js v16 or higher
TypeScript
Setup
Clone the repository:
Apply
Install dependencies:
Apply
Configure environment variables:
Create a .env file in the project root with the following content:
Apply
> Note: For Gmail, you must use an App Password if 2FA is enabled.
Build the project:
Apply
Usage
The server is designed to run as an MCP (Model Context Protocol) server over stdio.
You can integrate it with MCP-compatible clients or tools.
To start the server:
Apply
MCP Tools Provided
get-alerts: Get weather alerts for a US state.
get-forecast: Get weather forecast for a latitude/longitude.
get-recent-emails: Fetch your most recent emails from Gmail.
send-email: Send an email via Gmail.
get-random-joke: Get a random joke.
get-bitcoin-price: Get the current Bitcoin price in USD.
Development
Source code is in the src/ directory.
TypeScript configuration is in tsconfig.json.
Environment Variables
Variable	Description
EMAIL_USER	Your Gmail address
EMAIL_PASSWORD	Your Gmail app password
Never commit your .env file or credentials to version control!
License
ISC
