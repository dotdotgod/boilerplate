import { z } from 'zod';

export const taskCreationSchema = z.object({
  title: z.string().describe('Task title'),
  description: z.string().describe('Detailed task description'),
  priority: z.enum(['low', 'medium', 'high']).describe('Task priority'),
  dueDate: z.string().datetime().optional().describe('Due date in ISO format'),
  assignee: z.string().optional().describe('Person assigned to the task'),
  tags: z.array(z.string()).describe('Task tags or labels'),
  subtasks: z
    .array(
      z.object({
        title: z.string().describe('Subtask title'),
        completed: z.boolean().default(false).describe('Completion status'),
      }),
    )
    .optional()
    .describe('List of subtasks'),
});

export type TaskCreation = z.infer<typeof taskCreationSchema>;
