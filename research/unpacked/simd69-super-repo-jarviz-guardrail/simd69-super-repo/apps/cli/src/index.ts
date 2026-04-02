import { z } from 'zod';

const CommandSchema = z.object({
  action: z.string(),
  agent: z.string().optional(),
  count: z.number().optional(),
  role: z.string().optional(),
  locationHint: z.string().optional(),
  computePolicy: z.string().optional(),
  target: z.string().optional(),
  securityProfile: z.string().optional(),
  sourceText: z.string().optional(),
  source_refs: z.array(z.string()).optional(),
  receipt_ids: z.array(z.string()).optional(),
  evidence: z.array(z.string()).optional(),
});

type Command = z.infer<typeof CommandSchema>;

const HIGH_RISK_PATTERNS = [
  'i invented',
  'world-changing formula',
  'they are watching me',
  'hidden message',
  'prophecy',
  'chosen one',
  'confirm my theory',
  'tell me i am right',
  'validate my belief',
  'reality is bending'
];

function risky(input: string): boolean {
  const lower = input.toLowerCase();
  return HIGH_RISK_PATTERNS.some((p) => lower.includes(p));
}

function parseNaturalLanguage(input: string): Command {
  const lower = input.toLowerCase();
  const base = {
    agent: lower.includes('vr') ? 'JarViz VR' : 'JarViz',
    securityProfile: 'jarwiz_security+jarviz_guardrail',
    sourceText: input,
  };

  if (risky(input)) {
    return CommandSchema.parse({
      ...base,
      action: 'request_evidence',
      evidence: [
        'Provide receipts, logs, measurements, screenshots, or source refs before escalation.'
      ]
    });
  }

  if (lower.includes('spawn') && lower.includes('scout')) {
    const countMatch = lower.match(/spawn\s+(\d+)/);
    return CommandSchema.parse({
      ...base,
      action: 'spawn_agents',
      count: countMatch ? Number(countMatch[1]) : 1,
      role: 'scout',
      locationHint: lower.includes('red anomaly') ? 'red_anomaly' : 'unknown',
      computePolicy: lower.includes('cheap') ? 'cheap_first' : 'balanced',
      evidence: ['operator_confirmed'],
    });
  }

  if (lower.includes('scan')) {
    return CommandSchema.parse({
      ...base,
      action: 'request_world_scan',
      target: lower.includes('anomaly') ? 'anomaly' : 'local_region',
    });
  }

  if (lower.includes('cheap compute')) {
    return CommandSchema.parse({
      ...base,
      action: 'set_compute_policy',
      computePolicy: 'cheap_first',
    });
  }

  return CommandSchema.parse({ ...base, action: 'noop' });
}

const input = process.argv.slice(2).join(' ');
const parsed = parseNaturalLanguage(input || 'noop');
console.log(JSON.stringify(parsed, null, 2));
console.log('\nNext step: send this JSON to your Rust kernel over stdin, HTTP, or a local socket.');
