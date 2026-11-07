import { useEffect, useRef, useState } from 'react';
import {
  calcAccuracy,
  calcRawWPM,
  calcWPM,
  charStats,
  currentStreak,
  generateTestText,
  maxStreak,
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
  const [toast, setToast] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<number>(0);
  const typedRef = useRef('');
  const textRef = useRef(text);
  const toastedStreaks = useRef<Set<number>>(new Set());
  textRef.current = text;

  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    focusInput();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  function finishTest(typedValue: string, elapsedSec: number, target: string) {
    const stats = charStats(typedValue, target);
    const wpm = calcWPM(stats.correct, elapsedSec);
    const rawWpm = calcRawWPM(stats.total, elapsedSec);
    const accuracy = calcAccuracy(stats.correct, stats.total);
    const isBest = saveBest(duration, difficulty, wpm);
    const best = getBest(duration, difficulty);
    const mistakes: Record<string, number> = {};
    for (let i = 0; i < typedValue.length; i += 1) {
      if (typedValue[i] !== target[i]) {
        const key = target[i].toLowerCase();
        mistakes[key] = (mistakes[key] ?? 0) + 1;
      }
    }
    recordMistakes(mistakes);
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
    if (isBest) setToast('🏆 New personal best!');
  }

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
    // finishTest reads duration/difficulty from state at finish time; the
    // interval is recreated whenever the running status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, duration]);

  function newRound(nextDuration: number, nextDifficulty: Difficulty) {
    const nextText = generateTestText(nextDifficulty, WORDS_FOR[nextDuration]);
    setText(nextText);
    setTyped('');
    typedRef.current = '';
    setElapsed(0);
    setStatus('idle');
    setResult(null);
    setToast(null);
    toastedStreaks.current = new Set();
    window.setTimeout(focusInput, 0);
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
        setToast(`🔥 ${milestone}-character streak — keep going!`);
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

      <div className="progress" aria-hidden="true">
        <div
          className="progress-fill"
          style={{ width: `${(typed.length / text.length) * 100}%` }}
        />
      </div>

      <div
        className="passage"
        onClick={focusInput}
        role="button"
        tabIndex={-1}
        aria-label="Typing passage — tap to focus and start typing"
      >
        {text.split('').map((ch, i) => {
          let cls = 'char';
          if (i < typed.length) cls += typed[i] === ch ? ' char-ok' : ' char-bad';
          else if (i === typed.length) cls += ' char-current';
          return (
            <span key={i} className={cls}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          );
        })}
        <input
          ref={inputRef}
          className="hidden-input"
          type="text"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Type here"
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              newRound(duration, difficulty);
            }
          }}
        />
      </div>
      <p className="hint">
        Tap the text to focus (mobile too) and just start typing — the clock
        starts on your first keystroke. <kbd>Tab</kbd> = new test.
      </p>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <div className="actions">
        <button type="button" onClick={() => newRound(duration, difficulty)}>
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
          onRestart={() => newRound(duration, difficulty)}
          onNewText={() => newRound(duration, difficulty)}
        />
      )}
    </section>
  );
}
