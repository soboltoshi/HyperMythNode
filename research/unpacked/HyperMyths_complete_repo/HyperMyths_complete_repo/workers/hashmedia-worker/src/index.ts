import { listMediaJobs } from '@hypermyths/core';

async function main() {
  const jobs = await listMediaJobs();
  console.log('[hashmedia-worker] jobs:', jobs.length);
}

void main();
