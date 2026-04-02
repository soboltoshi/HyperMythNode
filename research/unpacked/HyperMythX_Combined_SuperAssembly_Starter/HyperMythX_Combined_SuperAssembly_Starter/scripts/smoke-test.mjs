
import { DOMAIN_REGISTRY, createAgentRecord } from '../packages/protocol/index.mjs';
import { reviewBuildIntent } from '../packages/core/asimog.mjs';
import { routeVrIntentToDesktop } from '../packages/core/bridge.mjs';

const agent = createAgentRecord('smoke-agent', 'tester');
const review = reviewBuildIntent({ touchesCanonicalState: true, mentionsSessionKernel: true, touchesVR: true, desktopBridgeAcknowledged: true });
const bridged = routeVrIntentToDesktop({ type: 'smoke' });

console.log(JSON.stringify({
  domains: Object.keys(DOMAIN_REGISTRY).length,
  agentRole: agent.role,
  reviewApproved: review.approved,
  bridgeAccepted: bridged.accepted
}, null, 2));
