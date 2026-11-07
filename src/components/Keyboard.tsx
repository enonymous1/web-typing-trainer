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
 * Finger zone for a key: 0 left pinky … 7 right pinky, 4 = space (thumbs).
 * Zones colour the keyboard so the user learns which finger owns each key.
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
