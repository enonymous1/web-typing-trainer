import { useEffect, useState } from 'react';
import TestMode from './components/TestMode';
import PracticeMode from './components/PracticeMode';
import ErrorBoundary from './components/ErrorBoundary';
import { getTheme, saveTheme } from './lib/storage';

type Mode = 'test' | 'practice';
type Theme = 'light' | 'dark';

/**
 * The OS theme to use when the user has never saved a preference:
 * `prefers-color-scheme` on first load, guarded so server-side or
 * old-browser environments (no matchMedia) fall back to light.
 */
function preferredTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [mode, setMode] = useState<Mode>('test');
  // A saved theme wins; with nothing saved (or a corrupt value) the OS
  // preference decides instead of always assuming light.
  const [theme, setTheme] = useState<Theme>(() => getTheme() ?? preferredTheme());

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  return (
    <div className="app" data-theme={theme}>
      <header className="header">
        <div>
          <h1>⌨️ Typing Trainer</h1>
          <p className="tagline">
            Test your speed, then train your weak spots. No account — your
            bests live in your browser.
          </p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <nav className="mode-tabs" aria-label="Mode">
        <button
          type="button"
          className={mode === 'test' ? 'tab active' : 'tab'}
          onClick={() => setMode('test')}
        >
          ⏱️ Test
        </button>
        <button
          type="button"
          className={mode === 'practice' ? 'tab active' : 'tab'}
          onClick={() => setMode('practice')}
        >
          🎯 Practice
        </button>
      </nav>

      <main>
        <ErrorBoundary>{mode === 'test' ? <TestMode /> : <PracticeMode />}</ErrorBoundary>
      </main>

      <footer className="footer">
        <p>
          Timed tests: 15 / 30 / 60 seconds · Easy / Medium / Hard. Practice
          drills: home, top and bottom rows, numbers, common words, and Weak
          Keys built from your own mistakes. Scores and history are stored in
          localStorage only — nothing leaves your device.
        </p>
      </footer>
    </div>
  );
}
