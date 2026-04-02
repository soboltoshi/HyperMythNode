import { isWorkerUsable } from "./health.mjs";

export function matchWorkersToTask(registry, taskKind) {
  return [...registry.values()].filter((manifest) => {
    return manifest.supportedTaskKinds.includes(taskKind) && isWorkerUsable(manifest);
  });
}
