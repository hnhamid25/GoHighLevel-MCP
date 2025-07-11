/**
 * Vercel API Route - GoHighLevel MCP Server
 * Direct implementation without TypeScript compilation
 */

// Load the pre-compiled handler
let handler;
try {
  // Try to load the compiled handler
  handler = require('../dist/vercel-handler-fixed.js').createHTTPHandler();
} catch (error) {
  console.error('Failed to load compiled handler:', error);
  // Fallback to a simple health check response
  handler = (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      status: 'unhealthy'
    });
  };
}

// Export for Vercel
module.exports = handler;