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
});

type Command = z.infer<typeof CommandSchema>;

function parseNaturalLanguage(input: string): Command {
  const lower = input.toLowerCase();
  const base = {
    agent: lower.includes('vr') ? 'JarViz VR' : 'JarViz',
    securityProfile: 'jarwiz_security',
  };

  if (lower.includes('spawn') && lower.includes('scout')) {
    const countMatch = lower.match(/spawn\s+(\d+)/);
    return CommandSchema.parse({
      ...base,
      action: 'spawn_agents',
      count: countMatch ? Number(countMatch[1]) : 1,
      role: 'scout',
      locationHint: lower.includes('red anomaly') ? 'red_anomaly' : 'unknown',
      computePolicy: lower.includes('cheap') ? 'cheap_first' : 'balanced',
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
console.log('
Next step: send this JSON to your Rust kernel over stdin, HTTP, or a local socket.');
