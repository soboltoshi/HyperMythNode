export const MESH_CONTRACT_VERSION = "2026-04-01";

export function createNodeManifestRecord(manifest) {
  return {
    version: MESH_CONTRACT_VERSION,
    kind: "node_manifest",
    manifest,
  };
}

export function createTrustPolicyRecord(policy) {
  return {
    version: MESH_CONTRACT_VERSION,
    kind: "trust_policy",
    policy,
  };
}
