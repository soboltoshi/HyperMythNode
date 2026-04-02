export function buildId(prefix, randomSource = Math.random) {
  return `${prefix}-${Date.now().toString(36)}-${randomSource().toString(36).slice(2, 8)}`;
}

function defaultNow() {
  return Date.now();
}

function buildStamp(prefix, now, randomSource) {
  return `${prefix}-${now().toString(36)}-${randomSource().toString(36).slice(2, 8)}`;
}

function assertProvenance(input) {
  if (!input.provenance || Object.keys(input.provenance).length === 0) {
    throw new Error("Router intent provenance is required.");
  }
}

export function createRouterIntent(input, options = {}) {
  const now = options.now ?? defaultNow;
  const randomSource = options.randomSource ?? Math.random;

  assertProvenance(input);
  return {
    intentId: buildStamp("intent", now, randomSource),
    createdAt: now(),
    targetCounterparty: "mythiv",
    urgency: "normal",
    ...input,
  };
}

export function createRouterQuote(input, options = {}) {
  const now = options.now ?? defaultNow;
  const randomSource = options.randomSource ?? Math.random;

  return {
    quoteId: buildStamp("quote", now, randomSource),
    currency: "USD",
    createdAt: now(),
    ...input,
  };
}

export function createRouterAssignment(input, options = {}) {
  const now = options.now ?? defaultNow;
  const randomSource = options.randomSource ?? Math.random;
  const createdAt = now();

  return {
    assignmentId: buildStamp("assignment", now, randomSource),
    status: "pending",
    createdAt,
    updatedAt: createdAt,
    ...input,
  };
}

export function createRouterReceipt(input, options = {}) {
  const now = options.now ?? defaultNow;
  const randomSource = options.randomSource ?? Math.random;
  const createdAt = now();

  return {
    receiptId: buildStamp("receipt", now, randomSource),
    executionStatus: "pending",
    createdAt,
    updatedAt: createdAt,
    ...input,
  };
}
