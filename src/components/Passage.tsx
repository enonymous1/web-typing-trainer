import { useEffect } from 'react';
import type { RefObject } from 'react';

interface PassageProps {
  /** The full target text. */
  text: string;
  /** What the user has typed so far (prefix of, or equal to, `text`). */
  typed: string;
  /** The hidden input that captures keystrokes (created by the parent). */
  inputRef: RefObject<HTMLInputElement>;
  /** Accessible label for the hidden input. */
  inputLabel: string;
  /** Called with the new typed value on every keystroke. */
  onChange: (value: string) => void;
  /** Called when the user presses Tab inside the input, if provided. */
  onTab?: () => void;
}

/**
 * The shared typing surface for Test and Practice mode: progress bar,
 * char-by-char highlighting (correct green / wrong red / current caret),
 * and the invisible input that summons the mobile keyboard and captures
 * keystrokes. Extracted because both modes rendered the same ~40 lines
 * with the same focus-on-mount and click-to-focus behaviour.
 *
 * Focuses the input on mount so the user can type immediately, and on
 * any click on the passage (tap-to-focus on mobile).
 */
export default function Passage({
  text,
  typed,
  inputRef,
  inputLabel,
  onChange,
  onTab,
}: PassageProps) {
  useEffect(() => {
    inputRef.current?.focus();
    // Runs once on mount: inputRef is a stable ref object, so this
    // effect never re-runs. The parent re-focuses after round changes.
  }, [inputRef]);

  const focusInput = () => inputRef.current?.focus();

  return (
    <>
      <div className="progress" aria-hidden="true">
        <div
          className="progress-fill"
          style={{ width: `${text.length === 0 ? 0 : (typed.length / text.length) * 100}%` }}
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
          // Spaces stay regular spaces on purpose: rendering them as
          // non-breaking spaces (\u00A0) removed every line-break
          // opportunity, so the whole passage became one unbreakable
          // line that ran off the right edge of the card. A regular
          // space in its own span still renders, and the browser may
          // wrap after it. (Caught 2026-11-07 from a screenshot.)
          return (
            <span key={i} className={cls}>
              {ch}
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
          aria-label={inputLabel}
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && onTab) {
              e.preventDefault();
              onTab();
            }
          }}
        />
      </div>
    </>
  );
}
