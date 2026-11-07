import { useEffect, useRef, useState } from 'react';
import { DRILLS } from '../lib/words';
import {
  buildFocusText,
  calcAccuracy,
  calcWPM,
  charStats,
  generateText,
  weakestKeys,
} from '../lib/typing';
import { getMistakes } from '../lib/storage';
import Keyboard from './Keyboard';

interface KeyStats {
  correct: number;
  total: number;
}

function drillText(drillId: string): { text: string; note: string } {
  if (drillId === 'weak') {
    const weak = weakestKeys(getMistakes(), 5);
    return {
      text: buildFocusText(weak, 120),
      note:
        weak.length > 0
          ? `Focusing on your weakest keys: ${weak.join(' · ')}`
          : 'No mistakes recorded yet — warming up on the home row. Finish a test and your weak keys will show up here.',
    };
  }
  const drill = DRILLS.find((d) => d.id === drillId) ?? DRILLS[0];
  return { text: generateText(drill.words, 48), note: drill.blurb };
}

export default function PracticeMode() {
  const [drillId, setDrillId] = useState('home');
  const [text, setText] = useState(() => drillText('home').text);
  const [note, setNote] = useState(() => drillText('home').note);
  const [typed, setTyped] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [keyStats, setKeyStats] = useState<Record<string, KeyStats>>({});
  const [toast, setToast] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const sessionStartRef = useRef<number>(0);
  const roundStartRef = useRef<number>(0);
  const typedRef = useRef('');
  const textRef = useRef(text);
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

  // Live clock once the session has started; elapsed tracks the current
  // round so the round WPM stays meaningful after a round completes.
  useEffect(() => {
    if (sessionStartRef.current === 0) return;
    const id = window.setInterval(() => {
      const base = roundStartRef.current || sessionStartRef.current;
      setElapsed((Date.now() - base) / 1000);
    }, 200);
    return () => window.clearInterval(id);
  }, [typed.length > 0]);

  function loadDrill(nextId: string) {
    const { text: nextText, note: nextNote } = drillText(nextId);
    setDrillId(nextId);
    setText(nextText);
    setNote(nextNote);
    setTyped('');
    typedRef.current = '';
    setToast(null);
    roundStartRef.current = 0;
    window.setTimeout(focusInput, 0);
  }

  function handleChange(value: string) {
    const next = value.slice(0, text.length);
    const prev = typedRef.current;
    if (sessionStartRef.current === 0 && next.length > 0) {
      sessionStartRef.current = Date.now();
    }
    if (roundStartRef.current === 0 && next.length > 0) {
      roundStartRef.current = Date.now();
    }
    // Only newly typed characters count toward per-key accuracy.
    if (next.length > prev.length) {
      setKeyStats((old) => {
        const copy = { ...old };
        for (let i = prev.length; i < next.length; i += 1) {
          const expected = text[i].toLowerCase();
          const entry = copy[expected] ?? { correct: 0, total: 0 };
          copy[expected] = {
            correct: entry.correct + (next[i] === text[i] ? 1 : 0),
            total: entry.total + 1,
          };
        }
        return copy;
      });
    }
    setTyped(next);
    typedRef.current = next;
    if (next.length === text.length && next.length > 0) {
      setToast('✅ Round complete — new drill text loaded!');
      const { text: nextText } = drillText(drillId);
      setText(nextText);
      setTyped('');
      typedRef.current = '';
      roundStartRef.current = 0;
    }
  }

  const stats = charStats(typed, text);
  const liveWpm =
    roundStartRef.current === 0
      ? 0
      : calcWPM(stats.correct, Math.max(elapsed, 0.1));
  const accuracy = calcAccuracy(stats.correct, stats.total);
  const worstKeys = Object.entries(keyStats)
    .filter(([, s]) => s.total >= 2)
    .sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)
    .slice(0, 8);
  const nextKey = text[typed.length] ?? '';

  return (
    <section aria-label="Typing practice">
      <div className="controls">
        <div className="control-group" role="group" aria-label="Drill">
          {DRILLS.map((d) => (
            <button
              key={d.id}
              type="button"
              className={drillId === d.id ? 'pill active' : 'pill'}
              onClick={() => loadDrill(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <p className="drill-note">{note}</p>

      <div className="hud">
        <div className="hud-item">
          <span className="hud-value">{Math.round(liveWpm)}</span>
          <span className="hud-label">WPM (this round)</span>
        </div>
        <div className="hud-item">
          <span className="hud-value">{accuracy.toFixed(0)}%</span>
          <span className="hud-label">accuracy</span>
        </div>
        <div className="hud-item">
          <span className="hud-value">
            {stats.correct} / {stats.incorrect}
          </span>
          <span className="hud-label">correct / wrong</span>
        </div>
      </div>

      <div className="progress" aria-hidden="true">
        <div
          className="progress-fill"
          style={{ width: `${(typed.length / text.length) * 100}%` }}
        />
      </div>

      <div className="passage" onClick={focusInput} role="button" tabIndex={-1}>
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
          aria-label="Type here to practise"
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              loadDrill(drillId);
            }
          }}
        />
      </div>
      <p className="hint">
        No timer, no pressure — finish a round and a fresh one loads. <kbd>Tab</kbd> =
        new drill text.
      </p>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <Keyboard nextKey={nextKey} keyStats={keyStats} />

      {worstKeys.length > 0 && (
        <div className="per-key">
          <h3>Per-key accuracy (this session)</h3>
          <ul>
            {worstKeys.map(([key, s]) => (
              <li key={key}>
                <code>{key === ' ' ? 'space' : key}</code> —{' '}
                {((s.correct / s.total) * 100).toFixed(0)}% ({s.correct}/{s.total})
              </li>
            ))}
          </ul>
          <p className="hint">
            Try the <strong>Weak Keys</strong> drill to train these first.
          </p>
        </div>
      )}
    </section>
  );
}
