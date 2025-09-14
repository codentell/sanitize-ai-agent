import { z } from 'zod';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  execute: (input: any) => Promise<any>;
}

export interface McpClient {
  connect(config: { url: string; transport: string }): Promise<void>;
  listTools(): Promise<{ tools: McpTool[] }>;
  callTool(params: { name: string; arguments: any }): Promise<any>;
}

export interface McpServer {
  name: string;
  version: string;
  tools: Map<string, McpTool>;
  addTool(tool: McpTool): void;
  handleRequest(request: any, context: any): Promise<any>;
}