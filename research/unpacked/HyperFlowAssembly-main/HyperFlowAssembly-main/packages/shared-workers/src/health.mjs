export function isWorkerUsable(manifest) {
  return manifest?.health?.status === "healthy" || manifest?.health?.status === "degraded";
}
