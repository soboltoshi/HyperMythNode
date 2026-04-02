export function normalizeMediaInput(input) {
  return {
    sourceMode: input.sourceMode,
    primaryInput: input.primaryInput,
    referenceUrl: input.referenceUrl ?? null,
    videoReferenceUrl: input.videoReferenceUrl ?? null,
    youtubeUrl: input.youtubeUrl ?? null,
  };
}
