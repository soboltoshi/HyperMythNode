import type { AIRequestContract, AIResponseContract } from '../../../packages/protocol/src/contracts';

export async function runOpenRouter(request: AIRequestContract): Promise<AIResponseContract> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY missing');
  return {
    provider: 'openrouter',
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4.1-mini',
    output: `[openrouter stub] ${request.prompt}`
  };
}
