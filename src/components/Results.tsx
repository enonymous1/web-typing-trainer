import type { HistoryEntry } from '../lib/storage';

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  duration: number;
  difficulty: string;
  isBest: boolean;
  best: number;
}

interface ResultsProps {
  result: TestResult;
  history: HistoryEntry[];
  onRestart: () => void;
  onNewText: () => void;
}

export default function Results({ result, history, onRestart, onNewText }: ResultsProps) {
  return (
    <section className="results" aria-label="Test results">
      <h2>
        Results {result.isBest && <span className="badge-best">🏆 New personal best!</span>}
      </h2>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-value">{Math.round(result.wpm)}</span>
          <span className="stat-label">WPM</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(result.rawWpm)}</span>
          <span className="stat-label">Raw WPM</span>
        </div>
        <div className="stat">
          <span className="stat-value">{result.accuracy.toFixed(1)}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {result.correct} / {result.incorrect}
          </span>
          <span className="stat-label">Correct / wrong chars</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(result.best)}</span>
          <span className="stat-label">
            Best ({result.duration}s · {result.difficulty})
          </span>
        </div>
      </div>
      <div className="results-actions">
        <button type="button" onClick={onRestart}>↻ Test again (Tab)</button>
        <button type="button" onClick={onNewText}>✦ New text</button>
      </div>
      {history.length > 0 && (
        <div className="history">
          <h3>Last {history.length} tests</h3>
          <ol>
            {history.map((h, i) => (
              <li key={`${h.date}-${i}`}>
                <strong>{Math.round(h.wpm)} WPM</strong> · {h.accuracy.toFixed(0)}% ·{' '}
                {h.duration}s · {h.difficulty} ·{' '}
                {new Date(h.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
