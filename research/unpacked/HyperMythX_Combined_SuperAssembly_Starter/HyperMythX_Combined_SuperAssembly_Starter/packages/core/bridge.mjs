
export function routeVrIntentToDesktop(intent) {
  return {
    bridge: 'vr-superbrain-bridge',
    accepted: true,
    executionPlane: 'desktop-agent',
    intent,
    note: 'VR Superbrain may request execution. Desktop Agent validates and controls wallets/crypto/device actions.'
  };
}
