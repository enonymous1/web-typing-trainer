import { COMMON_WORDS, HARD_TOKENS, capitalize, withPunctuation } from './words';
import type { Difficulty } from './words';

export type { Difficulty };

export interface CharStats {
  correct: number;
  incorrect: number;
  total: number;
}

/** Count correct / incorrect characters of `typed` against `target`. */
export function charStats(typed: string, target: string): CharStats {
  let correct = 0;
  for (let i = 0; i < typed.length; i += 1) {
    if (typed[i] === target[i]) correct += 1;
  }
  return { correct, incorrect: typed.length - correct, total: typed.length };
}

/**
 * Words per minute: standard definition, one "word" = 5 characters.
 * Uses correctly typed characters. Returns 0 when no time has elapsed.
 */
export function calcWPM(correctChars: number, secondsElapsed: number): number {
  if (secondsElapsed <= 0 || correctChars <= 0) return 0;
  return (correctChars / 5) / (secondsElapsed / 60);
}

/** Raw WPM: same formula but over every character typed, correct or not. */
export function calcRawWPM(totalChars: number, secondsElapsed: number): number {
  if (secondsElapsed <= 0 || totalChars <= 0) return 0;
  return (totalChars / 5) / (secondsElapsed / 60);
}

/** Accuracy as a percentage (0–100). No input yet counts as 100%. */
export function calcAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  return (correctChars / totalChars) * 100;
}

/**
 * Build a space-separated string of `count` words sampled from `words`.
 * `rng` is injectable so tests can be deterministic (defaults to Math.random).
 */
export function generateText(
  words: string[],
  count: number,
  rng: () => number = Math.random,
): string {
  if (words.length === 0 || count <= 0) return '';
  const picked: string[] = [];
  for (let i = 0; i < count; i += 1) {
    picked.push(words[Math.floor(rng() * words.length)]);
  }
  return picked.join(' ');
}

/**
 * Generate a test passage for a difficulty.
 * Easy: common words, lowercase. Medium: capitals + punctuation sprinkled
 * in. Hard: common words mixed with numbers / symbols / punctuation.
 */
export function generateTestText(
  difficulty: Difficulty,
  count: number,
  rng: () => number = Math.random,
): string {
  if (difficulty === 'easy') return generateText(COMMON_WORDS, count, rng);
  if (difficulty === 'medium') {
    const picked: string[] = [];
    for (let i = 0; i < count; i += 1) {
      let word = COMMON_WORDS[Math.floor(rng() * COMMON_WORDS.length)];
      if (rng() < 0.25) word = capitalize(word);
      if (rng() < 0.18) word = withPunctuation(word, rng);
      picked.push(word);
    }
    return picked.join(' ');
  }
  // hard
  const picked: string[] = [];
  for (let i = 0; i < count; i += 1) {
    if (rng() < 0.3) {
      picked.push(HARD_TOKENS[Math.floor(rng() * HARD_TOKENS.length)]);
    } else {
      let word = COMMON_WORDS[Math.floor(rng() * COMMON_WORDS.length)];
      if (rng() < 0.3) word = capitalize(word);
      if (rng() < 0.25) word = withPunctuation(word, rng);
      picked.push(word);
    }
  }
  return picked.join(' ');
}

/**
 * Weakest keys first: mistakes is a map of character -> error count.
 * Sorted by error count descending, ties broken alphabetically so the
 * result is deterministic. Returns at most `limit` keys.
 */
export function weakestKeys(
  mistakes: Record<string, number>,
  limit = 5,
): string[] {
  return Object.entries(mistakes)
    .filter(([, n]) => n > 0)
    .sort(([aKey, aN], [bKey, bN]) => bN - aN || aKey.localeCompare(bKey))
    .slice(0, limit)
    .map(([key]) => key);
}

/**
 * Build a focus drill passage: the weakest keys appear roughly twice as
 * often as filler home-row characters, so the drill trains what you
 * actually miss. Falls back to home-row characters when there are no
 * recorded mistakes yet.
 */
export function buildFocusText(
  weak: string[],
  length = 120,
  rng: () => number = Math.random,
): string {
  const keys = weak.length > 0 ? weak : ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
  const filler = ['a', 's', 'd', 'f', 'j', 'k', 'l', ' '];
  const chars: string[] = [];
  for (let i = 0; i < length; i += 1) {
    const pool = rng() < 0.66 ? keys : filler;
    chars.push(pool[Math.floor(rng() * pool.length)]);
  }
  // Avoid doubled spaces and leading/trailing space.
  return chars.join('').replace(/ {2,}/g, ' ').trim();
}

/** Longest run of consecutive correct characters in `typed` vs `target`. */
export function maxStreak(typed: string, target: string): number {
  let best = 0;
  let run = 0;
  for (let i = 0; i < typed.length; i += 1) {
    if (typed[i] === target[i]) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

/** Current (trailing) run of consecutive correct characters. */
export function currentStreak(typed: string, target: string): number {
  let run = 0;
  for (let i = typed.length - 1; i >= 0; i -= 1) {
    if (typed[i] === target[i]) run += 1;
    else break;
  }
  return run;
}
