export function getStatus() {
  return { ok: true, name: 'perps-index-engine', version: '0.0.1' } as const;
}

export function getDependencies() {
  return [] as string[];
}

export function getVersion() {
  return '0.0.1';
}
