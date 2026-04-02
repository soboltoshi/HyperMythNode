import { describe, it, expect } from 'vitest';
import { getVersion } from '../src/service';

describe('world-spawn', () => {
  it('has a version', () => {
    expect(getVersion()).toBe('0.1.0');
  });
});
