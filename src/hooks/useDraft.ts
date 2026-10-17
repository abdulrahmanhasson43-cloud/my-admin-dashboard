import { useCallback, useState } from 'react';

/**
 * useDraft — the values of a form while it is being edited, one setter for any field.
 * It lives in the page (not in the form), so what was typed is still there after the owner leaves the form and comes back.
 */
export function useDraft<T extends object>(initial: T) {
  const [draft, setDraft] = useState<T>(initial);
  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  }, []);
  return [draft, setField] as const;
}
