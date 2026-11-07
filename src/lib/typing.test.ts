import { describe, expect, it } from 'vitest';
import {
  buildCharDrillText,
  buildFocusText,
  calcAccuracy,
  calcRawWPM,
  calcWPM,
  charStats,
  currentStreak,
  generateTestText,
  generateText,
  maxStreak,
  mistakesFor,
  weakestKeys,
} from './typing';
import { COMMON_WORDS } from './words';

describe('calcWPM', () => {
  it('250 correct chars in 60s is 50 WPM', () => {
    expect(calcWPM(250, 60)).toBe(50);
  });

  it('125 correct chars in 30s is 50 WPM', () => {
    expect(calcWPM(125, 30)).toBe(50);
  });

  it('returns 0 with no elapsed time', () => {
    expect(calcWPM(250, 0)).toBe(0);
  });

  it('returns 0 with no correct characters', () => {
    expect(calcWPM(0, 60)).toBe(0);
  });
});

describe('calcRawWPM', () => {
  it('counts every character typed, correct or not', () => {
    expect(calcRawWPM(300, 60)).toBe(60);
  });
});

describe('calcAccuracy', () => {
  it('90 of 100 correct is 90%', () => {
    expect(calcAccuracy(90, 100)).toBe(90);
  });

  it('all correct is 100%', () => {
    expect(calcAccuracy(10, 10)).toBe(100);
  });

  it('no input yet counts as 100%', () => {
    expect(calcAccuracy(0, 0)).toBe(100);
  });
});

describe('charStats', () => {
  it('counts correct and incorrect characters positionally', () => {
    expect(charStats('hello', 'hallo')).toEqual({ correct: 4, incorrect: 1, total: 5 });
  });

  it('ignores characters beyond the typed length', () => {
    expect(charStats('he', 'hello')).toEqual({ correct: 2, incorrect: 0, total: 2 });
  });
});

describe('generateText', () => {
  it('returns the requested number of words from the pool', () => {
    const text = generateText(COMMON_WORDS, 10, () => 0.5);
    expect(text.split(' ')).toHaveLength(10);
    for (const word of text.split(' ')) {
      expect(COMMON_WORDS).toContain(word);
    }
  });

  it('is deterministic with a fixed rng', () => {
    const rng = () => 0;
    expect(generateText(['a', 'b', 'c'], 3, rng)).toBe('a a a');
  });

  it('returns empty for an empty pool or zero count', () => {
    expect(generateText([], 5)).toBe('');
    expect(generateText(['a'], 0)).toBe('');
  });
});

describe('generateTestText', () => {
  it('easy text is all lowercase common words', () => {
    const text = generateTestText('easy', 20, () => 0.3);
    expect(text).toBe(text.toLowerCase());
    expect(text.split(' ')).toHaveLength(20);
  });

  it('hard text with a symbol-biased rng contains a number or symbol token', () => {
    // rng() < 0.3 picks a HARD token; a constant 0.1 rng always takes that branch.
    const text = generateTestText('hard', 5, () => 0.1);
    expect(text.split(' ')).toHaveLength(5);
    expect(text).toMatch(/[0-9$#@%+*()[\]&]/);
  });
});

describe('weakestKeys', () => {
  it('orders by error count descending', () => {
    expect(weakestKeys({ a: 2, b: 9, c: 5 })).toEqual(['b', 'c', 'a']);
  });

  it('breaks ties alphabetically and respects the limit', () => {
    expect(weakestKeys({ z: 3, a: 3, m: 3, q: 1 }, 2)).toEqual(['a', 'm']);
  });

  it('ignores keys with zero mistakes and returns empty for none', () => {
    expect(weakestKeys({ a: 0 })).toEqual([]);
    expect(weakestKeys({})).toEqual([]);
  });
});

describe('buildFocusText', () => {
  it('repeats weak keys more often than filler', () => {
    const text = buildFocusText(['z'], 200, () => 0.1);
    const zCount = [...text].filter((c) => c === 'z').length;
    expect(zCount).toBeGreaterThan(50);
  });

  it('falls back to home-row keys with no mistakes recorded', () => {
    const text = buildFocusText([], 40, () => 0.5);
    expect(text.length).toBeGreaterThan(0);
    expect(text).toMatch(/^[asdfjkl; ]+$/);
  });
});

describe('mistakesFor', () => {
  it('counts mistakes against the expected character, lowercased', () => {
    expect(mistakesFor('hallo', 'hello')).toEqual({ e: 1 });
    expect(mistakesFor('HXllo', 'hello')).toEqual({ e: 1, h: 1 });
    expect(mistakesFor('hello', 'hello')).toEqual({});
    expect(mistakesFor('', 'hello')).toEqual({});
  });
});

describe('buildCharDrillText', () => {
  it('uses only the given keys plus spaces, with no doubled spaces', () => {
    const text = buildCharDrillText(['z', 'x', 'c'], 200, () => 0.5);
    expect(text.length).toBeGreaterThan(0);
    expect(text).toMatch(/^[zxc ]+$/);
    expect(text).not.toMatch(/  /);
    expect(text).toBe(text.trim());
  });

  it('returns empty for an empty key set or zero length', () => {
    expect(buildCharDrillText([], 50)).toBe('');
    expect(buildCharDrillText(['z'], 0)).toBe('');
  });
});

describe('streaks', () => {
  it('maxStreak finds the longest correct run', () => {
    expect(maxStreak('hexxo', 'hello')).toBe(2);
    expect(maxStreak('hello', 'hello')).toBe(5);
  });

  it('currentStreak counts only the trailing correct run', () => {
    expect(currentStreak('helxo', 'hello')).toBe(1);
    expect(currentStreak('hellx', 'hello')).toBe(0);
    expect(currentStreak('hello', 'hello')).toBe(5);
    expect(currentStreak('hxllo', 'hello')).toBe(3);
  });
});
