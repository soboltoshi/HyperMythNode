function defaultNow() {
  return Date.now();
}

function buildId(prefix, now, randomSource) {
  return `${prefix}-${now().toString(36)}-${randomSource().toString(36).slice(2, 8)}`;
}

export function createJobRecord(input, options = {}) {
  const now = options.now ?? defaultNow;
  const randomSource = options.randomSource ?? Math.random;
  const createdAt = now();
  return {
    jobId: buildId("job", now, randomSource),
    state: "draft",
    createdAt,
    updatedAt: createdAt,
    ...input,
  };
}
