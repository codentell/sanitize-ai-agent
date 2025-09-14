'use server';

import { sanitizeTextWithMCP } from '@/ai/flows/sanitize-text-with-mcp';

export async function getSanitizedTextAction(data: {
  text: string;
  sanitizationRequest: string;
}) {
  try {
    const result = await sanitizeTextWithMCP(data);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in sanitization:', error);
    return { success: false, error: error.message || 'An error occurred during sanitization' };
  }
}