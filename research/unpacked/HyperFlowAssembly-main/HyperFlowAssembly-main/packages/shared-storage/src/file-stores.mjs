export const STORAGE_ROOTS = {
  projects: ".data/projects",
  assets: ".data/assets",
  results: ".data/results",
  handoffs: ".data/handoffs",
};

export function buildProjectStoragePlan(projectId) {
  return {
    projectRoot: `${STORAGE_ROOTS.projects}/${projectId}`,
    assetRoot: `${STORAGE_ROOTS.assets}/${projectId}`,
    resultRoot: `${STORAGE_ROOTS.results}/${projectId}`,
    handoffRoot: `${STORAGE_ROOTS.handoffs}/${projectId}`,
  };
}
