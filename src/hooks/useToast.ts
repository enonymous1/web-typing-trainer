import { useCallback, useEffect, useState } from 'react';

/**
 * A self-dismissing status toast, shared by Test and Practice mode.
 * Shows one message at a time and clears it after `timeoutMs`; showing
 * a new message restarts the timer. Returns the current message (or
 * null), a `showToast` setter, and a `dismissToast` that clears it now.
 */
export function useToast(timeoutMs = 3000) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), timeoutMs);
    return () => window.clearTimeout(t);
  }, [toast, timeoutMs]);

  const showToast = useCallback((message: string) => setToast(message), []);
  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}
