import { z } from 'zod';

export const worldSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  type: z.enum(['token', 'creator', 'mission', 'community', 'notoken']),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
  summary: z.string().default('')
});

export const createWorldInputSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  type: z.enum(['token', 'creator', 'mission', 'community', 'notoken']).default('community'),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
  summary: z.string().default('')
});

export const sessionStateSchema = z.object({
  id: z.string(),
  focusType: z.string(),
  focusLabel: z.string(),
  ownerBlock: z.string(),
  active: z.boolean(),
  startedAt: z.string(),
  expiresAt: z.string()
});

export const bindSessionInputSchema = z.object({
  focusType: z.string().default('world'),
  focusLabel: z.string().default('genesis'),
  ownerBlock: z.string().default('session-kernel'),
  leaseSeconds: z.number().int().positive().max(86400).default(300)
});

export const predictionMarketSchema = z.object({
  id: z.string(),
  worldId: z.string().optional(),
  subject: z.string(),
  choices: z.array(z.string()).min(2),
  status: z.enum(['draft', 'open', 'resolved', 'cancelled'])
});

export const createPredictionMarketInputSchema = z.object({
  worldId: z.string().optional(),
  subject: z.string().min(3),
  choices: z.array(z.string()).min(2)
});

export const mediaJobSchema = z.object({
  id: z.string(),
  targetType: z.enum(['world', 'stream', 'mission', 'launch']),
  targetId: z.string(),
  kind: z.enum(['clip', 'report', 'chart', 'video']),
  status: z.enum(['queued', 'processing', 'complete', 'failed']),
  createdAt: z.string()
});

export const queueMediaJobInputSchema = z.object({
  targetType: z.enum(['world', 'stream', 'mission', 'launch']).default('world'),
  targetId: z.string().min(1),
  kind: z.enum(['clip', 'report', 'chart', 'video']).default('report')
});

export const agentTaskSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  type: z.string(),
  status: z.enum(['queued', 'running', 'done', 'failed']),
  context: z.record(z.any()).optional()
});

export const createAgentTaskInputSchema = z.object({
  agentId: z.string().min(1),
  type: z.string().min(1),
  context: z.record(z.any()).optional()
});

export const storeSchema = z.object({
  worlds: z.array(worldSchema),
  session: sessionStateSchema,
  markets: z.array(predictionMarketSchema),
  mediaJobs: z.array(mediaJobSchema),
  tasks: z.array(agentTaskSchema)
});

export type World = z.infer<typeof worldSchema>;
export type CreateWorldInput = z.infer<typeof createWorldInputSchema>;
export type SessionState = z.infer<typeof sessionStateSchema>;
export type BindSessionInput = z.infer<typeof bindSessionInputSchema>;
export type PredictionMarket = z.infer<typeof predictionMarketSchema>;
export type CreatePredictionMarketInput = z.infer<typeof createPredictionMarketInputSchema>;
export type MediaJob = z.infer<typeof mediaJobSchema>;
export type QueueMediaJobInput = z.infer<typeof queueMediaJobInputSchema>;
export type AgentTask = z.infer<typeof agentTaskSchema>;
export type CreateAgentTaskInput = z.infer<typeof createAgentTaskInputSchema>;
export type StoreShape = z.infer<typeof storeSchema>;
