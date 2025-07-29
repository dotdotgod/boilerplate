import { z } from 'zod';

export const dataExtractionSchema = z.object({
  entities: z
    .array(
      z.object({
        type: z
          .string()
          .describe('Entity type (e.g., person, organization, location)'),
        value: z.string().describe('Entity value'),
        context: z
          .string()
          .optional()
          .describe('Context where entity was found'),
      }),
    )
    .describe('Extracted entities'),
  keyFacts: z
    .array(
      z.object({
        fact: z.string().describe('Key fact or information'),
        confidence: z.number().min(0).max(1).describe('Confidence score'),
      }),
    )
    .describe('Key facts extracted from the text'),
  dates: z
    .array(
      z.object({
        date: z.string().describe('Date in ISO format or descriptive'),
        event: z.string().describe('Associated event or context'),
      }),
    )
    .optional()
    .describe('Important dates mentioned'),
  numbers: z
    .array(
      z.object({
        value: z.number().describe('Numeric value'),
        unit: z.string().optional().describe('Unit of measurement'),
        context: z.string().describe('What the number represents'),
      }),
    )
    .optional()
    .describe('Significant numbers or statistics'),
  summary: z.string().describe('Summary of extracted information'),
});

export type DataExtraction = z.infer<typeof dataExtractionSchema>;
