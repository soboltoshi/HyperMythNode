
export const DOMAIN_REGISTRY = {
  'hypermyths.com': 'umbrella',
  'hypermythx.org': 'directory',
  'cancerhawk.org': 'cancerhawk',
  'outoforder.fun': 'prediction-group-play',
  'bolclaw.fun': 'social',
  'hashart.fun': 'media',
  'camikey.com': 'session-market',
  'sessionmint.fun': 'control-plane',
  'larpa.fun': 'agent-ops',
  'exwhyzee.fun': 'voxel-vr-world'
};

export const WALLET_SLOTS = ['treasury_wallet', 'operations_wallet', 'market_wallet', 'escrow_wallet'];

export function createAgentRecord(id, role) {
  const now = new Date().toISOString();
  return {
    agentId: id,
    role,
    createdAt: now,
    updatedAt: now,
    walletCluster: Object.fromEntries(WALLET_SLOTS.map((slot) => [slot, { address: null, status: 'unbound' }]))
  };
}
