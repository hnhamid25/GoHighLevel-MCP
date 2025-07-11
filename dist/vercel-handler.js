"use strict";
/**
 * Vercel Handler for GoHighLevel MCP Server
 * Wraps the full MCP server implementation for Vercel deployment
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHTTPHandler = createHTTPHandler;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const dotenv = __importStar(require("dotenv"));
const ghl_api_client_1 = require("./clients/ghl-api-client");
const contact_tools_1 = require("./tools/contact-tools");
const conversation_tools_1 = require("./tools/conversation-tools");
const blog_tools_1 = require("./tools/blog-tools");
const opportunity_tools_1 = require("./tools/opportunity-tools");
const calendar_tools_1 = require("./tools/calendar-tools");
const email_tools_1 = require("./tools/email-tools");
const location_tools_1 = require("./tools/location-tools");
const email_isv_tools_1 = require("./tools/email-isv-tools");
const social_media_tools_1 = require("./tools/social-media-tools");
const media_tools_1 = require("./tools/media-tools");
const object_tools_1 = require("./tools/object-tools");
const association_tools_1 = require("./tools/association-tools");
const custom_field_v2_tools_1 = require("./tools/custom-field-v2-tools");
const workflow_tools_1 = require("./tools/workflow-tools");
const survey_tools_1 = require("./tools/survey-tools");
const store_tools_1 = require("./tools/store-tools");
const products_tools_1 = require("./tools/products-tools");
const invoices_tools_1 = require("./tools/invoices-tools");
const payments_tools_1 = require("./tools/payments-tools");
// Load environment variables
dotenv.config();
/**
 * Create HTTP handler for Vercel
 */
function createHTTPHandler() {
    // Initialize all components
    const server = new index_js_1.Server({
        name: 'ghl-mcp-server',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Initialize GHL API client
    const config = {
        accessToken: process.env.GHL_API_KEY || '',
        baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
        version: '2021-07-28',
        locationId: process.env.GHL_LOCATION_ID || ''
    };
    if (!config.accessToken) {
        console.error('GHL_API_KEY environment variable is required');
    }
    if (!config.locationId) {
        console.error('GHL_LOCATION_ID environment variable is required');
    }
    const ghlClient = new ghl_api_client_1.GHLApiClient(config);
    // Initialize all tool modules
    const contactTools = new contact_tools_1.ContactTools(ghlClient);
    const conversationTools = new conversation_tools_1.ConversationTools(ghlClient);
    const blogTools = new blog_tools_1.BlogTools(ghlClient);
    const opportunityTools = new opportunity_tools_1.OpportunityTools(ghlClient);
    const calendarTools = new calendar_tools_1.CalendarTools(ghlClient);
    const emailTools = new email_tools_1.EmailTools(ghlClient);
    const locationTools = new location_tools_1.LocationTools(ghlClient);
    const emailISVTools = new email_isv_tools_1.EmailISVTools(ghlClient);
    const socialMediaTools = new social_media_tools_1.SocialMediaTools(ghlClient);
    const mediaTools = new media_tools_1.MediaTools(ghlClient);
    const objectTools = new object_tools_1.ObjectTools(ghlClient);
    const associationTools = new association_tools_1.AssociationTools(ghlClient);
    const customFieldV2Tools = new custom_field_v2_tools_1.CustomFieldV2Tools(ghlClient);
    const workflowTools = new workflow_tools_1.WorkflowTools(ghlClient);
    const surveyTools = new survey_tools_1.SurveyTools(ghlClient);
    const storeTools = new store_tools_1.StoreTools(ghlClient);
    const productsTools = new products_tools_1.ProductsTools(ghlClient);
    const invoicesTools = new invoices_tools_1.InvoicesTools(ghlClient);
    const paymentsTools = new payments_tools_1.PaymentsTools(ghlClient);
    // Setup MCP handlers
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
        console.log('[GHL MCP] Listing available tools...');
        try {
            // Collect all tool definitions
            const allTools = [
                ...contactTools.getToolDefinitions(),
                ...conversationTools.getToolDefinitions(),
                ...blogTools.getToolDefinitions(),
                ...opportunityTools.getToolDefinitions(),
                ...calendarTools.getToolDefinitions(),
                ...emailTools.getToolDefinitions(),
                ...locationTools.getToolDefinitions(),
                ...emailISVTools.getToolDefinitions(),
                ...socialMediaTools.getTools(),
                ...mediaTools.getToolDefinitions(),
                ...objectTools.getToolDefinitions(),
                ...associationTools.getTools(),
                ...customFieldV2Tools.getTools(),
                ...workflowTools.getTools(),
                ...surveyTools.getTools(),
                ...storeTools.getTools(),
                ...productsTools.getTools(),
                ...invoicesTools.getTools(),
                ...paymentsTools.getTools()
            ];
            console.log(`[GHL MCP] Registered ${allTools.length} tools total`);
            return {
                tools: allTools
            };
        }
        catch (error) {
            console.error('[GHL MCP] Error listing tools:', error);
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to list tools: ${error}`);
        }
    });
    // Setup tool execution handler
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        console.log(`[GHL MCP] Executing tool: ${name}`);
        try {
            // Route to appropriate tool handler based on tool name prefix
            let result;
            if (name.startsWith('ghl_contact_')) {
                result = await contactTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_conversation_')) {
                result = await conversationTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_blog_')) {
                result = await blogTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_opportunity_')) {
                result = await opportunityTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_calendar_')) {
                result = await calendarTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_email_')) {
                result = await emailTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_location_')) {
                result = await locationTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_email_isv_')) {
                result = await emailISVTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_social_media_')) {
                result = await socialMediaTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_media_')) {
                result = await mediaTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_object_')) {
                result = await objectTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_association_')) {
                result = await associationTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_custom_field_v2_')) {
                result = await customFieldV2Tools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_workflow_')) {
                result = await workflowTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_survey_')) {
                result = await surveyTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_store_')) {
                result = await storeTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_products_')) {
                result = await productsTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_invoices_')) {
                result = await invoicesTools.executeTool(name, args || {});
            }
            else if (name.startsWith('ghl_payments_')) {
                result = await paymentsTools.executeTool(name, args || {});
            }
            else {
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            console.error(`[GHL MCP] Error executing tool ${name}:`, error);
            if (error instanceof types_js_1.McpError) {
                throw error;
            }
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${error}`);
        }
    });
    // Return Vercel-compatible handler
    return async (req, res) => {
        console.log(`[GHL MCP] ${req.method} ${req.url}`);
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
        // Handle preflight
        if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
        }
        // Health check
        if (req.url === '/' || req.url === '/health') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: 'healthy',
                server: 'ghl-mcp-server',
                version: '1.0.0',
                tools: 269,
                endpoint: '/sse'
            }));
            return;
        }
        // SSE endpoint
        if (req.url === '/sse') {
            const transport = new sse_js_1.SSEServerTransport(req, res);
            await server.connect(transport);
            return;
        }
        // 404 for other routes
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
    };
}
