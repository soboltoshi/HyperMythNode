import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getAppConfig } from '@hypermyths/config';
import { storeSchema, type StoreShape } from '@hypermyths/protocol';

function findWorkspaceRoot(start = process.cwd()): string {
  let current = start;

  while (true) {
    const marker = path.join(current, 'pnpm-workspace.yaml');
    if (existsSync(marker)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return start;
    }
    current = parent;
  }
}

function defaultStore(): StoreShape {
  const now = new Date().toISOString();
  return {
    worlds: [
      {
        id: randomUUID(),
        slug: 'genesis',
        title: 'Genesis World',
        type: 'community',
        status: 'active',
        summary: 'First HyperMyths world'
      }
    ],
    session: {
      id: randomUUID(),
      focusType: 'world',
      focusLabel: 'genesis',
      ownerBlock: 'session-kernel',
      active: true,
      startedAt: now,
      expiresAt: new Date(Date.now() + 300_000).toISOString()
    },
    markets: [
      {
        id: randomUUID(),
        subject: 'Which rail matters first for HyperMyths?',
        choices: ['SessionKernel', 'MYTHIV', 'HashMedia'],
        status: 'open'
      }
    ],
    mediaJobs: [
      {
        id: randomUUID(),
        targetType: 'world',
        targetId: 'genesis',
        kind: 'report',
        status: 'queued',
        createdAt: now
      }
    ],
    tasks: [
      {
        id: randomUUID(),
        agentId: 'aghori-public',
        type: 'summarize-world-state',
        status: 'queued',
        context: { world: 'genesis' }
      }
    ]
  };
}

export function getDataFilePath(): string {
  const config = getAppConfig();
  if (config.dataPath) return config.dataPath;

  const root = findWorkspaceRoot();
  return path.join(root, '.hypermyths', 'data.json');
}

export async function readStore(): Promise<StoreShape> {
  const filePath = getDataFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    return storeSchema.parse(JSON.parse(raw));
  } catch {
    const seed = defaultStore();
    await writeStore(seed);
    return seed;
  }
}

export async function writeStore(store: StoreShape): Promise<void> {
  const filePath = getDataFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(store, null, 2), 'utf8');
}
