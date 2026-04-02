import { createAgentRecord, ADAPTER_REGISTRY } from '../packages/protocol/index.mjs';

const agent = createAgentRecord('asimog-agent', 'builder-governance-shell');
if (ADAPTER_REGISTRY.length !== 69) {
  throw new Error(`Expected 69 adapters, got ${ADAPTER_REGISTRY.length}`);
}
if (!agent.walletCluster.operations_wallet) {
  throw new Error('operations_wallet missing');
}
console.log('[smoke:test] ok');
