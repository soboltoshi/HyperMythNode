import { describe, it, expect } from 'vitest';
import { getVersion } from '../src/service';

describe('agent-mesh', () => {
  it('has a version', () => {
    expect(getVersion()).toBe('0.1.0');
  });
});
