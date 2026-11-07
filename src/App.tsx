import { useEffect, useState } from 'react';
import TestMode from './components/TestMode';
import PracticeMode from './components/PracticeMode';
import { getTheme, saveTheme } from './lib/storage';

type Mode = 'test' | 'practice';
type Theme = 'light' | 'dark';

export default function App() {
  const [mode, setMode] = useState<Mode>('test');
  const [theme, setTheme] = useState<Theme>(() => getTheme());

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

      <main>{mode === 'test' ? <TestMode /> : <PracticeMode />}</main>

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
