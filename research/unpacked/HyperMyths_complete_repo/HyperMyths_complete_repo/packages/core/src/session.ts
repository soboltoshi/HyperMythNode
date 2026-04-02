import { randomUUID } from 'node:crypto';
import {
  bindSessionInputSchema,
  type BindSessionInput,
  type SessionState
} from '@hypermyths/protocol';
import { readStore, writeStore } from '@hypermyths/store';

export async function getSessionSnapshot(): Promise<SessionState> {
  const store = await readStore();
  return store.session;
}

export async function bindSessionState(input: BindSessionInput): Promise<SessionState> {
  const parsed = bindSessionInputSchema.parse(input);
  const store = await readStore();

  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + parsed.leaseSeconds * 1000);

  store.session = {
    id: randomUUID(),
    focusType: parsed.focusType,
    focusLabel: parsed.focusLabel,
    ownerBlock: parsed.ownerBlock,
    active: true,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  await writeStore(store);
  return store.session;
}
