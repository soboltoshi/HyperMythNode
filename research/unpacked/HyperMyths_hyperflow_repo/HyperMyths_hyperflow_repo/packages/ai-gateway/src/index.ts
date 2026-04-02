import type { AIRequestContract, AIResponseContract } from '../../protocol/src/contracts';
import { runOllama } from '../../../adapters/ollama/src';
import { runOpenRouter } from '../../../adapters/openrouter/src';
import { runHuggingFace } from '../../../adapters/huggingface/src';

export async function routeAI(request: AIRequestContract): Promise<AIResponseContract> {
  const order = request.prefer
    ? [request.prefer, ...['ollama', 'openrouter', 'huggingface'].filter(p => p !== request.prefer)]
    : ['ollama', 'openrouter', 'huggingface'];

  for (const provider of order) {
    try {
      if (provider === 'ollama') return await runOllama(request);
      if (provider === 'openrouter') return await runOpenRouter(request);
      if (provider === 'huggingface') return await runHuggingFace(request);
    } catch {
      continue;
    }
  }
  throw new Error('No AI provider available');
}
