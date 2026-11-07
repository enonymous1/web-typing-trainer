import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import Passage from './Passage';

function renderPassage(text: string, typed = ''): string {
  return renderToStaticMarkup(
    createElement(Passage, {
      text,
      typed,
      inputRef: { current: null },
      inputLabel: 'Type here',
      onChange: () => {},
    }),
  );
}

describe('Passage wrapping', () => {
  it('renders spaces as regular spaces, not non-breaking spaces', () => {
    // Regression test (2026-11-07): spaces were rendered as \u00A0, which
    // removed every line-break opportunity, so the whole passage became
    // one unbreakable line that ran off the right edge of the card.
    const markup = renderPassage('answer should even slow');
    expect(markup).not.toContain('\u00A0');
    expect(markup).toContain('<span class="char"> </span>');
  });

  it('renders every character of a long passage', () => {
    const text =
      'answer should even slow find back next off not dark there look or where letter there dark queen';
    const markup = renderPassage(text);
    expect(markup).not.toContain('\u00A0');
    // Each character lives in its own span, so words never appear as
    // contiguous strings in the markup — strip the tags and compare the
    // visible text instead.
    const visibleText = markup.replace(/<[^>]*>/g, '');
    expect(visibleText).toBe(text);
  });
});
