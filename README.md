# Cloudflare Vectorize MCP Server

MCP (Model Context Protocol) server implementation for Cloudflare Workers with Vectorize integration.

## Features

- ✅ MCP Protocol 2.0 compliant
- ✅ Streamable HTTP Transport with SSE
- ✅ TypeScript support
- ✅ Comprehensive test coverage
- 🚧 Cloudflare Vectorize integration (upcoming)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## API Endpoints

- `POST /mcp` - MCP JSON-RPC requests
- `POST /mcp/stream` - SSE streaming requests  
- `GET /health` - Health check
- `GET /mcp/info` - Server information

## Architecture

Built following Kiro-style spec-driven development with comprehensive requirements, design, and task documentation in `.kiro/specs/`.

