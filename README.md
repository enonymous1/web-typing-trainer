# Typing Trainer — Test & Practice

A fun, static typing trainer built with **React + TypeScript + Vite**.
No backend, no account, no network calls — scores, history, and your
weakest keys live in `localStorage` in your browser.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest suite for the typing maths (WPM, accuracy, drills)
npm run build    # production build -> dist/
npm run preview  # serve the production build
```

## Test mode

- Timed tests: **15 / 30 / 60 seconds**
- Difficulty: **Easy** (common words, lowercase), **Medium** (capitals +
  punctuation), **Hard** (numbers, symbols, punctuation)
- Live WPM, accuracy, timer, progress bar, and a streak / combo counter
  (🔥 toasts at 25 / 50 / 100 / 200 correct characters in a row)
- Char-by-char highlighting: correct green, wrong red, current character
  with a blinking caret
- Results screen: WPM, raw WPM, accuracy %, correct / wrong characters,
  personal best per (time, difficulty), and your last 10 tests
- Tap the text to focus on mobile; the clock starts on your first keystroke
- `Tab` (or the Restart button) starts a new test

## Practice mode

- Drills: **Home Row, Top Row, Bottom Row, Numbers, Common Words**
- **Weak Keys**: built from your own mistakes (recorded after each test),
  repeating your weakest keys more often — falls back to the home row
  until you have mistakes recorded
- No timer, no pressure — finish a round and a fresh one loads
- Live WPM / accuracy, per-key accuracy, and an on-screen keyboard that
  highlights the next key with finger-zone colours (red outline = a key
  you miss often)

## Extras

- Light / dark theme toggle, persisted in `localStorage`
- Sound-free, keyboard-first, mobile-friendly

## Deploy to GitHub Pages

The build uses relative asset paths (`base: './'` in `vite.config.ts`), so
it works at a domain root and at a project subpath like
`https://enonymous1.github.io/web-typing-trainer/` with no repo name hardcoded.

One-time setup after pushing: repo Settings → Pages → Build and deployment
→ Source: **GitHub Actions**. After that, every push to `main` runs
`.github/workflows/pages.yml` (install → test → build → deploy `dist/`).
CI on every push/PR runs the same test + build on Ubuntu and Windows via
`.github/workflows/ci.yml` (Node 20).

## Push it

```bash
# Extract the push zip into an EMPTY folder, then:
git remote add origin https://github.com/enonymous1/web-typing-trainer.git
git push -u origin main
```

Create the empty public repo `enonymous1/web-typing-trainer` first. If the
push is rejected, stop — that means the remote has moved; do not force-push.
