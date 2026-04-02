export function buildSettlementEnvelope(input) {
  return {
    settlementAdapter: input.settlementAdapter,
    amountUsd: input.amountUsd,
    counterparty: input.counterparty,
    createdAt: Date.now(),
  };
}

export function buildWorldSpawnActivation(input) {
  return {
    spawnRequestId: input.spawnRequestId,
    worldName: input.worldName,
    spawnType: input.spawnType,
    activationPaid: Boolean(input.activationPaid),
    computeMarketEnabled: Boolean(input.computeMarketEnabled),
    gameplayEnabled: Boolean(input.gameplayEnabled),
  };
}
