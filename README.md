# SanitizeAI

AI-powered sensitive data sanitization using the Model Context Protocol (MCP).

## Overview

SanitizeAI demonstrates how AI can protect sensitive information in text by:

1. Accepting free-form text and a sanitization intent (e.g. "Anonymize PII")
2. Using Google Gemini 2.0 Flash to pick the correct sanitization tool
3. Executing that tool on a standalone MCP server and streaming progress back to the browser

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **AI SDK**: Genkit
- **AI Model**: Google Gemini 2.0 Flash
- **AI Protocol**: Model Context Protocol (MCP)
- **UI**: ShadCN UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Forms**: react-hook-form + zod

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repo>
   cd sanitize-ai-agent
   npm install
   ```

2. **Set up environment:**
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" >> .env
   ```

3. **Start both services at once:**
   ```bash
   npm run dev
   ```
   
   This will start both the MCP server (port 9003) and Next.js (port 3000) simultaneously with colored output.

   **Alternative: Start services separately:**
   ```bash
   # Terminal 1
   npm run dev:mcp
   
   # Terminal 2  
   npm run dev:next
   ```

4. **Open the application:**
   Navigate to http://localhost:3000

## How It Works

The application showcases a clear separation between:

- **MCP Client** (Genkit flow inside Next.js) - handles AI reasoning and tool selection
- **MCP Server** (standalone Node/Express service) - owns the actual sanitization tools

### Available Sanitization Tools

1. **anonymize_pii** - Anonymizes names, emails, phone numbers, addresses, dates of birth
2. **redact_financial** - Redacts IBANs, credit card numbers, crypto wallets, sort codes
3. **remove_sensitive_data** - Removes passwords, API keys, tokens, and other secrets

## Project Structure

```
src/
├── ai/
│   ├── flows/               # Genkit flows
│   └── dev.ts              # Development runner
├── app/
│   ├── actions.ts          # Next.js server actions
│   └── page.tsx            # Main UI
├── components/ui/          # ShadCN components
├── lib/
│   ├── ai.ts              # Genkit configuration
│   └── utils.ts           # Utilities
└── mcp/
    ├── client.ts          # MCP client implementation
    ├── server.ts          # MCP server with tools
    └── types.ts           # MCP type definitions
```

## Features

- **Real-time progress streaming** - See each step of the sanitization process
- **Sample datasets** - Quick start with pre-filled examples
- **Multiple sanitization modes** - PII, financial data, and sensitive credentials
- **Raw output inspection** - View technical details of the MCP communication
- **Responsive design** - Works on desktop and mobile

## Development

The application demonstrates the Model Context Protocol by maintaining a clear separation between the AI reasoning (which tool to use) and the tool execution (actual sanitization).

This architecture allows for:
- Independent scaling of AI logic and tools
- Easy addition of new sanitization tools
- Clear separation of concerns
- Better testing and debugging

## License

MIT
