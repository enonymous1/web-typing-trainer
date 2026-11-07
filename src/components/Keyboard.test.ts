import { describe, expect, it } from 'vitest';
import { zoneFor } from './Keyboard';

describe('zoneFor', () => {
  it('maps space to zone 4 (thumbs)', () => {
    expect(zoneFor(' ')).toBe(4);
  });

  it('maps the left home row by column', () => {
    expect(zoneFor('a')).toBe(0);
    expect(zoneFor('s')).toBe(1);
    expect(zoneFor('d')).toBe(2);
    expect(zoneFor('f')).toBe(3);
  });

  it('maps the number row by column', () => {
    expect(zoneFor('1')).toBe(0);
    expect(zoneFor('5')).toBe(3);
    expect(zoneFor('6')).toBe(4);
    expect(zoneFor('0')).toBe(7);
  });

  it('maps the right home row by column, not by touch-typing finger', () => {
    // Column-based mapping, documented in Keyboard.tsx: strict touch
    // typing would put j on the right index (zone 4), but this scheme
    // puts j → 5, k → 6, l → 7. The test pins current behaviour.
    expect(zoneFor('h')).toBe(4);
    expect(zoneFor('j')).toBe(5);
    expect(zoneFor('k')).toBe(6);
    expect(zoneFor('l')).toBe(7);
    expect(zoneFor(';')).toBe(7);
  });

  it('is case-insensitive', () => {
    expect(zoneFor('A')).toBe(0);
    expect(zoneFor('Q')).toBe(0);
  });

  it('falls back to zone 4 for unknown keys', () => {
    // '-' and "'" are not in any column group; '/' is in the '0p;/' group.
    expect(zoneFor('-')).toBe(4);
    expect(zoneFor("'")).toBe(4);
    expect(zoneFor('/')).toBe(7);
    expect(zoneFor('=')).toBe(4);
  });
});
