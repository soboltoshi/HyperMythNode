import { randomUUID } from 'node:crypto';
import {
  createAgentTaskInputSchema,
  type AgentTask,
  type CreateAgentTaskInput
} from '@hypermyths/protocol';
import { readStore, writeStore } from '@hypermyths/store';

export async function listAgentTasks(): Promise<AgentTask[]> {
  const store = await readStore();
  return store.tasks;
}

export async function createAgentTask(input: CreateAgentTaskInput): Promise<AgentTask> {
  const parsed = createAgentTaskInputSchema.parse(input);
  const store = await readStore();

  const task: AgentTask = {
    id: randomUUID(),
    agentId: parsed.agentId,
    type: parsed.type,
    status: 'queued',
    context: parsed.context
  };

  store.tasks.unshift(task);
  await writeStore(store);
  return task;
}
