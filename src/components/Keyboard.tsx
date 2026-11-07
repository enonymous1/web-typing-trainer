interface KeyStats {
  correct: number;
  total: number;
}

interface KeyboardProps {
  /** The next character the user should type (lowercase, ' ' for space). */
  nextKey?: string;
  /** Per-key accuracy, used to tint weak keys. */
  keyStats?: Record<string, KeyStats>;
}

const ROWS: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
];

/**
 * Finger zone for a key, 0–7 left to right.
 *
 * Honest caveats, documented rather than silently "fixed":
 *
 * - The mapping is by keyboard COLUMN, not by strict touch-typing
 *   finger: the right home row maps j → 5, k → 6, l → 7, where strict
 *   touch typing would put j/k/l/; on the right index/middle/ring/pinky
 *   (4/5/6/7). The colours still teach column position, but they are
 *   not a touch-typing finger chart.
 * - Zone 4 is shared: it covers both the thumbs (space) and the right
 *   index column (6 y u h n). The 8-zone scheme has one zone per
 *   finger, and the thumbs share with the right index.
 * - The bottom row is inconsistent: x → 1, c → 2, v/b → 3, n → 4,
 *   m → 5, but z matches no column group and falls through to the
 *   default 4. A future pass should give z (and the number row) an
 *   explicit column instead of relying on the fallback.
 * - Keys not drawn on the keyboard (/, ', -, =, [, ], \) can never
 *   highlight; `/` maps to zone 7, the rest fall through to the
 *   default zone 4. If those keys are ever rendered, give them
 *   explicit zones instead of the fallback.
 * - Any other unknown key falls back to zone 4 (space/thumbs) rather
 *   than throwing, so a stray character never breaks the render.
 */
export function zoneFor(key: string): number {
  const k = key.toLowerCase();
  if (k === ' ') return 4;
  if ('1qa'.includes(k)) return 0;
  if ('2wsx'.includes(k)) return 1;
  if ('3edc'.includes(k)) return 2;
  if ('4rtfgvb'.includes(k)) return 3;
  if ('5t'.includes(k)) return 3; // 5 sits on the left index finger too
  if ('6yuhn'.includes(k)) return 4;
  if ('7uijm'.includes(k)) return 5;
  if ('8ik,'.includes(k)) return 6;
  if ('9ol.'.includes(k)) return 7;
  if ('0p;/'.includes(k)) return 7;
  return 4;
}

export default function Keyboard({ nextKey, keyStats }: KeyboardProps) {
  const next = (nextKey ?? '').toLowerCase();
  return (
    <div className="keyboard" aria-label="On-screen keyboard">
      {ROWS.map((row, ri) => (
        <div className="kb-row" key={ri}>
          {row.map((key) => {
            const stats = keyStats?.[key];
            const weak =
              stats !== undefined &&
              stats.total >= 3 &&
              stats.correct / stats.total < 0.8;
            return (
              <span
                key={key}
                className={`kb-key zone-${zoneFor(key)}${next === key ? ' kb-next' : ''}${weak ? ' kb-weak' : ''}`}
                title={stats ? `${key}: ${stats.correct}/${stats.total} correct` : key}
              >
                {key}
              </span>
            );
          })}
        </div>
      ))}
      <div className="kb-row">
        <span className={`kb-key kb-space zone-4${next === ' ' ? ' kb-next' : ''}`}>
          space
        </span>
      </div>
      <p className="kb-legend">
        Colours = finger zones · glowing key = type this next · red outline = a key
        you miss often
      </p>
    </div>
  );
}
