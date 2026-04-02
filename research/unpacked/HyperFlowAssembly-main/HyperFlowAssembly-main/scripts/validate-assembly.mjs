import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  SURFACE_APP_IDS,
  SURFACE_AUTH_MODES,
  SURFACE_DEFINITIONS,
  SURFACE_PAYMENT_MODES,
  SURFACE_VISIBILITY_MODES,
  renderRoutesRegistry,
  toRoutesFile,
  toSiteDefinition,
  toSiteManifest,
} from "../packages/shared-types/src/surfaces.mjs";
import { NODE_IDS, NODE_ROLES } from "../packages/shared-types/src/node.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function normalizeMarkdown(value) {
  return value.replace(/\r\n/g, "\n").trim();
}

function normalizeJson(value) {
  return JSON.stringify(value);
}

function parseMarkdownTable(markdown) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2)
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((row) => row.length > 1 && row[0]);
}

function parsePathList(value) {
  return value
    .split(",")
    .map((item) => item.trim().replace(/^`|`$/g, ""))
    .filter(Boolean);
}

async function readJson(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  const raw = await readFile(absolutePath, "utf8");
  return JSON.parse(raw);
}

async function pathExists(relativePath) {
  try {
    await stat(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function discoverDirectoriesWith(relativeRoot, expectedRelativeFile) {
  const absoluteRoot = path.join(ROOT, relativeRoot);
  const entries = await readdir(absoluteRoot, { withFileTypes: true });
  const matches = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const relativePath = path.join(relativeRoot, entry.name, expectedRelativeFile);
    if (await pathExists(relativePath)) {
      matches.push(entry.name);
    }
  }

  return matches.sort();
}

async function loadAppState(appId) {
  const manifestPath = path.join("apps", appId, "app", "site.manifest.json");
  const routesPath = path.join("apps", appId, "app", "routes.json");
  const siteModulePath = path.join(ROOT, "apps", appId, "lib", "site.mjs");
  const siteModule = await import(pathToFileURL(siteModulePath).href);

  return {
    appId,
    manifest: await readJson(manifestPath),
    routes: await readJson(routesPath),
    siteDefinition: siteModule.siteDefinition,
  };
}

async function loadNodeState(nodeId) {
  return {
    nodeId,
    manifest: await readJson(path.join("nodes", nodeId, "node.manifest.json")),
    trustPolicy: await readJson(path.join("nodes", nodeId, "trust-policy.json")),
  };
}

function compareValue(actual, expected, label, failures) {
  if (normalizeJson(actual) !== normalizeJson(expected)) {
    failures.push(label);
  }
}

function validateSurfaceDefinition(surface, failures) {
  if (!SURFACE_AUTH_MODES.includes(surface.authMode)) {
    failures.push(`Invalid surface auth mode for ${surface.appId}: ${surface.authMode}`);
  }

  if (!SURFACE_PAYMENT_MODES.includes(surface.paymentMode)) {
    failures.push(`Invalid surface payment mode for ${surface.appId}: ${surface.paymentMode}`);
  }

  if (!SURFACE_VISIBILITY_MODES.includes(surface.defaultVisibility)) {
    failures.push(`Invalid surface visibility mode for ${surface.appId}: ${surface.defaultVisibility}`);
  }

  const routeSet = new Set();
  for (const route of surface.routes) {
    if (routeSet.has(route.path)) {
      failures.push(`Duplicate route path in surface definition ${surface.appId}: ${route.path}`);
    }
    routeSet.add(route.path);
  }
}

function validateNodeState(nodeStates, failures) {
  const nodeMap = new Map(nodeStates.map((nodeState) => [nodeState.nodeId, nodeState]));

  for (const nodeState of nodeStates) {
    const { manifest, trustPolicy } = nodeState;

    if (!NODE_IDS.includes(manifest.nodeId)) {
      failures.push(`Unknown node id in manifest: ${manifest.nodeId}`);
    }

    if (!NODE_ROLES.includes(manifest.role)) {
      failures.push(`Invalid node role for ${manifest.nodeId}: ${manifest.role}`);
    }

    if (trustPolicy.nodeId !== manifest.nodeId) {
      failures.push(`Trust policy nodeId mismatch for ${manifest.nodeId}`);
    }

    const seenPeers = new Set();
    for (const trustedPeer of trustPolicy.trustedPeers) {
      if (trustedPeer.peerId === manifest.nodeId) {
        failures.push(`Node ${manifest.nodeId} cannot trust itself.`);
      }

      if (seenPeers.has(trustedPeer.peerId)) {
        failures.push(`Duplicate trusted peer ${trustedPeer.peerId} in ${manifest.nodeId}`);
      }
      seenPeers.add(trustedPeer.peerId);

      if (!nodeMap.has(trustedPeer.peerId)) {
        failures.push(`Unknown peer ${trustedPeer.peerId} in trust policy for ${manifest.nodeId}`);
        continue;
      }

      const reverseTrust = nodeMap
        .get(trustedPeer.peerId)
        .trustPolicy.trustedPeers.some((peer) => peer.peerId === manifest.nodeId);

      if (!reverseTrust) {
        failures.push(`Missing bilateral trust between ${manifest.nodeId} and ${trustedPeer.peerId}`);
      }
    }
  }
}

async function validateRegistryPaths(registryPath, pathColumnIndex, failures, label) {
  const rows = parseMarkdownTable(await readFile(path.join(ROOT, registryPath), "utf8"));

  for (const row of rows) {
    const paths = parsePathList(row[pathColumnIndex]);
    for (const relativePath of paths) {
      if (!(await pathExists(relativePath))) {
        failures.push(`${label} path missing: ${relativePath}`);
      }
    }
  }
}

export async function validateAssembly() {
  const boxes = parseMarkdownTable(
    await readFile(path.join(ROOT, "world/registries/boxes.md"), "utf8"),
  ).map((row) => row[0]);
  const runtimeOwners = parseMarkdownTable(
    await readFile(path.join(ROOT, "world/registries/runtime-owners.md"), "utf8"),
  ).map((row) => row[0]);

  const discoveredAppIds = await discoverDirectoriesWith("apps", path.join("app", "site.manifest.json"));
  const discoveredNodeIds = await discoverDirectoriesWith("nodes", "node.manifest.json");

  const appStates = await Promise.all(discoveredAppIds.map(loadAppState));
  const nodeStates = await Promise.all(discoveredNodeIds.map(loadNodeState));

  const failures = [];

  if (boxes.length !== 25) {
    failures.push(`Expected 25 boxes, found ${boxes.length}`);
  }

  const missingRuntimeOwners = boxes.filter((box) => !runtimeOwners.includes(box));
  if (missingRuntimeOwners.length > 0) {
    failures.push(`Missing runtime owners for: ${missingRuntimeOwners.join(", ")}`);
  }

  compareValue(discoveredAppIds, [...SURFACE_APP_IDS].sort(), "Discovered apps do not match surface definitions", failures);

  for (const surface of Object.values(SURFACE_DEFINITIONS)) {
    validateSurfaceDefinition(surface, failures);
  }

  for (const appState of appStates) {
    const surface = SURFACE_DEFINITIONS[appState.appId];
    if (!surface) {
      failures.push(`No surface definition for app ${appState.appId}`);
      continue;
    }

    compareValue(appState.manifest, toSiteManifest(surface), `Manifest mismatch for ${appState.appId}`, failures);
    compareValue(appState.routes, toRoutesFile(surface), `Route file mismatch for ${appState.appId}`, failures);
    compareValue(appState.siteDefinition, toSiteDefinition(surface), `siteDefinition mismatch for ${appState.appId}`, failures);

    for (const box of appState.manifest.primaryBoxes) {
      if (!boxes.includes(box)) {
        failures.push(`Unknown box reference in ${appState.appId}: ${box}`);
      }
    }
  }

  const generatedRoutesRegistry = renderRoutesRegistry();
  const actualRoutesRegistry = await readFile(path.join(ROOT, "world/registries/routes.md"), "utf8");
  if (normalizeMarkdown(generatedRoutesRegistry) !== normalizeMarkdown(actualRoutesRegistry)) {
    failures.push("world/registries/routes.md is out of sync with SURFACE_DEFINITIONS");
  }

  compareValue(discoveredNodeIds, [...NODE_IDS].sort(), "Discovered nodes do not match node contract ids", failures);
  validateNodeState(nodeStates, failures);

  await validateRegistryPaths("world/registries/workspace-packages.md", 0, failures, "Workspace package");
  await validateRegistryPaths("world/registries/nodes.md", 2, failures, "Node registry");
  await validateRegistryPaths("world/registries/extraction-ledger.md", 2, failures, "Extraction ledger destination");

  return {
    boxCount: boxes.length,
    runtimeOwnerCount: runtimeOwners.length,
    appCount: appStates.length,
    nodeCount: nodeStates.length,
    surfaceCount: SURFACE_APP_IDS.length,
    failureCount: failures.length,
    failures,
  };
}

async function main() {
  const summaryMode = process.argv.includes("--summary");
  const result = await validateAssembly();

  if (summaryMode) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.failures.length > 0) {
    throw new Error(result.failures.join("\n"));
  }

  console.log("Assembly validation passed.");
  console.log(`Boxes: ${result.boxCount}`);
  console.log(`Runtime owners: ${result.runtimeOwnerCount}`);
  console.log(`Apps: ${result.appCount}`);
  console.log(`Nodes: ${result.nodeCount}`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
