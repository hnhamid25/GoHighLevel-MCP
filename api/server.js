/**
 * Vercel API Route Handler
 * This file wraps the compiled TypeScript HTTP server for Vercel deployment
 * Ensures all 269 GoHighLevel tools are available
 */

// Load environment variables
require('dotenv').config();

// Import the compiled HTTP server with fixed routing
let handler;
try {
  const { createHTTPHandler } = require('../dist/vercel-handler-fixed.js');
  handler = createHTTPHandler();
} catch (error) {
  console.error('Failed to initialize server:', error);
  // Provide a fallback handler that shows the error
  handler = (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}

// Export the handler for Vercel
module.exports = handler;