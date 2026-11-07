// localStorage persistence. Everything stays in the browser — no account,
// no backend, no network. Keys are namespaced `wtt-` so they never clash.

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

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
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

export function getBest(duration: number, difficulty: string): number {
  return read<number>(BEST_KEY(duration, difficulty), 0);
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

export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(HISTORY_KEY, []);
}

export function addHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...getHistory()].slice(0, 10);
  write(HISTORY_KEY, next);
  return next;
}

export function getMistakes(): Record<string, number> {
  return read<Record<string, number>>(MISTAKES_KEY, {});
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

export function getTheme(): 'light' | 'dark' {
  const saved = read<string>(THEME_KEY, '');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  write(THEME_KEY, theme);
}
