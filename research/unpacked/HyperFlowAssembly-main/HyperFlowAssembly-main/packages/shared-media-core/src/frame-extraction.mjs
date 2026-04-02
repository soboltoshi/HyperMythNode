export function buildFrameExtractionRequest(assetId, frameCount = 8) {
  return {
    assetId,
    frameCount,
    createdAt: Date.now(),
  };
}
