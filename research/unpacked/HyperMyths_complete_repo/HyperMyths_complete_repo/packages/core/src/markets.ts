import { randomUUID } from 'node:crypto';
import {
  createPredictionMarketInputSchema,
  type CreatePredictionMarketInput,
  type PredictionMarket
} from '@hypermyths/protocol';
import { readStore, writeStore } from '@hypermyths/store';

export async function listPredictionMarkets(): Promise<PredictionMarket[]> {
  const store = await readStore();
  return store.markets;
}

export async function createPredictionMarket(
  input: CreatePredictionMarketInput
): Promise<PredictionMarket> {
  const parsed = createPredictionMarketInputSchema.parse(input);
  const store = await readStore();

  const market: PredictionMarket = {
    id: randomUUID(),
    worldId: parsed.worldId,
    subject: parsed.subject,
    choices: parsed.choices,
    status: 'open'
  };

  store.markets.unshift(market);
  await writeStore(store);

  return market;
}
