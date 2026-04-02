export const ADAPTER_REGISTRY = [
  {
    "id": "firebase-app-hosting-adapter",
    "category": "platform",
    "purpose": "Primary web deployment adapter for Firebase App Hosting.",
    "status": "locked"
  },
  {
    "id": "firestore-adapter",
    "category": "storage",
    "purpose": "Cloud metadata store adapter.",
    "status": "locked"
  },
  {
    "id": "cloud-storage-adapter",
    "category": "storage",
    "purpose": "Artifact mirror adapter for cloud object storage.",
    "status": "locked"
  },
  {
    "id": "secret-manager-adapter",
    "category": "security",
    "purpose": "Managed secret access adapter.",
    "status": "locked"
  },
  {
    "id": "cloud-run-adapter",
    "category": "platform",
    "purpose": "Cloud worker/runtime deployment adapter.",
    "status": "locked"
  },
  {
    "id": "pubsub-adapter",
    "category": "messaging",
    "purpose": "Cloud event fanout adapter.",
    "status": "locked"
  },
  {
    "id": "gcp-service-identity-adapter",
    "category": "security",
    "purpose": "Workload/service identity bridge for GCP.",
    "status": "locked"
  },
  {
    "id": "sqlite-adapter",
    "category": "storage",
    "purpose": "Local-first durable metadata store.",
    "status": "locked"
  },
  {
    "id": "local-fs-object-store-adapter",
    "category": "storage",
    "purpose": "Content-addressed local artifact storage.",
    "status": "locked"
  },
  {
    "id": "event-log-segment-adapter",
    "category": "ledger",
    "purpose": "Append-only event segment storage.",
    "status": "locked"
  },
  {
    "id": "receipt-proof-adapter",
    "category": "ledger",
    "purpose": "Receipt hashing and signature plumbing.",
    "status": "locked"
  },
  {
    "id": "ollama-adapter",
    "category": "inference",
    "purpose": "Local model runtime adapter.",
    "status": "locked"
  },
  {
    "id": "llamacpp-http-adapter",
    "category": "inference",
    "purpose": "Local llama.cpp style HTTP inference adapter.",
    "status": "locked"
  },
  {
    "id": "openrouter-adapter",
    "category": "inference",
    "purpose": "Remote model routing via OpenRouter.",
    "status": "locked"
  },
  {
    "id": "huggingface-inference-adapter",
    "category": "inference",
    "purpose": "Remote inference adapter for Hugging Face providers.",
    "status": "locked"
  },
  {
    "id": "generic-openai-compatible-adapter",
    "category": "inference",
    "purpose": "Generic adapter for OpenAI-compatible inference APIs.",
    "status": "locked"
  },
  {
    "id": "nvidia-nim-adapter",
    "category": "inference",
    "purpose": "GPU inference adapter for NVIDIA NIM endpoints.",
    "status": "locked"
  },
  {
    "id": "vertex-ai-adapter",
    "category": "inference",
    "purpose": "Google Vertex AI inference adapter.",
    "status": "locked"
  },
  {
    "id": "tribev2-adapter",
    "category": "research",
    "purpose": "Neuro-perception adapter around TribeV2 research inference.",
    "status": "locked"
  },
  {
    "id": "solana-rpc-adapter",
    "category": "chain",
    "purpose": "Solana RPC bridge.",
    "status": "locked"
  },
  {
    "id": "helius-adapter",
    "category": "chain",
    "purpose": "Helius RPC/webhook bridge.",
    "status": "locked"
  },
  {
    "id": "jupiter-adapter",
    "category": "chain",
    "purpose": "Jupiter quote/route bridge.",
    "status": "locked"
  },
  {
    "id": "phantom-connect-adapter",
    "category": "chain",
    "purpose": "Phantom wallet connection boundary.",
    "status": "locked"
  },
  {
    "id": "bnb-adapter",
    "category": "chain",
    "purpose": "BNB chain execution boundary.",
    "status": "locked"
  },
  {
    "id": "base-adapter",
    "category": "chain",
    "purpose": "Base execution boundary.",
    "status": "locked"
  },
  {
    "id": "ethereum-adapter",
    "category": "chain",
    "purpose": "Ethereum execution boundary.",
    "status": "locked"
  },
  {
    "id": "dexscreener-adapter",
    "category": "market-data",
    "purpose": "Market and chart data adapter.",
    "status": "locked"
  },
  {
    "id": "hyperliquid-adapter",
    "category": "market-data",
    "purpose": "Perps/market execution information adapter.",
    "status": "locked"
  },
  {
    "id": "nats-jetstream-adapter",
    "category": "messaging",
    "purpose": "Durable internal pub/sub adapter.",
    "status": "locked"
  },
  {
    "id": "websocket-control-plane-adapter",
    "category": "messaging",
    "purpose": "Interactive control-plane socket adapter.",
    "status": "locked"
  },
  {
    "id": "email-edge-adapter",
    "category": "messaging",
    "purpose": "Human audit and external email boundary.",
    "status": "locked"
  },
  {
    "id": "telegram-bot-adapter",
    "category": "messaging",
    "purpose": "Telegram agent bridge.",
    "status": "locked"
  },
  {
    "id": "x-social-adapter",
    "category": "messaging",
    "purpose": "X/Twitter publishing and read boundary.",
    "status": "locked"
  },
  {
    "id": "discord-adapter",
    "category": "messaging",
    "purpose": "Discord bridge.",
    "status": "locked"
  },
  {
    "id": "obs-browser-overlay-adapter",
    "category": "media",
    "purpose": "OBS browser-source overlay adapter.",
    "status": "locked"
  },
  {
    "id": "stream-scene-adapter",
    "category": "media",
    "purpose": "Scene routing/state adapter for live surfaces.",
    "status": "locked"
  },
  {
    "id": "media-renderer-adapter",
    "category": "media",
    "purpose": "Render execution adapter for videos/images.",
    "status": "locked"
  },
  {
    "id": "image-generation-adapter",
    "category": "media",
    "purpose": "Image generation provider boundary.",
    "status": "locked"
  },
  {
    "id": "speech-synthesis-adapter",
    "category": "media",
    "purpose": "Speech/TTS adapter.",
    "status": "locked"
  },
  {
    "id": "narration-adapter",
    "category": "media",
    "purpose": "Narration and commentary runtime boundary.",
    "status": "locked"
  },
  {
    "id": "voxel-world-adapter",
    "category": "game",
    "purpose": "Voxel world backend adapter for ExWhyZee.",
    "status": "locked"
  },
  {
    "id": "desktop-agent-bridge-adapter",
    "category": "bridge",
    "purpose": "Desktop execution agent bridge for crypto/device control.",
    "status": "locked"
  },
  {
    "id": "vr-superbrain-bridge-adapter",
    "category": "bridge",
    "purpose": "VR superbrain IPC bridge to desktop agent.",
    "status": "locked"
  },
  {
    "id": "meta-quest-vrc-adapter",
    "category": "vr",
    "purpose": "Submission/readiness adapter for Quest VRC workflows.",
    "status": "locked"
  },
  {
    "id": "world-directory-index-adapter",
    "category": "world",
    "purpose": "Registry indexing adapter.",
    "status": "locked"
  },
  {
    "id": "world-spawn-template-adapter",
    "category": "world",
    "purpose": "World template loading adapter.",
    "status": "locked"
  },
  {
    "id": "mission-proof-adapter",
    "category": "mission",
    "purpose": "Useful-work proof ingestion adapter.",
    "status": "locked"
  },
  {
    "id": "compute-metering-adapter",
    "category": "compute",
    "purpose": "Minute-level compute usage metering adapter.",
    "status": "locked"
  },
  {
    "id": "gpu-telemetry-adapter",
    "category": "compute",
    "purpose": "GPU telemetry and health adapter.",
    "status": "locked"
  },
  {
    "id": "cgroups-enforcement-adapter",
    "category": "compute",
    "purpose": "Linux cgroups enforcement boundary.",
    "status": "locked"
  },
  {
    "id": "systemd-launch-adapter",
    "category": "runtime",
    "purpose": "systemd-based workload launch adapter.",
    "status": "locked"
  },
  {
    "id": "docker-compose-node-adapter",
    "category": "runtime",
    "purpose": "Local multi-service node launch adapter.",
    "status": "locked"
  },
  {
    "id": "kubernetes-gpu-adapter",
    "category": "runtime",
    "purpose": "GPU/Kubernetes runtime adapter.",
    "status": "locked"
  },
  {
    "id": "conway-provisioning-adapter",
    "category": "runtime",
    "purpose": "Conway server provisioning boundary.",
    "status": "locked"
  },
  {
    "id": "hermes-agent-adapter",
    "category": "agent",
    "purpose": "Hermes-style autonomous agent boundary.",
    "status": "locked"
  },
  {
    "id": "elder-plinius-style-adapter",
    "category": "agent",
    "purpose": "Strategic/constitutional agent style adapter.",
    "status": "locked"
  },
  {
    "id": "automaton-adapter",
    "category": "agent",
    "purpose": "Automaton adapter boundary.",
    "status": "locked"
  },
  {
    "id": "agenc-adapter",
    "category": "agent",
    "purpose": "AgenC adapter boundary.",
    "status": "locked"
  },
  {
    "id": "eliza-agent-adapter",
    "category": "agent",
    "purpose": "Eliza runtime bridge.",
    "status": "locked"
  },
  {
    "id": "local-process-agent-adapter",
    "category": "agent",
    "purpose": "Local process worker agent bridge.",
    "status": "locked"
  },
  {
    "id": "remote-worker-agent-adapter",
    "category": "agent",
    "purpose": "Remote worker pool agent bridge.",
    "status": "locked"
  },
  {
    "id": "policy-engine-adapter",
    "category": "governance",
    "purpose": "Policy evaluation adapter.",
    "status": "locked"
  },
  {
    "id": "risk-engine-adapter",
    "category": "governance",
    "purpose": "Risk scoring adapter.",
    "status": "locked"
  },
  {
    "id": "governance-review-adapter",
    "category": "governance",
    "purpose": "Human/agent governance review adapter.",
    "status": "locked"
  },
  {
    "id": "audit-transparency-adapter",
    "category": "governance",
    "purpose": "Transparency log / audit proof adapter.",
    "status": "locked"
  },
  {
    "id": "wallet-cluster-adapter",
    "category": "wallet",
    "purpose": "Four-wallet identity cluster adapter.",
    "status": "locked"
  },
  {
    "id": "escrow-settlement-adapter",
    "category": "wallet",
    "purpose": "Escrow and settlement boundary.",
    "status": "locked"
  },
  {
    "id": "prediction-market-adapter",
    "category": "market",
    "purpose": "Prediction market execution adapter.",
    "status": "locked"
  },
  {
    "id": "futarchy-round-adapter",
    "category": "market",
    "purpose": "Futarchy round lifecycle adapter.",
    "status": "locked"
  }
];

export function getAdapter(id){ return ADAPTER_REGISTRY.find((a)=>a.id===id) || null; }
