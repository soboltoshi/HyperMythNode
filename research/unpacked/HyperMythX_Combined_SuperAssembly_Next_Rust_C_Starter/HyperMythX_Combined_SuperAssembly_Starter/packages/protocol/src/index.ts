export type DomainShell =
  | "umbrella"
  | "directory"
  | "cancerhawk"
  | "prediction-group-play"
  | "social"
  | "media"
  | "session-market"
  | "control-plane"
  | "agent-ops"
  | "voxel-vr-world"
  | "local-dev-shell";

export const DOMAIN_REGISTRY: Record<string, DomainShell> = {
  "hypermyths.com": "umbrella",
  "hypermythx.org": "directory",
  "cancerhawk.org": "cancerhawk",
  "outoforder.fun": "prediction-group-play",
  "bolclaw.fun": "social",
  "hashart.fun": "media",
  "camikey.com": "session-market",
  "sessionmint.fun": "control-plane",
  "larpa.fun": "agent-ops",
  "exwhyzee.fun": "voxel-vr-world"
};

export const WALLET_SLOTS = [
  "treasury_wallet",
  "operations_wallet",
  "market_wallet",
  "escrow_wallet"
] as const;

export type WalletSlot = (typeof WALLET_SLOTS)[number];

export interface WalletBinding {
  address: string | null;
  status: "unbound" | "bound" | "simulated";
}

export interface AgentRecord {
  agentId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  walletCluster: Record<WalletSlot, WalletBinding>;
}

export const ADAPTER_REGISTRY = [
  "firebase-app-hosting","firestore","cloud-storage","secret-manager","cloud-run","pubsub",
  "solana-rpc","helius","jupiter","phantom-connect","bnb","base","ethereum",
  "ollama","llama-http","huggingface-inference","openrouter","openai-compatible","nvidia-exec",
  "local-event-bus","websocket-control","nats-compatible","email-edge",
  "sqlite","local-fs-object-store","cloud-mirror","receipt-proof-engine","event-ledger",
  "session-kernel","world-spawn","world-directory","mythiv","hashmedia","agent-mesh",
  "cancerhawk","computation-market","market-settlement","mission-control","interface-router",
  "desktop-world","vr-superbrain-bridge","asimog-governance","tribev2-neuro","obs-browser-overlay",
  "dexscreener","telegram","x-platform","voxel-world","media-renderer","speech","narration",
  "identity-wallet-kernel","chain-router","inference-router","runtime-orchestrator","health-monitor",
  "artifact-cid","audit-log","gossip-membership","raft-finality","operator-shell","builder-agent",
  "hermes-style","automaton-style","agenc-style","quest-submission-shell","desktop-crypto-bridge",
  "policy-engine","config-profile"
] as const;

export function createAgentRecord(id: string, role: string): AgentRecord {
  const now = new Date().toISOString();
  return {
    agentId: id,
    role,
    createdAt: now,
    updatedAt: now,
    walletCluster: Object.fromEntries(
      WALLET_SLOTS.map((slot) => [slot, { address: null, status: "unbound" }])
    ) as Record<WalletSlot, WalletBinding>
  };
}
