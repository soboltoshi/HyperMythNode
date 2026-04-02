import { PUBLIC_ROUTER_POLICY } from "./defaults.mjs";

function defaultNow() {
  return Date.now();
}

function buildId(prefix, now, randomSource) {
  return `${prefix}-${now().toString(36)}-${randomSource().toString(36).slice(2, 8)}`;
}

export function needsPrivateBrain(request) {
  return Boolean(request.privilegedRequired || request.privateBrainRequired);
}

export function buildRoutingRecord(request, options = {}) {
  const now = options.now ?? defaultNow;
  const randomSource = options.randomSource ?? Math.random;

  return {
    routingRequestId: buildId("route", now, randomSource),
    sourceContext: request.sourceContext,
    taskClass: request.taskClass,
    destinationType: request.destinationType,
    privilegedRequired: Boolean(request.privilegedRequired),
    publicSafe: Boolean(request.publicSafe),
    assignedSubagent: request.assignedSubagent ?? null,
    privateBrainRequired: needsPrivateBrain(request),
    finalOutputStatus: "pending",
    auditRef: PUBLIC_ROUTER_POLICY.publicRouterId,
  };
}
