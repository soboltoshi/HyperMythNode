import { routeVrIntentToDesktop } from '../../packages/core/bridge.mjs';

const intent = {
  type: 'market-observe-and-suggest',
  target: 'desktop-agent',
  permissions: ['suggest_only'],
  createdAt: new Date().toISOString()
};

console.log('[vr-superbrain] online');
console.log(JSON.stringify(routeVrIntentToDesktop(intent), null, 2));
setInterval(() => {
  console.log(`[vr-superbrain] presence ${new Date().toISOString()}`);
}, 45000);
