import { McpClient, McpTool } from './types';

export class SimpleMcpClient implements McpClient {
  private baseUrl = '';
  private tools: McpTool[] = [];

  async connect(config: { url: string; transport: string }): Promise<void> {
    this.baseUrl = config.url;
    
    try {
      const response = await fetch(`${this.baseUrl}/tools`);
      const data = await response.json();
      this.tools = data.tools || [];
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      throw error;
    }
  }

  async listTools(): Promise<{ tools: McpTool[] }> {
    return { tools: this.tools };
  }

  async callTool(params: { name: string; arguments: any }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/call-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Tool call failed:', error);
      throw error;
    }
  }
}