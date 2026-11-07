# Typing Trainer — Test & Practice

A fun, static typing trainer built with **React + TypeScript + Vite**.
Test your speed against the clock, then train your weak spots with
focused drills. No backend, no account, no network calls.

## Description

Typing Trainer has two modes:

- **Test mode** — timed typing tests (15 / 30 / 60 seconds) at Easy,
  Medium, or Hard difficulty, with live WPM and accuracy, char-by-char
  highlighting, streak toasts, and a results screen with personal bests
  and your last 10 tests.
- **Practice mode** — untimed drills for the home row, top row, bottom
  row, numbers, and common words, plus a **Weak Keys** drill built from
  your own mistakes, with an on-screen keyboard that highlights the
  next key in finger-zone colours.

Everything is stored in your browser's `localStorage` — scores,
history, mistake counts, and theme. Nothing leaves your device, and
the app works fully offline once loaded.

## Prerequisites

- **Node.js 20** (the version CI uses; any Node 20.x works)
- **npm** (ships with Node)

No other accounts, keys, or services are needed.

## Installation

```bash
git clone https://github.com/enonymous1/web-typing-trainer.git
cd web-typing-trainer
npm ci
```

`npm ci` installs the exact versions from `package-lock.json`. Use
`npm install` only if you intentionally want to update dependencies.

## Local Development

```bash
npm run dev      # dev server at http://localhost:5173, with hot reload
npm test         # Vitest suite (typing maths, word lists, storage, keyboard)
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally to smoke-test it
```

The dev server reloads on save. The production build is a static
site: `dist/` contains only HTML, CSS, and JS, with relative asset
paths (`base: './'` in `vite.config.ts`) so it works at a domain root
and at a GitHub Pages project subpath with no repo name hardcoded.

## Testing

```bash
npm test         # run once
npm run test:watch  # watch mode while developing
```

Tests live next to the code they cover (`src/lib/*.test.ts`,
`src/components/Keyboard.test.ts`) and use Vitest with injectable
random generators so word and drill generation is deterministic.
Coverage includes the WPM / accuracy / streak maths, the Easy
all-lowercase invariant, drill word purity (every drill word uses
only its drill's keys), storage shape validation against corrupt or
wrong-shape `localStorage` values, and keyboard zone mapping.

## Deployment

The site deploys to **GitHub Pages** via GitHub Actions — no manual
upload step:

1. Push to `main`. `.github/workflows/pages.yml` runs `npm ci`,
   `npm test`, `npm run build`, then deploys `dist/`.
2. One-time repo setup: Settings → Pages → Build and deployment →
   Source: **GitHub Actions**. The site is then live at
   `https://enonymous1.github.io/web-typing-trainer/`.

Every push and pull request also runs `.github/workflows/ci.yml`,
which runs the same test + build on **Ubuntu and Windows** (Node 20).

## How scoring works

- **WPM** = (correctly typed characters ÷ 5) ÷ (minutes elapsed).
  One "word" is the standard 5 characters, so WPM measures correct
  characters, not words completed.
- **Raw WPM** uses the same formula over *every* character typed,
  correct or not — the gap between raw and net WPM is your error cost.
- **Accuracy** = correct characters ÷ total characters typed × 100.
  No input yet counts as 100%.
- **Streak** = consecutive correct characters. Toasts fire at 25, 50,
  100, and 200 characters in a row.
- **Personal best** is the highest WPM per (duration, difficulty)
  pair — 15s Easy and 60s Hard are separate bests.
- **Weak Keys** ranks keys by how often you mistype them (most errors
  first, ties broken alphabetically) and repeats your weakest keys
  about twice as often as filler in the drill.

The clock starts on your first keystroke, not on page load. A test
ends when the timer runs out or when you finish the passage, whichever
comes first.

## Project structure

```
src/
  App.tsx                  Mode tabs, theme toggle, error boundary
  main.tsx                 React entry point
  index.css                All styles (plain CSS, light/dark via data-theme)
  components/
    TestMode.tsx           Timed tests, HUD, results wiring
    PracticeMode.tsx       Drills, live clock, per-key accuracy
    Results.tsx            Results screen + last-10 history
    Passage.tsx            Shared typing surface (chars, hidden input)
    Keyboard.tsx           On-screen keyboard + finger zones
    ErrorBoundary.tsx      Crash fallback with clear-saved-data recovery
  hooks/
    useToast.ts            Self-dismissing status toast
  lib/
    typing.ts              WPM/accuracy/streak maths, text generation
    words.ts               Word pools and drill definitions
    storage.ts             Validated localStorage persistence
    *.test.ts              Vitest suites
```

## Privacy

- Scores, history, mistake counts, and theme live in `localStorage`
  under keys prefixed `wtt-`. No analytics, no cookies, no network
  requests, no account.
- Clearing your browser data (or the in-app recovery button on a
  crash screen) deletes everything — there is no server copy.
- The app never reads or sends keystrokes anywhere: typing is
  processed locally to update the display.

## Known limitations

- **No sync.** Scores live in one browser only; there is no account
  or cross-device history.
- **History is capped at 10 tests** and there is no export or
  clear-history button yet.
- **Bottom Row is a key-sequence drill, not words.** The bottom row
  has no vowels, so no English word can be spelled with bottom-row
  keys alone — the drill trains random bottom-row sequences instead.
- **Keyboard zones are column-based.** The on-screen keyboard colours
  keys by column, which diverges from strict touch-typing fingers on
  the right home row (j → zone 5, not the right index), and `z` falls
  back to zone 4. See the `zoneFor` docs in `src/components/Keyboard.tsx`.
- **Paste-to-cheat is not handled.** Pasting text into the hidden
  input counts as typed characters; there is no paste detection yet.
- **No linting configured yet.** There is no ESLint/Prettier setup;
  adding one (including the React Hooks rules) is planned follow-up
  work, not part of this release.
- **Component tests are unit-only.** The suites cover the pure
  functions and storage; the React components have no rendered tests
  (no Testing Library installed).
