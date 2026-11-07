import { useCallback, useEffect, useRef, useState } from 'react';
import {
  calcAccuracy,
  calcRawWPM,
  calcWPM,
  charStats,
  currentStreak,
  generateTestText,
  maxStreak,
  mistakesFor,
} from '../lib/typing';
import type { Difficulty } from '../lib/words';
import {
  addHistory,
  getBest,
  getHistory,
  recordMistakes,
  saveBest,
} from '../lib/storage';
import type { HistoryEntry } from '../lib/storage';
import Results from './Results';
import type { TestResult } from './Results';
import Passage from './Passage';
import { useToast } from '../hooks/useToast';

const DURATIONS = [15, 30, 60] as const;
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const WORDS_FOR: Record<number, number> = { 15: 30, 30: 50, 60: 90 };
const STREAK_MILESTONES = [25, 50, 100, 200];

type Status = 'idle' | 'running' | 'finished';

export default function TestMode() {
  const [duration, setDuration] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [text, setText] = useState(() => generateTestText('easy', WORDS_FOR[30]));
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());
  const { toast, showToast, dismissToast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<number>(0);
  const typedRef = useRef('');
  const textRef = useRef(text);
  const toastedStreaks = useRef<Set<number>>(new Set());

  // Keep the timer's view of the passage in sync. (Assigned in an
  // effect, not during render, so StrictMode double-rendering is safe.)
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const focusInput = () => inputRef.current?.focus();

  // Stable across renders for a given (duration, difficulty), so the
  // timer effect can depend on it without a lint suppression — the
  // finish-time duration/difficulty are always the ones in effect.
  const finishTest = useCallback(
    (typedValue: string, elapsedSec: number, target: string) => {
      const stats = charStats(typedValue, target);
      const wpm = calcWPM(stats.correct, elapsedSec);
      const rawWpm = calcRawWPM(stats.total, elapsedSec);
      const accuracy = calcAccuracy(stats.correct, stats.total);
      const isBest = saveBest(duration, difficulty, wpm);
      const best = getBest(duration, difficulty);
      recordMistakes(mistakesFor(typedValue, target));
      setHistory(
        addHistory({
          wpm,
          rawWpm,
          accuracy,
          duration,
          difficulty,
          date: new Date().toISOString(),
        }),
      );
      setResult({
        wpm,
        rawWpm,
        accuracy,
        correct: stats.correct,
        incorrect: stats.incorrect,
        duration,
        difficulty,
        isBest,
        best,
      });
      setStatus('finished');
      if (isBest) showToast('🏆 New personal best!');
    },
    [duration, difficulty, showToast],
  );

  // Timer: ticks while running, finishes at the duration.
  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(() => {
      const sec = (Date.now() - startRef.current) / 1000;
      if (sec >= duration) {
        window.clearInterval(id);
        setElapsed(duration);
        finishTest(typedRef.current, duration, textRef.current);
      } else {
        setElapsed(sec);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [status, duration, finishTest]);

  /** Reset the round state (typed text, clock, result) for a (re)start. */
  function resetRound() {
    setTyped('');
    typedRef.current = '';
    setElapsed(0);
    setStatus('idle');
    setResult(null);
    dismissToast();
    toastedStreaks.current = new Set();
    window.setTimeout(focusInput, 0);
  }

  /** Restart the SAME passage — for retrying a text you want to master. */
  function restartRound() {
    resetRound();
  }

  /** Start a NEW passage with fresh random text. */
  function newRound(nextDuration: number, nextDifficulty: Difficulty) {
    setText(generateTestText(nextDifficulty, WORDS_FOR[nextDuration]));
    resetRound();
  }

  function handleChange(value: string) {
    if (status === 'finished') return;
    const next = value.slice(0, text.length);
    if (status === 'idle' && next.length > 0) {
      startRef.current = Date.now();
      setStatus('running');
    }
    setTyped(next);
    typedRef.current = next;
    const streak = maxStreak(next, text);
    for (const milestone of STREAK_MILESTONES) {
      if (streak >= milestone && !toastedStreaks.current.has(milestone)) {
        toastedStreaks.current.add(milestone);
        showToast(`🔥 ${milestone}-character streak — keep going!`);
      }
    }
    if (next.length === text.length && next.length > 0) {
      const sec = Math.max(
        (Date.now() - startRef.current) / 1000,
        0.1,
      );
      setElapsed(sec);
      finishTest(next, Math.min(sec, duration), text);
    }
  }

  const stats = charStats(typed, text);
  const liveSeconds = status === 'running' ? Math.max(elapsed, 0.1) : 0;
  const liveWpm = status === 'running' ? calcWPM(stats.correct, liveSeconds) : 0;
  const liveAccuracy = calcAccuracy(stats.correct, stats.total);
  const remaining = Math.max(0, Math.ceil(duration - elapsed));
  const best = getBest(duration, difficulty);

  return (
    <section aria-label="Typing test">
      <div className="controls">
        <div className="control-group" role="group" aria-label="Test duration">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              className={duration === d ? 'pill active' : 'pill'}
              onClick={() => {
                setDuration(d);
                newRound(d, difficulty);
              }}
            >
              {d}s
            </button>
          ))}
        </div>
        <div className="control-group" role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              className={difficulty === d ? 'pill active' : 'pill'}
              onClick={() => {
                setDifficulty(d);
                newRound(duration, d);
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <span className="best-line">
          Best {duration}s · {difficulty}: <strong>{Math.round(best)} WPM</strong>
        </span>
      </div>

      <div className="hud">
        <div className="hud-item">
          <span className="hud-value">{status === 'idle' ? duration : remaining}s</span>
          <span className="hud-label">left</span>
        </div>
        <div className="hud-item">
          <span className="hud-value">{Math.round(liveWpm)}</span>
          <span className="hud-label">WPM</span>
        </div>
        <div className="hud-item">
          <span className="hud-value">{liveAccuracy.toFixed(0)}%</span>
          <span className="hud-label">accuracy</span>
        </div>
        <div className="hud-item">
          <span className="hud-value">🔥 {currentStreak(typed, text)}</span>
          <span className="hud-label">streak</span>
        </div>
      </div>

      <Passage
        text={text}
        typed={typed}
        inputRef={inputRef}
        inputLabel="Type here"
        onChange={handleChange}
        onTab={restartRound}
      />
      <p className="hint">
        Tap the text to focus (mobile too) and just start typing — the clock
        starts on your first keystroke. <kbd>Tab</kbd> = restart this text.
      </p>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <div className="actions">
        <button type="button" onClick={restartRound}>
          ↻ Restart (Tab)
        </button>
        <button type="button" onClick={() => newRound(duration, difficulty)}>
          ✦ New text
        </button>
      </div>

      {status === 'finished' && result && (
        <Results
          result={result}
          history={history}
          onRestart={restartRound}
          onNewText={() => newRound(duration, difficulty)}
        />
      )}
    </section>
  );
}
