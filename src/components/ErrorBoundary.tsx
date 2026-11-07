import { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort catch for render errors in the modes — e.g. a corrupt
 * value in localStorage that validation missed. Without this, one bad
 * render whitescreens the whole app with no way back. The fallback
 * explains what happened and offers to clear the saved data (all
 * `wtt-*` keys) and reload, which is the only recovery a user can do
 * from inside the app.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Visible in devtools for diagnosis; the UI below is what the user sees.
    console.error('Typing Trainer crashed:', error);
  }

  private clearSavedDataAndReload = (): void => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key !== null && key.startsWith('wtt-')) keys.push(key);
      }
      for (const key of keys) localStorage.removeItem(key);
    } catch {
      // Even clearing can fail (private mode) — reload anyway.
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <div className="error-fallback" role="alert">
          <h2>Something went wrong</h2>
          <p>
            The trainer hit an unexpected error and couldn&apos;t render.
            Your saved scores may be corrupted — clearing them usually
            fixes it.
          </p>
          <p className="hint">
            <code>{this.state.error.message}</code>
          </p>
          <div className="actions">
            <button type="button" onClick={this.clearSavedDataAndReload}>
              Clear saved data &amp; reload
            </button>
            <button type="button" onClick={() => this.setState({ error: null })}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
