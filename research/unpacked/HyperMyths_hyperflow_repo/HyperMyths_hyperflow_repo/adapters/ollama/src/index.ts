import type { AIRequestContract, AIResponseContract } from '../../../packages/protocol/src/contracts';

export async function runOllama(request: AIRequestContract): Promise<AIResponseContract> {
  return {
    provider: 'ollama',
    model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
    output: `[ollama stub] ${request.prompt}`
  };
}
