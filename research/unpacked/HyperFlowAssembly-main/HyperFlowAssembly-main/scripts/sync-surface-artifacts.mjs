import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SURFACE_APP_IDS,
  SURFACE_DEFINITIONS,
  renderRoutesRegistry,
  toRoutesFile,
  toSiteManifest,
} from "../packages/shared-types/src/surfaces.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function writeSurfaceArtifacts(appId) {
  const surface = SURFACE_DEFINITIONS[appId];
  const appDir = path.join(ROOT, "apps", appId, "app");

  await mkdir(appDir, { recursive: true });
  await writeFile(path.join(appDir, "site.manifest.json"), formatJson(toSiteManifest(surface)), "utf8");
  await writeFile(path.join(appDir, "routes.json"), formatJson(toRoutesFile(surface)), "utf8");
}

async function main() {
  for (const appId of SURFACE_APP_IDS) {
    await writeSurfaceArtifacts(appId);
  }

  await writeFile(
    path.join(ROOT, "world", "registries", "routes.md"),
    renderRoutesRegistry(),
    "utf8",
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
