import { describe, expect, it } from 'vitest';
import { COMMON_WORDS, DRILLS } from './words';
import { buildCharDrillText, generateTestText } from './typing';

describe('COMMON_WORDS', () => {
  it('every entry is lowercase — the Easy "all lowercase" invariant', () => {
    // This used to fail silently: the pool contained 'I', and the old
    // easy-text test only passed because its fixed rng never picked it.
    expect(COMMON_WORDS.length).toBeGreaterThan(100);
    for (const word of COMMON_WORDS) {
      expect(word).toBe(word.toLowerCase());
    }
  });

  it('has no duplicates', () => {
    expect(new Set(COMMON_WORDS).size).toBe(COMMON_WORDS.length);
  });
});

describe('generateTestText easy', () => {
  it('is lowercase for every sampling position, not just one fixed rng', () => {
    // A constant rng picks the same index every time; sweep the whole
    // pool so a single bad entry (like the old 'I') cannot hide.
    for (let i = 0; i < COMMON_WORDS.length; i += 1) {
      const rng = () => i / COMMON_WORDS.length;
      const text = generateTestText('easy', 5, rng);
      expect(text).toBe(text.toLowerCase());
    }
  });
});

describe('drill word purity', () => {
  it('every word in a constrained words drill uses only the drill keys', () => {
    // Common Words is deliberately exempt: its `chars` is the
    // etaoinshrdlu frequency hint, not a constraint — real words need
    // letters outside it ('of' needs f, 'you' needs y and u).
    for (const drill of DRILLS) {
      if (drill.kind !== 'words' || drill.id === 'common') continue;
      const allowed = new Set(drill.chars.split(''));
      expect(drill.words.length).toBeGreaterThan(0);
      for (const word of drill.words) {
        for (const ch of word) {
          expect(allowed.has(ch)).toBe(true);
        }
      }
    }
  });

  it('word drills have no duplicate words', () => {
    for (const drill of DRILLS) {
      if (drill.kind !== 'words' || drill.words.length === 0) continue;
      expect(new Set(drill.words).size).toBe(drill.words.length);
    }
  });

  it('numbers drill words are digits only', () => {
    const numbers = DRILLS.find((d) => d.id === 'numbers');
    expect(numbers).toBeDefined();
    for (const word of numbers?.words ?? []) {
      expect(word).toMatch(/^[0-9]+$/);
    }
  });

  it('common drill chars are the etaoinshrdlu frequency-order set', () => {
    const common = DRILLS.find((d) => d.id === 'common');
    expect(common?.chars).toBe('etaoinshrdlu');
    expect(common?.words.length).toBeGreaterThan(0);
    for (const word of common?.words ?? []) {
      expect(COMMON_WORDS).toContain(word);
    }
  });
});

describe('bottom row char drill', () => {
  it('buildCharDrillText uses only bottom-row keys plus spaces', () => {
    const bottom = DRILLS.find((d) => d.id === 'bottom');
    expect(bottom?.kind).toBe('chars');
    expect(bottom?.words).toEqual([]);
    const allowed = new Set([...(bottom?.chars ?? ''), ' ']);
    const text = buildCharDrillText((bottom?.chars ?? '').split(''), 200, () => 0.5);
    expect(text.length).toBeGreaterThan(0);
    for (const ch of text) {
      expect(allowed.has(ch)).toBe(true);
    }
  });
});
