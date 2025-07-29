import { z } from 'zod';

export const sentimentAnalysisSchema = z.object({
  sentiment: z
    .enum(['positive', 'negative', 'neutral', 'mixed'])
    .describe('Overall sentiment'),
  confidence: z.number().min(0).max(1).describe('Confidence score (0-1)'),
  emotions: z
    .object({
      joy: z.number().min(0).max(1).optional(),
      anger: z.number().min(0).max(1).optional(),
      fear: z.number().min(0).max(1).optional(),
      sadness: z.number().min(0).max(1).optional(),
      surprise: z.number().min(0).max(1).optional(),
      disgust: z.number().min(0).max(1).optional(),
    })
    .optional()
    .describe('Detected emotions with scores'),
  keywords: z
    .array(z.string())
    .describe('Key words or phrases influencing the sentiment'),
  summary: z.string().optional().describe('Brief summary of the analysis'),
});

export type SentimentAnalysis = z.infer<typeof sentimentAnalysisSchema>;
