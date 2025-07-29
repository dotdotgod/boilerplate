// Re-export all schemas for easy access
export * from './user-profile.schema';
export * from './task-creation.schema';
export * from './sentiment-analysis.schema';
export * from './data-extraction.schema';
export * from './chat-response.schema';

// Schema registry for dynamic schema selection
import { userProfileSchema } from './user-profile.schema';
import { taskCreationSchema } from './task-creation.schema';
import { sentimentAnalysisSchema } from './sentiment-analysis.schema';
import { dataExtractionSchema } from './data-extraction.schema';
import { chatResponseSchema } from './chat-response.schema';

export const schemaRegistry = {
  userProfile: userProfileSchema,
  taskCreation: taskCreationSchema,
  sentimentAnalysis: sentimentAnalysisSchema,
  dataExtraction: dataExtractionSchema,
  chatResponse: chatResponseSchema,
} as const;

export type SchemaName = keyof typeof schemaRegistry;
