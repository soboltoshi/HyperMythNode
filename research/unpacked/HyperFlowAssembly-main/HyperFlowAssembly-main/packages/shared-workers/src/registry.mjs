export function createWorkerRegistry() {
  return new Map();
}

export function registerWorker(registry, manifest) {
  registry.set(manifest.workerId, manifest);
  return manifest;
}

export function listWorkers(registry) {
  return [...registry.values()];
}
