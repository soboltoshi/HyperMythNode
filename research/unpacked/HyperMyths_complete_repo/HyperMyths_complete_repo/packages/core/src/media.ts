import { randomUUID } from 'node:crypto';
import {
  queueMediaJobInputSchema,
  type MediaJob,
  type QueueMediaJobInput
} from '@hypermyths/protocol';
import { readStore, writeStore } from '@hypermyths/store';

export async function listMediaJobs(): Promise<MediaJob[]> {
  const store = await readStore();
  return store.mediaJobs;
}

export async function listMediaJobsForTarget(targetId: string): Promise<MediaJob[]> {
  const store = await readStore();
  return store.mediaJobs.filter((job) => job.targetId === targetId);
}

export async function queueMediaJob(input: QueueMediaJobInput): Promise<MediaJob> {
  const parsed = queueMediaJobInputSchema.parse(input);
  const store = await readStore();

  const job: MediaJob = {
    id: randomUUID(),
    targetType: parsed.targetType,
    targetId: parsed.targetId,
    kind: parsed.kind,
    status: 'queued',
    createdAt: new Date().toISOString()
  };

  store.mediaJobs.unshift(job);
  await writeStore(store);
  return job;
}
