import { useEffect, useRef, useState } from 'react';
import { DRILLS } from '../lib/words';
import {
  DEFAULT_CHAR_DRILL_LENGTH,
  DRILL_ROUND_WORDS,
  buildCharDrillText,
  buildFocusText,
  calcAccuracy,
  calcWPM,
  charStats,
  generateText,
  mistakesFor,
  weakestKeys,
} from '../lib/typing';
import { getMistakes, recordMistakes } from '../lib/storage';
import Keyboard from './Keyboard';
import Passage from './Passage';
import { useToast } from '../hooks/useToast';

interface KeyStats {
  correct: number;
  total: number;
}

function drillText(drillId: string): { text: string; note: string } {
  if (drillId === 'weak') {
    const weak = weakestKeys(getMistakes(), 5);
    return {
      text: buildFocusText(weak, DEFAULT_CHAR_DRILL_LENGTH),
      note:
        weak.length > 0
          ? `Focusing on your weakest keys: ${weak.join(' · ')}`
          : 'No mistakes recorded yet — warming up on the home row. Finish a test or a practice round and your weak keys will show up here.',
    };
  }
  const drill = DRILLS.find((d) => d.id === drillId) ?? DRILLS[0];
  // Char drills (bottom row) cannot spell words, so their passage is
  // random key sequences; word drills sample the drill's word list.
  if (drill.kind === 'chars') {
    return { text: buildCharDrillText(drill.chars.split('')), note: drill.blurb };
  }
  return { text: generateText(drill.words, DRILL_ROUND_WORDS), note: drill.blurb };
}

export default function PracticeMode() {
  const [drillId, setDrillId] = useState('home');
  // One lazy initializer draws the opening drill text exactly once —
  // two separate useState(() => drillText('home')) calls used to draw
  // (and discard) it twice.
  const [round, setRound] = useState(() => drillText('home'));
  const { text, note } = round;
  const [typed, setTyped] = useState('');
  const [elapsed, setElapsed] = useState(0);
  // The live clock only runs while a round is in progress. It starts on
  // the first keystroke of a round and stops (with elapsed reset) when
  // the round completes or the drill changes — so WPM never decays
  // between rounds from a clock that kept ticking.
  const [clockActive, setClockActive] = useState(false);
  const [keyStats, setKeyStats] = useState<Record<string, KeyStats>>({});
  const { toast, showToast, dismissToast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const roundStartRef = useRef<number>(0);
  const typedRef = useRef('');

  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    if (!clockActive) return;
    const id = window.setInterval(() => {
      setElapsed((Date.now() - roundStartRef.current) / 1000);
    }, 200);
    return () => window.clearInterval(id);
  }, [clockActive]);

  function loadDrill(nextId: string) {
    setRound(drillText(nextId));
    setDrillId(nextId);
    setTyped('');
    typedRef.current = '';
    dismissToast();
    roundStartRef.current = 0;
    setClockActive(false);
    setElapsed(0);
    window.setTimeout(focusInput, 0);
  }

  function handleChange(value: string) {
    const next = value.slice(0, text.length);
    const prev = typedRef.current;
    if (roundStartRef.current === 0 && next.length > 0) {
      roundStartRef.current = Date.now();
      setClockActive(true);
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
      // Practice counts too: feed this round's mistakes into the Weak
      // Keys model, or practicing would never improve it.
      recordMistakes(mistakesFor(next, text));
      showToast('✅ Round complete — new drill text loaded!');
      setRound(drillText(drillId));
      setTyped('');
      typedRef.current = '';
      roundStartRef.current = 0;
      setClockActive(false);
      setElapsed(0);
    }
  }

  const stats = charStats(typed, text);
  const liveWpm =
    !clockActive
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

      <Passage
        text={text}
        typed={typed}
        inputRef={inputRef}
        inputLabel="Type here to practise"
        onChange={handleChange}
        onTab={() => loadDrill(drillId)}
      />
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
