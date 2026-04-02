export interface BuildIntentReview {
  approved: boolean;
  reasons: string[];
}

export function reviewBuildIntent(input: {
  touchesCanonicalState: boolean;
  mentionsSessionKernel: boolean;
  touchesVR: boolean;
  desktopBridgeAcknowledged: boolean;
}): BuildIntentReview {
  const reasons: string[] = [];
  if (!input.mentionsSessionKernel) reasons.push("SessionKernel must be named when canonical state is involved.");
  if (input.touchesVR && !input.desktopBridgeAcknowledged) reasons.push("VR shell must route privileged execution through desktop bridge.");
  return { approved: reasons.length === 0, reasons };
}

export function routeVrIntentToDesktop(intent: Record<string, unknown>) {
  return {
    routedTo: "desktop-agent",
    transport: "vr-superbrain-bridge",
    intent
  };
}
