import { randomUUID } from 'node:crypto';
import {
  createWorldInputSchema,
  type CreateWorldInput,
  type World
} from '@hypermyths/protocol';
import { readStore, writeStore } from '@hypermyths/store';

export async function listWorlds(): Promise<World[]> {
  const store = await readStore();
  return store.worlds;
}

export async function getWorldBySlug(slug: string): Promise<World | undefined> {
  const store = await readStore();
  return store.worlds.find((world) => world.slug === slug);
}

export async function createWorld(input: CreateWorldInput): Promise<World> {
  const parsed = createWorldInputSchema.parse(input);
  const store = await readStore();

  const existing = store.worlds.find((world) => world.slug === parsed.slug);
  if (existing) {
    throw new Error(`World with slug "${parsed.slug}" already exists.`);
  }

  const world: World = {
    id: randomUUID(),
    ...parsed
  };

  store.worlds.unshift(world);
  await writeStore(store);
  return world;
}
