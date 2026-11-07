// localStorage persistence. Everything stays in the browser — no account,
// no backend, no network. Keys are namespaced `wtt-` so they never clash.
//
// localStorage is user-editable and shared with any older version of this
// app, so every getter validates the shape of what it reads: a corrupt
// value, or a value of the wrong shape (history stored as an object, a
// best stored as a string, mistake counts stored as strings), falls back
// to the empty default instead of crashing or corrupting downstream code.

export interface HistoryEntry {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  duration: number;
  difficulty: string;
  date: string; // ISO timestamp
}

const BEST_KEY = (duration: number, difficulty: string) =>
  `wtt-best-${duration}-${difficulty}`;
const HISTORY_KEY = 'wtt-history';
const MISTAKES_KEY = 'wtt-mistakes';
const THEME_KEY = 'wtt-theme';

/**
 * Parse the stored JSON for `key`, or return `fallback` when the key is
 * absent, the JSON is corrupt, or the value fails `validate`. Never
 * throws: a bad stored value is a data problem, not a crash.
 */
function readValidated<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full / private mode — scores just don't persist.
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A stored history entry is valid only if every field has the right type. */
function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!isRecord(value)) return false;
  return (
    isFiniteNumber(value.wpm) &&
    isFiniteNumber(value.rawWpm) &&
    isFiniteNumber(value.accuracy) &&
    isFiniteNumber(value.duration) &&
    typeof value.difficulty === 'string' &&
    typeof value.date === 'string'
  );
}

/**
 * Best WPM for (duration, difficulty). A stored value that is not a
 * finite number (string, null, object, NaN) is treated as "no best yet".
 */
export function getBest(duration: number, difficulty: string): number {
  return readValidated<number>(BEST_KEY(duration, difficulty), 0, isFiniteNumber);
}

/** Save a WPM as the best for (duration, difficulty). Returns true if it beat the old best. */
export function saveBest(duration: number, difficulty: string, wpm: number): boolean {
  const prev = getBest(duration, difficulty);
  if (wpm > prev) {
    write(BEST_KEY(duration, difficulty), wpm);
    return true;
  }
  return false;
}

/**
 * Last-10 history, newest first. Entries that fail validation are
 * dropped individually — one bad entry must not discard the whole list.
 */
export function getHistory(): HistoryEntry[] {
  const stored = readValidated<unknown[]>(HISTORY_KEY, [], Array.isArray);
  return stored.filter(isHistoryEntry);
}

export function addHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...getHistory()].slice(0, 10);
  write(HISTORY_KEY, next);
  return next;
}

/**
 * Per-character mistake totals. Only entries whose count is a finite,
 * non-negative number survive — a stored string count or a negative
 * count is dropped rather than breaking the Weak Keys ranking.
 */
export function getMistakes(): Record<string, number> {
  const stored = readValidated<Record<string, unknown>>(MISTAKES_KEY, {}, isRecord);
  const clean: Record<string, number> = {};
  for (const [key, n] of Object.entries(stored)) {
    if (isFiniteNumber(n) && n >= 0) clean[key] = n;
  }
  return clean;
}

/** Merge per-character mistakes from one finished test into the stored totals. */
export function recordMistakes(mistakes: Record<string, number>): Record<string, number> {
  const stored = getMistakes();
  for (const [key, n] of Object.entries(mistakes)) {
    stored[key] = (stored[key] ?? 0) + n;
  }
  write(MISTAKES_KEY, stored);
  return stored;
}

/**
 * Saved theme, or `null` when nothing valid is saved — the caller (App)
 * then falls back to the OS `prefers-color-scheme` setting instead of
 * assuming light. A stored value of the wrong type is not a theme.
 */
export function getTheme(): 'light' | 'dark' | null {
  const saved = readValidated<string>(THEME_KEY, '', (v): v is string => typeof v === 'string');
  if (saved === 'dark' || saved === 'light') return saved;
  return null;
}

export function saveTheme(theme: 'light' | 'dark'): void {
  write(THEME_KEY, theme);
}
