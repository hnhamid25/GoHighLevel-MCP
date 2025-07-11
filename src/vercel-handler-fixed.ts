/**
 * Fixed Vercel Handler for GoHighLevel MCP Server
 * Wraps the full MCP server implementation for Vercel deployment
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import type { IncomingMessage, ServerResponse } from 'http';

import { GHLApiClient } from './clients/ghl-api-client';
import { ContactTools } from './tools/contact-tools';
import { ConversationTools } from './tools/conversation-tools';
import { BlogTools } from './tools/blog-tools';
import { OpportunityTools } from './tools/opportunity-tools';
import { CalendarTools } from './tools/calendar-tools';
import { EmailTools } from './tools/email-tools';
import { LocationTools } from './tools/location-tools';
import { EmailISVTools } from './tools/email-isv-tools';
import { SocialMediaTools } from './tools/social-media-tools';
import { MediaTools } from './tools/media-tools';
import { ObjectTools } from './tools/object-tools';
import { AssociationTools } from './tools/association-tools';
import { CustomFieldV2Tools } from './tools/custom-field-v2-tools';
import { WorkflowTools } from './tools/workflow-tools';
import { SurveyTools } from './tools/survey-tools';
import { StoreTools } from './tools/store-tools';
import { ProductsTools } from './tools/products-tools';
import { InvoicesTools } from './tools/invoices-tools';
import { PaymentsTools } from './tools/payments-tools';
import { GHLConfig } from './types/ghl-types';

// Load environment variables
dotenv.config();

/**
 * Create HTTP handler for Vercel with proper tool routing
 */
export function createHTTPHandler() {
  // Initialize MCP server
  const server = new Server(
    {
      name: 'ghl-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Initialize GHL API client
  const config: GHLConfig = {
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

  const ghlClient = new GHLApiClient(config);

  // Initialize all tool modules
  const contactTools = new ContactTools(ghlClient);
  const conversationTools = new ConversationTools(ghlClient);
  const blogTools = new BlogTools(ghlClient);
  const opportunityTools = new OpportunityTools(ghlClient);
  const calendarTools = new CalendarTools(ghlClient);
  const emailTools = new EmailTools(ghlClient);
  const locationTools = new LocationTools(ghlClient);
  const emailISVTools = new EmailISVTools(ghlClient);
  const socialMediaTools = new SocialMediaTools(ghlClient);
  const mediaTools = new MediaTools(ghlClient);
  const objectTools = new ObjectTools(ghlClient);
  const associationTools = new AssociationTools(ghlClient);
  const customFieldV2Tools = new CustomFieldV2Tools(ghlClient);
  const workflowTools = new WorkflowTools(ghlClient);
  const surveyTools = new SurveyTools(ghlClient);
  const storeTools = new StoreTools(ghlClient);
  const productsTools = new ProductsTools(ghlClient);
  const invoicesTools = new InvoicesTools(ghlClient);
  const paymentsTools = new PaymentsTools(ghlClient);

  // Setup list tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.log('[GHL MCP] Listing available tools...');
    
    try {
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
    } catch (error) {
      console.error('[GHL MCP] Error listing tools:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list tools: ${error}`
      );
    }
  });

  // Setup call tool handler with proper routing
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    console.log(`[GHL MCP] Executing tool: ${name}`);

    try {
      let result: any;

      // Route to appropriate tool handler using the same logic as server.ts
      if (isContactTool(name)) {
        result = await contactTools.executeTool(name, args || {});
      } else if (isConversationTool(name)) {
        result = await conversationTools.executeTool(name, args || {});
      } else if (isBlogTool(name)) {
        result = await blogTools.executeTool(name, args || {});
      } else if (isOpportunityTool(name)) {
        result = await opportunityTools.executeTool(name, args || {});
      } else if (isCalendarTool(name)) {
        result = await calendarTools.executeTool(name, args || {});
      } else if (isEmailTool(name)) {
        result = await emailTools.executeTool(name, args || {});
      } else if (isLocationTool(name)) {
        result = await locationTools.executeTool(name, args || {});
      } else if (isEmailISVTool(name)) {
        result = await emailISVTools.executeTool(name, args || {});
      } else if (isSocialMediaTool(name)) {
        result = await socialMediaTools.executeTool(name, args || {});
      } else if (isMediaTool(name)) {
        result = await mediaTools.executeTool(name, args || {});
      } else if (isObjectTool(name)) {
        result = await objectTools.executeTool(name, args || {});
      } else if (isAssociationTool(name)) {
        result = await associationTools.executeAssociationTool(name, args || {});
      } else if (isCustomFieldV2Tool(name)) {
        result = await customFieldV2Tools.executeCustomFieldV2Tool(name, args || {});
      } else if (isWorkflowTool(name)) {
        result = await workflowTools.executeWorkflowTool(name, args || {});
      } else if (isSurveyTool(name)) {
        result = await surveyTools.executeSurveyTool(name, args || {});
      } else if (isStoreTool(name)) {
        result = await storeTools.executeStoreTool(name, args || {});
      } else if (isProductsTool(name)) {
        result = await productsTools.executeProductsTool(name, args || {});
      } else if (isPaymentsTool(name)) {
        result = await paymentsTools.handleToolCall(name, args || {});
      } else if (isInvoicesTool(name)) {
        result = await invoicesTools.handleToolCall(name, args || {});
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
      
      console.log(`[GHL MCP] Tool ${name} executed successfully`);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error(`[GHL MCP] Error executing tool ${name}:`, error);
      
      // Determine appropriate error code
      const errorCode = error instanceof Error && error.message.includes('404') 
        ? ErrorCode.InvalidRequest 
        : ErrorCode.InternalError;
      
      throw new McpError(
        errorCode,
        `Tool execution failed: ${error}`
      );
    }
  });

  // Return Vercel-compatible handler
  return async (req: IncomingMessage, res: ServerResponse) => {
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

    // List tools endpoint
    if (req.url === '/tools' && req.method === 'GET') {
      try {
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

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          tools: allTools,
          count: allTools.length
        }));
        return;
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Failed to list tools' }));
        return;
      }
    }

    // SSE endpoint for MCP
    if (req.url === '/sse') {
      const transport = new SSEServerTransport('/sse', res);
      await server.connect(transport);
      return;
    }

    // 404 for other routes
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  };
}

// Tool name checking functions (copied from server.ts)
function isContactTool(toolName: string): boolean {
  const contactToolNames = [
    'create_contact', 'search_contacts', 'get_contact', 'update_contact',
    'add_contact_tags', 'remove_contact_tags', 'delete_contact',
    'get_contact_tasks', 'create_contact_task', 'get_contact_task', 'update_contact_task',
    'delete_contact_task', 'update_task_completion',
    'get_contact_notes', 'create_contact_note', 'get_contact_note', 'update_contact_note',
    'delete_contact_note',
    'upsert_contact', 'get_duplicate_contact', 'get_contacts_by_business', 'get_contact_appointments',
    'bulk_update_contact_tags', 'bulk_update_contact_business',
    'add_contact_followers', 'remove_contact_followers',
    'add_contact_to_campaign', 'remove_contact_from_campaign', 'remove_contact_from_all_campaigns',
    'add_contact_to_workflow', 'remove_contact_from_workflow'
  ];
  return contactToolNames.includes(toolName);
}

function isConversationTool(toolName: string): boolean {
  const conversationToolNames = [
    'send_sms', 'send_email', 'search_conversations', 'get_conversation',
    'create_conversation', 'update_conversation', 'delete_conversation', 'get_recent_messages',
    'get_email_message', 'get_message', 'upload_message_attachments', 'update_message_status',
    'add_inbound_message', 'add_outbound_call',
    'get_message_recording', 'get_message_transcription', 'download_transcription',
    'cancel_scheduled_message', 'cancel_scheduled_email',
    'live_chat_typing'
  ];
  return conversationToolNames.includes(toolName);
}

function isBlogTool(toolName: string): boolean {
  const blogToolNames = [
    'create_blog_post', 'update_blog_post', 'get_blog_posts', 'get_blog_sites',
    'get_blog_authors', 'get_blog_categories', 'check_url_slug'
  ];
  return blogToolNames.includes(toolName);
}

function isOpportunityTool(toolName: string): boolean {
  const opportunityToolNames = [
    'search_opportunities', 'get_pipelines', 'get_opportunity', 'create_opportunity',
    'update_opportunity_status', 'delete_opportunity', 'update_opportunity', 
    'upsert_opportunity', 'add_opportunity_followers', 'remove_opportunity_followers'
  ];
  return opportunityToolNames.includes(toolName);
}

function isCalendarTool(toolName: string): boolean {
  const calendarToolNames = [
    'get_calendar_groups', 'get_calendars', 'create_calendar', 'get_calendar', 'update_calendar', 
    'delete_calendar', 'get_calendar_events', 'get_free_slots', 'create_appointment', 
    'get_appointment', 'update_appointment', 'delete_appointment', 'create_block_slot', 'update_block_slot'
  ];
  return calendarToolNames.includes(toolName);
}

function isEmailTool(toolName: string): boolean {
  const emailToolNames = [
    'get_email_campaigns', 'create_email_template', 'get_email_templates', 
    'update_email_template', 'delete_email_template'
  ];
  return emailToolNames.includes(toolName);
}

function isLocationTool(toolName: string): boolean {
  const locationToolNames = [
    'search_locations', 'get_location', 'create_location', 'update_location', 'delete_location',
    'get_location_tags', 'create_location_tag', 'get_location_tag', 'update_location_tag', 'delete_location_tag',
    'search_location_tasks',
    'get_location_custom_fields', 'create_location_custom_field', 'get_location_custom_field', 
    'update_location_custom_field', 'delete_location_custom_field',
    'get_location_custom_values', 'create_location_custom_value', 'get_location_custom_value',
    'update_location_custom_value', 'delete_location_custom_value',
    'get_location_templates', 'delete_location_template',
    'get_timezones'
  ];
  return locationToolNames.includes(toolName);
}

function isEmailISVTool(toolName: string): boolean {
  return toolName === 'verify_email';
}

function isSocialMediaTool(toolName: string): boolean {
  const socialMediaToolNames = [
    'search_social_posts', 'create_social_post', 'get_social_post', 'update_social_post',
    'delete_social_post', 'bulk_delete_social_posts',
    'get_social_accounts', 'delete_social_account',
    'upload_social_csv', 'get_csv_upload_status', 'set_csv_accounts',
    'get_social_categories', 'get_social_category', 'get_social_tags', 'get_social_tags_by_ids',
    'start_social_oauth', 'get_platform_accounts'
  ];
  return socialMediaToolNames.includes(toolName);
}

function isMediaTool(toolName: string): boolean {
  const mediaToolNames = [
    'get_media_files', 'upload_media_file', 'delete_media_file'
  ];
  return mediaToolNames.includes(toolName);
}

function isObjectTool(toolName: string): boolean {
  const objectToolNames = [
    'get_all_objects', 'create_object_schema', 'get_object_schema', 'update_object_schema',
    'create_object_record', 'get_object_record', 'update_object_record', 'delete_object_record',
    'search_object_records'
  ];
  return objectToolNames.includes(toolName);
}

function isAssociationTool(toolName: string): boolean {
  const associationToolNames = [
    'ghl_get_all_associations', 'ghl_create_association', 'ghl_get_association_by_id',
    'ghl_update_association', 'ghl_delete_association', 'ghl_get_association_by_key',
    'ghl_get_association_by_object_key', 'ghl_create_relation', 'ghl_get_relations_by_record',
    'ghl_delete_relation'
  ];
  return associationToolNames.includes(toolName);
}

function isCustomFieldV2Tool(toolName: string): boolean {
  const customFieldV2ToolNames = [
    'ghl_get_custom_field_by_id', 'ghl_create_custom_field', 'ghl_update_custom_field',
    'ghl_delete_custom_field', 'ghl_get_custom_fields_by_object_key', 'ghl_create_custom_field_folder',
    'ghl_update_custom_field_folder', 'ghl_delete_custom_field_folder'
  ];
  return customFieldV2ToolNames.includes(toolName);
}

function isWorkflowTool(toolName: string): boolean {
  const workflowToolNames = [
    'ghl_get_workflows'
  ];
  return workflowToolNames.includes(toolName);
}

function isSurveyTool(toolName: string): boolean {
  const surveyToolNames = [
    'ghl_get_surveys',
    'ghl_get_survey_submissions'
  ];
  return surveyToolNames.includes(toolName);
}

function isStoreTool(toolName: string): boolean {
  const storeToolNames = [
    'ghl_create_shipping_zone', 'ghl_list_shipping_zones', 'ghl_get_shipping_zone',
    'ghl_update_shipping_zone', 'ghl_delete_shipping_zone',
    'ghl_get_available_shipping_rates', 'ghl_create_shipping_rate', 'ghl_list_shipping_rates',
    'ghl_get_shipping_rate', 'ghl_update_shipping_rate', 'ghl_delete_shipping_rate',
    'ghl_create_shipping_carrier', 'ghl_list_shipping_carriers', 'ghl_get_shipping_carrier',
    'ghl_update_shipping_carrier', 'ghl_delete_shipping_carrier',
    'ghl_create_store_setting', 'ghl_get_store_setting'
  ];
  return storeToolNames.includes(toolName);
}

function isProductsTool(toolName: string): boolean {
  const productsToolNames = [
    'ghl_create_product', 'ghl_list_products', 'ghl_get_product', 'ghl_update_product',
    'ghl_delete_product', 'ghl_create_price', 'ghl_list_prices', 'ghl_list_inventory',
    'ghl_create_product_collection', 'ghl_list_product_collections'
  ];
  return productsToolNames.includes(toolName);
}

function isPaymentsTool(toolName: string): boolean {
  const paymentsToolNames = [
    'create_whitelabel_integration_provider', 'list_whitelabel_integration_providers',
    'list_orders', 'get_order_by_id',
    'create_order_fulfillment', 'list_order_fulfillments',
    'list_transactions', 'get_transaction_by_id',
    'list_subscriptions', 'get_subscription_by_id',
    'list_coupons', 'create_coupon', 'update_coupon', 'delete_coupon', 'get_coupon',
    'create_custom_provider_integration', 'delete_custom_provider_integration',
    'get_custom_provider_config', 'create_custom_provider_config', 'disconnect_custom_provider_config'
  ];
  return paymentsToolNames.includes(toolName);
}

function isInvoicesTool(toolName: string): boolean {
  const invoicesToolNames = [
    'create_invoice_template', 'list_invoice_templates', 'get_invoice_template', 'update_invoice_template', 'delete_invoice_template',
    'update_invoice_template_late_fees', 'update_invoice_template_payment_methods',
    'create_invoice_schedule', 'list_invoice_schedules', 'get_invoice_schedule', 'update_invoice_schedule', 'delete_invoice_schedule',
    'schedule_invoice_schedule', 'auto_payment_invoice_schedule', 'cancel_invoice_schedule',
    'create_invoice', 'list_invoices', 'get_invoice', 'update_invoice', 'delete_invoice', 'void_invoice', 'send_invoice',
    'record_invoice_payment', 'generate_invoice_number', 'text2pay_invoice', 'update_invoice_last_visited',
    'create_estimate', 'list_estimates', 'update_estimate', 'delete_estimate', 'send_estimate', 'create_invoice_from_estimate',
    'generate_estimate_number', 'update_estimate_last_visited',
    'list_estimate_templates', 'create_estimate_template', 'update_estimate_template', 'delete_estimate_template', 'preview_estimate_template'
  ];
  return invoicesToolNames.includes(toolName);
}