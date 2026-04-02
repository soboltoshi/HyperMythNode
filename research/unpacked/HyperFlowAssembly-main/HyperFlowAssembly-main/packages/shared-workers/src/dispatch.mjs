import { matchWorkersToTask } from "./matcher.mjs";

export function assignWorkerForTask(registry, taskKind) {
  const matches = matchWorkersToTask(registry, taskKind);
  return matches[0] ?? null;
}
