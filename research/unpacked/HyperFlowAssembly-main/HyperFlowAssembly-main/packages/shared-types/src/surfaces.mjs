export const SURFACE_AUTH_MODES = [
  "account_first",
  "wallet_first",
  "admin_bypass",
];

export const SURFACE_PAYMENT_MODES = [
  "subscription_ready",
  "crypto_only",
  "admin_bypass",
];

export const SURFACE_VISIBILITY_MODES = [
  "private",
  "public",
  "reviewable",
];

export const SURFACE_SHELL_KINDS = [
  "private_studio",
  "public_discovery",
  "broker_console",
  "operator_console",
];

export const SURFACE_PAGE_KINDS = [
  "landing",
  "collection",
  "intake",
  "workspace",
  "detail",
  "review",
  "cockpit",
  "admin",
  "network",
  "telemetry",
];

export const SHARED_SHELL_REGIONS = [
  "topbar",
  "primary_nav",
  "context_nav",
  "hero",
  "main",
  "sidebar",
  "status_rail",
  "footer",
];

function defineRoute(route) {
  return {
    publicAccess: true,
    ...route,
    governingBoxes: [...route.governingBoxes],
  };
}

function defineSurface(surface) {
  return {
    shellRegions: [...SHARED_SHELL_REGIONS],
    navigationSections: [...surface.navigationSections],
    pageKinds: [...surface.pageKinds],
    primaryBoxes: [...surface.primaryBoxes],
    routes: surface.routes.map(defineRoute),
    ...surface,
  };
}

export const SURFACE_DEFINITIONS = {
  "larpa-web": defineSurface({
    appId: "larpa-web",
    siteId: "larpa",
    displayLabel: "LARPA",
    registryLabel: "LARPA",
    nodeOwner: "larpa",
    role: "Private-first customer studio for family, gift, remake, and premium custom work.",
    authMode: "account_first",
    paymentMode: "subscription_ready",
    defaultVisibility: "private",
    shellKind: "private_studio",
    navigationSections: ["discover", "family", "remakes", "custom", "reviews", "projects", "cockpit"],
    pageKinds: ["landing", "collection", "intake", "workspace", "review", "cockpit"],
    primaryBoxes: [
      "MediaSurfaceBox",
      "GameplayBox",
      "WorldDirectoryBox",
      "WorldSpawnBox",
    ],
    routes: [
      {
        path: "/",
        role: "private-first home",
        pageKind: "landing",
        governingBoxes: ["MediaSurfaceBox", "WorldDirectoryBox"],
      },
      {
        path: "/gift-family",
        role: "family and gift intake",
        pageKind: "collection",
        governingBoxes: ["MediaSurfaceBox", "GameplayBox"],
      },
      {
        path: "/music-remakes",
        role: "music-led intake",
        pageKind: "collection",
        governingBoxes: ["MediaSurfaceBox", "GameplayBox"],
      },
      {
        path: "/custom",
        role: "premium custom briefing",
        pageKind: "intake",
        governingBoxes: ["MediaSurfaceBox", "WorldSpawnBox"],
      },
      {
        path: "/reviews",
        role: "approved public reviews",
        pageKind: "review",
        governingBoxes: ["MediaSurfaceBox", "PublicReadinessBox"],
      },
      {
        path: "/cockpit",
        role: "operator cockpit",
        pageKind: "cockpit",
        publicAccess: false,
        governingBoxes: ["SessionKernelBox", "PublicReadinessBox"],
      },
      {
        path: "/login",
        role: "account and admin sign-in",
        pageKind: "intake",
        governingBoxes: ["IdentityClusterBox"],
      },
      {
        path: "/project/[id]",
        role: "private project workspace",
        pageKind: "workspace",
        publicAccess: false,
        governingBoxes: ["MediaSurfaceBox", "SessionKernelBox"],
      },
      {
        path: "/generator/[slug]",
        role: "structured generator intake",
        pageKind: "intake",
        governingBoxes: ["MediaSurfaceBox", "WorldSpawnBox"],
      },
    ],
  }),
  "hashart-web": defineSurface({
    appId: "hashart-web",
    siteId: "hashart",
    displayLabel: "HASHART",
    registryLabel: "HASHART",
    nodeOwner: "hashart",
    role: "Public-first crypto-native discovery network for packaged public creation.",
    authMode: "wallet_first",
    paymentMode: "crypto_only",
    defaultVisibility: "public",
    shellKind: "public_discovery",
    navigationSections: ["discover", "trending", "shady", "create", "gallery", "reviews", "cockpit"],
    pageKinds: ["landing", "collection", "intake", "detail", "review", "cockpit"],
    primaryBoxes: [
      "MediaSurfaceBox",
      "GameplayBox",
      "WorldDirectoryBox",
      "AgentMeshBox",
    ],
    routes: [
      {
        path: "/",
        role: "public discovery home",
        pageKind: "landing",
        governingBoxes: ["MediaSurfaceBox", "WorldDirectoryBox"],
      },
      {
        path: "/trending",
        role: "packaged generator merch rail",
        pageKind: "collection",
        governingBoxes: ["MediaSurfaceBox", "GameplayBox"],
      },
      {
        path: "/shady",
        role: "absurd slop lab",
        pageKind: "collection",
        governingBoxes: ["MediaSurfaceBox", "GameplayBox"],
      },
      {
        path: "/create",
        role: "public creation intake",
        pageKind: "intake",
        governingBoxes: ["MediaSurfaceBox", "WorldSpawnBox"],
      },
      {
        path: "/gallery",
        role: "published gallery",
        pageKind: "collection",
        governingBoxes: ["MediaSurfaceBox", "WorldDirectoryBox"],
      },
      {
        path: "/cockpit",
        role: "operator cockpit",
        pageKind: "cockpit",
        publicAccess: false,
        governingBoxes: ["SessionKernelBox", "PublicReadinessBox"],
      },
      {
        path: "/generator/[slug]",
        role: "generator landing",
        pageKind: "intake",
        governingBoxes: ["MediaSurfaceBox", "WorldSpawnBox"],
      },
      {
        path: "/video/[id]",
        role: "published item detail",
        pageKind: "detail",
        governingBoxes: ["MediaSurfaceBox", "PublicReadinessBox"],
      },
      {
        path: "/reviews/[id]",
        role: "public review thread",
        pageKind: "review",
        governingBoxes: ["MediaSurfaceBox", "PublicReadinessBox"],
      },
    ],
  }),
  "mythiv-web": defineSurface({
    appId: "mythiv-web",
    siteId: "mythiv",
    displayLabel: "MYTHIV",
    registryLabel: "MYTHIV",
    nodeOwner: "mythiv",
    role: "Broker and settlement operator surface for cross-node commerce.",
    authMode: "admin_bypass",
    paymentMode: "admin_bypass",
    defaultVisibility: "reviewable",
    shellKind: "broker_console",
    navigationSections: ["offers", "requests", "handoffs", "network", "status"],
    pageKinds: ["landing", "collection", "network", "telemetry", "admin"],
    primaryBoxes: [
      "ComputationMarketBox",
      "RouterEconomicsBox",
      "HyperliquidConvergenceBox",
      "TreasuryBox",
    ],
    routes: [
      {
        path: "/",
        role: "broker home",
        pageKind: "landing",
        governingBoxes: ["ComputationMarketBox", "RouterEconomicsBox"],
      },
      {
        path: "/offers",
        role: "provider offers",
        pageKind: "collection",
        governingBoxes: ["ComputationMarketBox"],
      },
      {
        path: "/requests",
        role: "buyer requests",
        pageKind: "collection",
        governingBoxes: ["ComputationMarketBox"],
      },
      {
        path: "/handoffs",
        role: "portability and transfer state",
        pageKind: "admin",
        governingBoxes: ["RouterEconomicsBox", "TreasuryBox"],
      },
      {
        path: "/network",
        role: "network topology visibility",
        pageKind: "network",
        governingBoxes: ["ComputationMarketBox", "WorldDirectoryBox"],
      },
      {
        path: "/status",
        role: "broker and settlement telemetry",
        pageKind: "telemetry",
        governingBoxes: ["TreasuryBox", "RouterEconomicsBox"],
      },
    ],
  }),
  "tianezha-admin": defineSurface({
    appId: "tianezha-admin",
    siteId: "tianezha-admin",
    displayLabel: "Tianezha Admin",
    registryLabel: "Tianezha Admin",
    nodeOwner: "tianezha",
    role: "Operational cockpit for governance, audit, and publication gates.",
    authMode: "admin_bypass",
    paymentMode: "admin_bypass",
    defaultVisibility: "private",
    shellKind: "operator_console",
    navigationSections: ["cockpit", "governance", "moderation", "routing", "publication"],
    pageKinds: ["landing", "cockpit", "admin", "telemetry"],
    primaryBoxes: [
      "SessionKernelBox",
      "GovernanceFlowBox",
      "PublicReadinessBox",
      "ArbiterBox",
      "ModelSovereigntyBox",
    ],
    routes: [
      {
        path: "/",
        role: "operator landing",
        pageKind: "landing",
        governingBoxes: ["SessionKernelBox"],
      },
      {
        path: "/cockpit",
        role: "unified operational cockpit",
        pageKind: "cockpit",
        governingBoxes: ["SessionKernelBox", "TianezhaSuperBrainBox"],
      },
      {
        path: "/governance",
        role: "governance controls",
        pageKind: "admin",
        governingBoxes: ["GovernanceFlowBox"],
      },
      {
        path: "/moderation",
        role: "moderation and visibility review",
        pageKind: "admin",
        governingBoxes: ["PublicReadinessBox", "ArbiterBox"],
      },
      {
        path: "/routing",
        role: "public/private routing audit",
        pageKind: "telemetry",
        governingBoxes: ["TianezhaSuperBrainBox", "PrivateSuperBrainBox"],
      },
      {
        path: "/publication",
        role: "publication gate",
        pageKind: "admin",
        governingBoxes: ["PublicReadinessBox", "ArchivistBox"],
      },
    ],
  }),
};

export const SURFACE_APP_IDS = Object.keys(SURFACE_DEFINITIONS);

export function getSurfaceDefinition(appId) {
  const surface = SURFACE_DEFINITIONS[appId];
  if (!surface) {
    throw new Error(`Unknown surface app id: ${appId}`);
  }

  return surface;
}

export function toSiteManifest(surface) {
  return {
    appId: surface.appId,
    label: surface.displayLabel,
    nodeOwner: surface.nodeOwner,
    authMode: surface.authMode,
    paymentMode: surface.paymentMode,
    defaultVisibility: surface.defaultVisibility,
    primaryBoxes: surface.primaryBoxes,
    routeRoots: surface.routes.map((route) => route.path),
  };
}

export function toRoutesFile(surface) {
  return surface.routes.map((route) => route.path);
}

export function toSiteDefinition(surface) {
  return {
    appId: surface.appId,
    siteId: surface.siteId,
    displayLabel: surface.displayLabel,
    role: surface.role,
    authMode: surface.authMode,
    paymentMode: surface.paymentMode,
    defaultVisibility: surface.defaultVisibility,
    shellKind: surface.shellKind,
    navigationSections: surface.navigationSections,
    shellRegions: surface.shellRegions,
    pageKinds: surface.pageKinds,
    routes: surface.routes.map((route) => ({
      path: route.path,
      role: route.role,
      publicAccess: route.publicAccess,
      pageKind: route.pageKind,
      governingBoxes: route.governingBoxes,
    })),
  };
}

export function renderRoutesRegistry(definitions = SURFACE_DEFINITIONS) {
  const lines = [
    "| Surface | Route | Role | Governing Boxes |",
    "|---|---|---|---|",
  ];

  for (const surface of Object.values(definitions)) {
    for (const route of surface.routes) {
      lines.push(
        `| ${surface.registryLabel} | \`${route.path}\` | ${route.role} | ${route.governingBoxes.join(", ")} |`,
      );
    }
  }

  return `${lines.join("\n")}\n`;
}
