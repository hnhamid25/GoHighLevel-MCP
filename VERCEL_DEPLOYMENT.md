# Vercel Deployment Guide for GoHighLevel MCP Server

This guide explains how to deploy the full GoHighLevel MCP Server with all 269 tools to Vercel.

## Deployment Steps

### 1. Fork or Clone the Repository
```bash
git clone https://github.com/your-username/GoHighLevel-MCP.git
cd GoHighLevel-MCP
```

### 2. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 3. Set Environment Variables

Create a `.env` file in the root directory (or set these in Vercel Dashboard):

```env
GHL_API_KEY=your_gohighlevel_api_key
GHL_LOCATION_ID=your_location_id
GHL_BASE_URL=https://services.leadconnectorhq.com
```

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
vercel
```

Follow the prompts and make sure to:
- Link to your Vercel account
- Set up the project (choose the defaults)
- Add environment variables when prompted

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in the project settings:
   - `GHL_API_KEY`
   - `GHL_LOCATION_ID`
   - `GHL_BASE_URL`
4. Deploy

### 5. Verify Deployment

Once deployed, you can verify the server is running with all 269 tools:

```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "server": "ghl-mcp-server",
  "version": "1.0.0",
  "tools": 269,
  "endpoint": "/sse"
}
```

## Architecture Overview

The Vercel deployment uses the following structure:

1. **Build Process**: 
   - TypeScript files in `src/` are compiled to JavaScript in `dist/`
   - The build command `npm run build` is automatically run by Vercel

2. **Entry Point**:
   - `/api/server.js` - Vercel serverless function entry point
   - Imports the compiled handler from `dist/vercel-handler.js`

3. **Full Server Implementation**:
   - All 269 GoHighLevel tools are loaded from the various tool modules
   - MCP protocol is fully implemented with SSE transport
   - CORS is configured for ChatGPT integration

## Troubleshooting

### Build Fails
- Ensure Node.js version is 18 or higher
- Check that all dependencies are listed in package.json
- Review build logs in Vercel dashboard

### Missing Tools
- Verify environment variables are set correctly
- Check that the build completed successfully
- Ensure `/api/server.js` is using the full server, not the demo

### Environment Variables Not Working
- In Vercel Dashboard, go to Settings > Environment Variables
- Add each variable separately
- Redeploy after adding variables

### CORS Issues
- The server is configured to accept requests from ChatGPT domains
- For local testing, localhost is also allowed

## What Changed from Demo to Full Server

1. **Routing**: Changed from `/api/index.js` (2 demo tools) to `/api/server.js` (269 tools)
2. **Build Process**: Added TypeScript compilation step
3. **Handler**: Created `vercel-handler.ts` that wraps the full MCP server
4. **Configuration**: Updated `vercel.json` to include build command

## Testing the Deployment

### List All Tools
```bash
curl -X POST https://your-app.vercel.app/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Execute a Tool
```bash
curl -X POST https://your-app.vercel.app/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "ghl_contact_search",
      "arguments": {
        "query": "john"
      }
    },
    "id": 2
  }'
```

## Support

For issues specific to Vercel deployment:
1. Check the Vercel function logs
2. Ensure all environment variables are set
3. Verify the build completed successfully

For general MCP server issues, refer to the main README.md.