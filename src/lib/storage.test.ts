import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addHistory,
  getBest,
  getHistory,
  getMistakes,
  getTheme,
  recordMistakes,
  saveBest,
  saveTheme,
} from './storage';

/**
 * localStorage stub: a plain Map, swapped in per test. The real
 * localStorage is user-editable, so the tests below seed it with the
 * corrupt and wrong-shape values a user (or an older app version)
 * could leave behind, and assert the getters fall back instead of
 * throwing or returning garbage.
 */
function makeStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string): string | null => map.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      map.set(key, value);
    },
    removeItem: (key: string): void => {
      map.delete(key);
    },
    clear: (): void => {
      map.clear();
    },
    get length(): number {
      return map.size;
    },
    key: (index: number): string | null => [...map.keys()][index] ?? null,
    _map: map,
  };
}

type StorageStub = ReturnType<typeof makeStorage>;

let stub: StorageStub;

beforeEach(() => {
  stub = makeStorage();
  vi.stubGlobal('localStorage', stub);
});

describe('getBest / saveBest', () => {
  it('round-trips a saved best', () => {
    expect(saveBest(30, 'easy', 42)).toBe(true);
    expect(getBest(30, 'easy')).toBe(42);
    expect(saveBest(30, 'easy', 10)).toBe(false);
    expect(getBest(30, 'easy')).toBe(42);
  });

  it('returns 0 when nothing is saved', () => {
    expect(getBest(30, 'easy')).toBe(0);
  });

  it('falls back to 0 for corrupt JSON', () => {
    stub._map.set('wtt-best-30-easy', '{not json');
    expect(getBest(30, 'easy')).toBe(0);
  });

  it('falls back to 0 for a wrong-shape value (string, object, null)', () => {
    for (const bad of ['"42"', '{"wpm":42}', 'null', 'NaN']) {
      stub._map.set('wtt-best-30-easy', bad);
      expect(getBest(30, 'easy')).toBe(0);
    }
  });
});

describe('getHistory / addHistory', () => {
  const entry = {
    wpm: 50,
    rawWpm: 55,
    accuracy: 95,
    duration: 30,
    difficulty: 'easy',
    date: '2026-11-07T00:00:00.000Z',
  };

  it('round-trips entries, newest first, capped at 10', () => {
    for (let i = 0; i < 12; i += 1) {
      addHistory({ ...entry, wpm: i });
    }
    const history = getHistory();
    expect(history).toHaveLength(10);
    expect(history[0].wpm).toBe(11);
  });

  it('returns [] for corrupt JSON or a wrong-shape value', () => {
    for (const bad of ['{not json', '{"wpm":50}', '"hello"', '42']) {
      stub._map.set('wtt-history', bad);
      expect(getHistory()).toEqual([]);
    }
  });

  it('drops invalid entries individually instead of discarding the list', () => {
    stub._map.set(
      'wtt-history',
      JSON.stringify([entry, { wpm: 'fast' }, { ...entry, wpm: 60 }]),
    );
    const history = getHistory();
    expect(history).toHaveLength(2);
    expect(history.map((h) => h.wpm)).toEqual([50, 60]);
  });
});

describe('getMistakes / recordMistakes', () => {
  it('round-trips and merges mistake counts', () => {
    recordMistakes({ a: 2, b: 1 });
    recordMistakes({ a: 3 });
    expect(getMistakes()).toEqual({ a: 5, b: 1 });
  });

  it('returns {} for corrupt JSON or a wrong-shape value', () => {
    for (const bad of ['{not json', '[1, 2]', '"oops"', '42']) {
      stub._map.set('wtt-mistakes', bad);
      expect(getMistakes()).toEqual({});
    }
  });

  it('drops non-numeric and negative counts, keeps valid ones', () => {
    stub._map.set('wtt-mistakes', JSON.stringify({ a: 3, b: 'two', c: -1, d: 0 }));
    expect(getMistakes()).toEqual({ a: 3, d: 0 });
  });
});

describe('getTheme / saveTheme', () => {
  it('round-trips light and dark', () => {
    saveTheme('dark');
    expect(getTheme()).toBe('dark');
    saveTheme('light');
    expect(getTheme()).toBe('light');
  });

  it('returns null when nothing is saved, so App can use the OS theme', () => {
    expect(getTheme()).toBeNull();
  });

  it('returns null for corrupt JSON or a wrong-shape value', () => {
    for (const bad of ['{not json', '"blue"', '42', 'true']) {
      stub._map.set('wtt-theme', bad);
      expect(getTheme()).toBeNull();
    }
  });
});

describe('write failure', () => {
  it('a throwing setItem never throws out of the API', () => {
    vi.stubGlobal('localStorage', {
      ...stub,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });
    expect(() => saveBest(30, 'easy', 42)).not.toThrow();
    expect(() => addHistory({
      wpm: 50,
      rawWpm: 55,
      accuracy: 95,
      duration: 30,
      difficulty: 'easy',
      date: '2026-11-07T00:00:00.000Z',
    })).not.toThrow();
    expect(() => recordMistakes({ a: 1 })).not.toThrow();
    expect(() => saveTheme('dark')).not.toThrow();
    // Reads still work against the stub underneath.
    expect(getBest(30, 'easy')).toBe(0);
  });
});
