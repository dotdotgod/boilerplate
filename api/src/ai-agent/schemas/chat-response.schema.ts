import { z } from 'zod';

// Schema for structured chat responses
export const chatResponseSchema = z.object({
  content: z.string().describe('The AI assistant response content'),
  reasoning: z
    .string()
    .optional()
    .describe('Internal reasoning for the response'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe('Confidence level of the response'),
  suggestions: z
    .array(z.string())
    .optional()
    .describe('Follow-up suggestions or questions'),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
