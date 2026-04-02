export type WorldContract = {
  id: string;
  slug: string;
  type: 'token' | 'creator' | 'mission' | 'community' | 'notoken';
  status: 'draft' | 'active' | 'paused' | 'archived';
  title: string;
};

export type SessionContract = {
  id: string;
  type: string;
  active: boolean;
  startedAt?: string;
  expiresAt?: string;
  ownerBlock: string;
};

export type ComputeQuoteContract = {
  id: string;
  buyer: string;
  seller?: string;
  units: number;
  score?: number;
  accepted: boolean;
  price?: number;
};

export type PredictionMarketContract = {
  id: string;
  subject: string;
  choices: string[];
  status: 'draft' | 'open' | 'resolved' | 'cancelled';
};

export type LivestreamRoomContract = {
  id: string;
  worldId?: string;
  title: string;
  live: boolean;
};

export type MediaJobContract = {
  id: string;
  targetType: 'world' | 'stream' | 'mission' | 'launch';
  targetId: string;
  kind: 'clip' | 'report' | 'chart' | 'video';
  status: 'queued' | 'processing' | 'complete' | 'failed';
};

export type AgentTaskContract = {
  id: string;
  agentId: string;
  type: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  context?: Record<string, unknown>;
};

export type AIRequestContract = {
  task: 'chat' | 'summarize' | 'classify' | 'extract' | 'rewrite';
  prompt: string;
  system?: string;
  prefer?: 'ollama' | 'openrouter' | 'huggingface';
};

export type AIResponseContract = {
  provider: 'ollama' | 'openrouter' | 'huggingface';
  model: string;
  output: string;
};
