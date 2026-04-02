import type { AIRequestContract, AIResponseContract } from '../../../packages/protocol/src/contracts';

export async function runHuggingFace(request: AIRequestContract): Promise<AIResponseContract> {
  if (!process.env.HUGGINGFACE_API_KEY) throw new Error('HUGGINGFACE_API_KEY missing');
  return {
    provider: 'huggingface',
    model: process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
    output: `[huggingface stub] ${request.prompt}`
  };
}
