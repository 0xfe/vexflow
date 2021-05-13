import { Vex } from './vex';

export function check<T>(x?: T): T {
  if (x === undefined) {
    throw new Vex.RERR('undefined');
  }
  return x;
}

//** TODO: Resolve duplication with Flow */
export const GLYPH_PROPS_VALID_TYPES: Record<string, Record<string, string>> = {
  n: { name: 'note' },
  r: { name: 'rest' },
  h: { name: 'harmonic' },
  m: { name: 'muted' },
  s: { name: 'slash' },
};
