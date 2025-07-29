import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string().describe('Full name of the user'),
  email: z.string().email().describe('Email address'),
  age: z.number().optional().describe('Age of the user'),
  preferences: z
    .object({
      language: z.string().describe('Preferred language'),
      theme: z.enum(['light', 'dark']).describe('UI theme preference'),
    })
    .describe('User preferences'),
  tags: z.array(z.string()).describe('User interests or tags'),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
