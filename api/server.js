/**
 * Vercel API Route Handler
 * This file wraps the compiled TypeScript HTTP server for Vercel deployment
 * Ensures all 269 GoHighLevel tools are available
 */

// Import the compiled HTTP server with fixed routing
const { createHTTPHandler } = require('../dist/vercel-handler-fixed.js');

// Export the handler for Vercel
module.exports = createHTTPHandler();