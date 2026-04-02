export function reviewBuildIntent(input) {
  const reasons = [];
  if (!input.mentionsSessionKernel) reasons.push("SessionKernel must be named when canonical state is touched.");
  if (input.touchesVR && !input.desktopBridgeAcknowledged) reasons.push("VR shell must route privileged execution through desktop bridge.");
  return { approved: reasons.length === 0, reasons };
}
