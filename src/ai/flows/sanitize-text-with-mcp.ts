import { SimpleMcpClient } from '../../mcp/client';
import { z } from 'zod';
import { generate } from '@genkit-ai/ai';

const inputSchema = z.object({
  text: z.string(),
  sanitizationRequest: z.string(),
});
type Input = z.infer<typeof inputSchema>;

const outputSchema = z.object({
  sanitizedText: z.string(),
  toolUsed: z.string(),
});
type Output = z.infer<typeof outputSchema>;

export async function sanitizeTextWithMCP(
  raw: Input,
  onProgress?: (step: string) => void
): Promise<Output> {
  onProgress?.('mcp_connect_start');
  const client = new SimpleMcpClient();

  const url = `http://localhost:${process.env.MCP_PORT ?? 9003}`;
  await client.connect({ url, transport: 'http' });
  onProgress?.('mcp_connect_finish');

  onProgress?.('list_tools');
  const toolList = await client.listTools();

  onProgress?.('select_tool');
  const { text: userText, sanitizationRequest } = inputSchema.parse(raw);

  const toolDescriptions = toolList.tools.map((t) => ` - ${t.name}: ${t.description}`).join('\n');

  // Mock AI tool selection for demo - in production this would use the real AI model
  let selectedToolName = 'anonymize_pii'; // default
  
  const requestLower = sanitizationRequest.toLowerCase();
  if (requestLower.includes('financial') || requestLower.includes('credit') || requestLower.includes('payment') || requestLower.includes('iban') || requestLower.includes('card')) {
    selectedToolName = 'redact_financial';
  } else if (requestLower.includes('password') || requestLower.includes('key') || requestLower.includes('secret') || requestLower.includes('credential') || requestLower.includes('token')) {
    selectedToolName = 'remove_sensitive_data';
  } else if (requestLower.includes('pii') || requestLower.includes('personal') || requestLower.includes('name') || requestLower.includes('email') || requestLower.includes('phone')) {
    selectedToolName = 'anonymize_pii';
  }

  const selectedTool = toolList.tools.find(t => t.name === selectedToolName);
  
  if (!selectedTool) {
    // Fallback to first available tool if selection fails
    const fallbackTool = toolList.tools[0];
    onProgress?.('tool_exec_start');
    const result = await client.callTool({
      name: fallbackTool.name,
      arguments: { text: userText },
    });
    onProgress?.('tool_exec_finish');
    
    return {
      sanitizedText: result.sanitizedText || 'Error: No result returned',
      toolUsed: fallbackTool.name,
    };
  }

  onProgress?.('tool_exec_start');
  const result = await client.callTool({
    name: selectedTool.name,
    arguments: { text: userText },
  });
  onProgress?.('tool_exec_finish');

  return {
    sanitizedText: result.sanitizedText || 'Error: No result returned',
    toolUsed: selectedTool.name,
  };
}