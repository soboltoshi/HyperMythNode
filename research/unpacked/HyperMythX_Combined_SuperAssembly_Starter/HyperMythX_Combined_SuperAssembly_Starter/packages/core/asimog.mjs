
import { ADAPTER_REGISTRY } from './adapterRegistry.mjs';

export function reviewBuildIntent(intent) {
  const warnings = [];
  if (intent?.newAdapters && intent.newAdapters.length > 0) {
    warnings.push('Adapter count is locked at 69 in this starter. New adapters require proposal review.');
  }
  if (intent?.touchesCanonicalState && !intent?.mentionsSessionKernel) {
    warnings.push('Canonical state changes must explicitly route through SessionKernel.');
  }
  if (intent?.touchesVR && !intent?.desktopBridgeAcknowledged) {
    warnings.push('VR changes must acknowledge the VR/Desktop bridge split.');
  }
  return {
    reviewer: 'ASIMOG',
    approved: warnings.length === 0,
    warnings,
    knownAdapters: ADAPTER_REGISTRY.length
  };
}
