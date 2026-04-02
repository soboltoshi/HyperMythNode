import { SURFACE_APP_IDS, SURFACE_DEFINITIONS, SHARED_SHELL_REGIONS, SURFACE_PAGE_KINDS, SURFACE_SHELL_KINDS } from "../../shared-types/src/surfaces.mjs";

export const UI_SHELL_REGIONS = SHARED_SHELL_REGIONS;
export const UI_PAGE_KINDS = SURFACE_PAGE_KINDS;
export const UI_SHELL_KINDS = SURFACE_SHELL_KINDS;

export const SURFACE_SHELL_DEFINITIONS = Object.fromEntries(
  SURFACE_APP_IDS.map((appId) => {
    const surface = SURFACE_DEFINITIONS[appId];
    return [
      appId,
      {
        appId,
        displayLabel: surface.displayLabel,
        shellKind: surface.shellKind,
        navigationSections: surface.navigationSections,
        shellRegions: surface.shellRegions,
        pageKinds: surface.pageKinds,
      },
    ];
  }),
);

export function getSurfaceShellDefinition(appId) {
  const shell = SURFACE_SHELL_DEFINITIONS[appId];
  if (!shell) {
    throw new Error(`Unknown surface shell: ${appId}`);
  }

  return shell;
}
