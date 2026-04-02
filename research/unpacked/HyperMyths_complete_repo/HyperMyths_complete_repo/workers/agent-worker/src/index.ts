import { listAgentTasks } from '@hypermyths/core';

async function main() {
  const tasks = await listAgentTasks();
  console.log('[agent-worker] tasks:', tasks.length);
}

void main();
