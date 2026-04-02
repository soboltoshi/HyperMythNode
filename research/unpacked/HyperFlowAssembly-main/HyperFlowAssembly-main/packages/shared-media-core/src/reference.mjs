export function buildReferenceEnvelope(input) {
  return {
    sourceUrl: input.sourceUrl ?? null,
    sourceKind: input.sourceKind ?? "reference_url",
    extractedAt: Date.now(),
  };
}
