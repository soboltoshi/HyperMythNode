import test from "node:test";
import assert from "node:assert/strict";

import { buildRoutingRecord, needsPrivateBrain } from "../packages/shared-agents/src/brain.mjs";
import { canTransitionJob } from "../packages/shared-jobs/src/lifecycle.mjs";
import { createRouterLedger, recordAssignment, recordIntent, recordQuote, recordReceipt } from "../packages/shared-router/src/ledger.mjs";
import { assignWorkerForTask } from "../packages/shared-workers/src/dispatch.mjs";
import { registerWorker, createWorkerRegistry } from "../packages/shared-workers/src/registry.mjs";
import { SURFACE_APP_IDS } from "../packages/shared-types/src/surfaces.mjs";
import { SURFACE_SHELL_DEFINITIONS } from "../packages/shared-ui/src/index.mjs";
import { validateAssembly } from "../scripts/validate-assembly.mjs";

function deterministicOptions() {
  let tick = 1000;
  return {
    now: () => ++tick,
    randomSource: () => 0.123456789,
  };
}

test("assembly validation enforces current scaffold parity", async () => {
  const result = await validateAssembly();

  assert.equal(result.failureCount, 0);
  assert.equal(result.surfaceCount, 4);
  assert.equal(result.nodeCount, 4);
});

test("shared ui shell contract covers every surface", () => {
  assert.deepEqual(Object.keys(SURFACE_SHELL_DEFINITIONS).sort(), [...SURFACE_APP_IDS].sort());
  assert.equal(SURFACE_SHELL_DEFINITIONS["larpa-web"].shellKind, "private_studio");
  assert.equal(SURFACE_SHELL_DEFINITIONS["tianezha-admin"].shellKind, "operator_console");
});

test("private routing is explicit and public-safe routing stays public", () => {
  assert.equal(needsPrivateBrain({ privilegedRequired: true }), true);
  assert.equal(needsPrivateBrain({ publicSafe: true }), false);

  const privateRecord = buildRoutingRecord({
    sourceContext: "admin",
    taskClass: "strategy",
    destinationType: "private_brain",
    privilegedRequired: true,
    publicSafe: false,
  }, deterministicOptions());

  const publicRecord = buildRoutingRecord({
    sourceContext: "hashart",
    taskClass: "gallery_refresh",
    destinationType: "public_worker",
    publicSafe: true,
  }, deterministicOptions());

  assert.equal(privateRecord.privateBrainRequired, true);
  assert.equal(privateRecord.auditRef, "tianezha_public_router");
  assert.equal(publicRecord.privateBrainRequired, false);
  assert.match(privateRecord.routingRequestId, /^route-/);
});

test("job lifecycle rejects invalid jumps", () => {
  assert.equal(canTransitionJob("draft", "queued"), true);
  assert.equal(canTransitionJob("draft", "published"), false);
  assert.equal(canTransitionJob("queued", "assembling"), false);
  assert.equal(canTransitionJob("planning", "published"), false);
  assert.equal(canTransitionJob("reviewable", "published"), true);
});

test("router ledger validates provenance and sequencing", () => {
  const ledger = createRouterLedger();
  const options = deterministicOptions();

  assert.throws(() => {
    recordIntent(ledger, {
      sourceApp: "hashart-web",
      category: "compute",
      requestedCapability: "image_generation",
      maxBudgetUsd: 15,
      settlementLane: "treasury",
      provenance: {},
    }, options);
  }, /provenance/i);

  const intent = recordIntent(ledger, {
    sourceApp: "hashart-web",
    category: "compute",
    requestedCapability: "image_generation",
    maxBudgetUsd: 15,
    settlementLane: "treasury",
    provenance: { source: "test" },
  }, options);

  assert.throws(() => {
    recordQuote(ledger, {
      intentId: "missing-intent",
      providerId: "hashart",
      amountUsd: 10,
      leadTimeSeconds: 180,
    }, options);
  }, /Unknown intent/);

  const quote = recordQuote(ledger, {
    intentId: intent.intentId,
    providerId: "hashart",
    amountUsd: 10,
    leadTimeSeconds: 180,
  }, options);

  assert.throws(() => {
    recordAssignment(ledger, {
      intentId: intent.intentId,
      acceptedQuoteId: "missing-quote",
      providerId: "hashart",
    }, options);
  }, /Unknown quote/);

  const assignment = recordAssignment(ledger, {
    intentId: intent.intentId,
    acceptedQuoteId: quote.quoteId,
    providerId: "hashart",
  }, options);

  assert.throws(() => {
    recordReceipt(ledger, {
      assignmentId: "missing-assignment",
      pricingUsd: 10,
      settlementAdapter: "x402",
      assetRefs: [],
      resultRefs: [],
    }, options);
  }, /Unknown assignment/);

  const receipt = recordReceipt(ledger, {
    assignmentId: assignment.assignmentId,
    pricingUsd: 10,
    settlementAdapter: "x402",
    assetRefs: [],
    resultRefs: [],
  }, options);

  assert.equal(receipt.assignmentId, assignment.assignmentId);
  assert.deepEqual(ledger.events.map((event) => event.kind), ["intent", "quote", "assignment", "receipt"]);
});

test("worker assignment ignores incompatible and offline workers", () => {
  const registry = createWorkerRegistry();

  registerWorker(registry, {
    workerId: "hashart-offline",
    supportedTaskKinds: ["image_generation"],
    inputCapabilities: [],
    outputCapabilities: [],
    costMetadata: { currency: "USD", unitCost: 1, unit: "per_task" },
    health: { status: "offline", lastCheckedAt: 1 },
  });

  registerWorker(registry, {
    workerId: "hashart-video",
    supportedTaskKinds: ["video_generation"],
    inputCapabilities: [],
    outputCapabilities: [],
    costMetadata: { currency: "USD", unitCost: 1, unit: "per_task" },
    health: { status: "healthy", lastCheckedAt: 1 },
  });

  registerWorker(registry, {
    workerId: "hashart-image-degraded",
    supportedTaskKinds: ["image_generation"],
    inputCapabilities: [],
    outputCapabilities: [],
    costMetadata: { currency: "USD", unitCost: 1, unit: "per_task" },
    health: { status: "degraded", lastCheckedAt: 1 },
  });

  const imageMatch = assignWorkerForTask(registry, "image_generation");
  const audioMatch = assignWorkerForTask(registry, "audio_generation");

  assert.equal(imageMatch.workerId, "hashart-image-degraded");
  assert.equal(audioMatch, null);
});
