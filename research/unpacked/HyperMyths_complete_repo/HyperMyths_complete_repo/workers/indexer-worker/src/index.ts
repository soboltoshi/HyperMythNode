import { getDashboardSnapshot } from '@hypermyths/core';

async function main() {
  const snapshot = await getDashboardSnapshot();
  console.log('[indexer-worker] worlds:', snapshot.counts.worlds);
}

void main();
