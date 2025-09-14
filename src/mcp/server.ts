import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { z } from 'zod';
import { McpServer, McpTool } from './types';
import { generate } from '@genkit-ai/ai';

const PORT = Number(process.env.MCP_PORT ?? 9003);

class SimpleMcpServer implements McpServer {
  name: string;
  version: string;
  tools: Map<string, McpTool>;

  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
    this.tools = new Map();
  }

  addTool(tool: McpTool): void {
    this.tools.set(tool.name, tool);
  }

  async handleRequest(request: any, context: any): Promise<any> {
    return { success: true };
  }

  getToolsList(): McpTool[] {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      execute: tool.execute
    }));
  }

  async callTool(name: string, input: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return await tool.execute(input);
  }
}

function addSanitizationTool(
  server: SimpleMcpServer,
  name: string,
  description: string,
  systemPrompt: string
) {
  server.addTool({
    name,
    description,
    inputSchema: z.object({ text: z.string() }),
    outputSchema: z.object({ sanitizedText: z.string() }),
    execute: async ({ text }) => {
      try {
        // Mock implementation for demo - in production this would use the real AI model
        let sanitized = text;
        
        if (name === 'anonymize_pii') {
          sanitized = text
            .replace(/[A-Z][a-z]+ [A-Z][a-z]+/g, '[NAME]')
            .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
            .replace(/\+?[\d\s()-]{10,}/g, '[PHONE]')
            .replace(/\b\d{1,5}\s+[\w\s]+,\s*[\w\s]+,\s*[A-Z]{2}\s+\d{5}/g, '[ADDRESS]')
            .replace(/\d{3}-\d{2}-\d{4}/g, '[SSN]')
            .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '[DOB]');
        } else if (name === 'redact_financial') {
          sanitized = text
            .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_NUMBER]')
            .replace(/\b[A-Z]{2}\d{2}\s?[A-Z]{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}\b/g, '[IBAN]')
            .replace(/\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g, '[CRYPTO_ADDRESS]')
            .replace(/\b\d{12,20}\b/g, '[ACCOUNT_NUMBER]');
        } else if (name === 'remove_sensitive_data') {
          sanitized = text
            .replace(/mongodb:\/\/[^:\s]+:[^@\s]+@[^\s]+/g, 'mongodb://[REDACTED]:[REDACTED]@[HOST]')
            .replace(/sk-[a-zA-Z0-9]+/g, '[API_KEY]')
            .replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[JWT_TOKEN]')
            .replace(/ssh-rsa\s+[A-Za-z0-9+/=]+/g, 'ssh-rsa [SSH_KEY]');
        }
        
        return { sanitizedText: sanitized };
      } catch (error) {
        console.error(`Error in tool ${name}:`, error);
        return { sanitizedText: `Error processing text: ${error}` };
      }
    },
  });
}

const server = new SimpleMcpServer('SanitizeAIServer', '1.0.0');

addSanitizationTool(
  server,
  'anonymize_pii',
  'Anonymises names, emails, phone numbers, addresses, dates of birth, etc.',
  'You are a PII anonymiser. Replace all personally identifiable information with generic placeholders like [NAME], [EMAIL], [PHONE], [ADDRESS], etc. Return only the anonymised text without any explanations.'
);

addSanitizationTool(
  server,
  'redact_financial',
  'Redacts IBAN, credit-card numbers, crypto wallets, sort codes, etc.',
  'You are a financial-data redactor. Replace all financial information like credit card numbers, IBANs, account numbers, crypto wallets with [REDACTED] or specific placeholders like [CARD_NUMBER], [IBAN], etc. Return only the redacted text without any explanations.'
);

addSanitizationTool(
  server,
  'remove_sensitive_data',
  'Removes or redacts any sensitive information including passwords, API keys, secrets, etc.',
  'You are a sensitive data remover. Replace all sensitive information like passwords, API keys, tokens, secrets with [REDACTED] or appropriate placeholders. Return only the cleaned text without any explanations.'
);

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/tools', (req, res) => {
  res.json({ tools: server.getToolsList() });
});

app.post('/call-tool', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    const result = await server.callTool(name, args);
    res.json(result);
  } catch (error: any) {
    console.error('Tool call error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/mcp', (req, res, next) => {
  server
    .handleRequest(req.body, { sessionId: req.ip })
    .then((resp) => res.json(resp))
    .catch(next);
});

createServer(app).listen(PORT, () =>
  console.log(`[MCP] SanitizeAIServer listening on :${PORT}`)
);