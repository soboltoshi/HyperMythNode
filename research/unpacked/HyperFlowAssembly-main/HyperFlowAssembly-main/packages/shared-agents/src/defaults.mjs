export const AGENT_RUNTIME_CLASSES = {
  mythiv42_internal_mesh: {
    runtime: "conway_only",
    escalationPath: "TianezhaSuperBrainBox",
  },
  public_world_agents: {
    runtime: "cheapest_approved_runtime",
    escalationPath: "TianezhaSuperBrainBox",
  },
  private_superbrain_backend: {
    runtime: "google_cloud_default_optional_conway",
    escalationPath: "TianezhaSuperBrainBox",
  },
};

export const PUBLIC_ROUTER_POLICY = {
  publicRouterId: "tianezha_public_router",
  privateBrainDirectAccess: false,
  subAgentDirectPrivateAccess: false,
};
