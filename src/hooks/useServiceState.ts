import { useCallback, useRef, useState } from 'react';

/**
 * useServiceState — React state for a value whose rules live in a service.
 *
 * The service methods take the CURRENT value and return the NEXT one, so the
 * provider needs a way to read "current" synchronously and apply "next" without
 * putting side effects (saving, notifying) inside a `setState(prev => …)`
 * updater — updaters must be pure, and React may run them twice.
 *
 * `update` computes from the latest value (kept in a ref, so two calls in the
 * same tick both see each other's result), stores it, and returns it. The
 * returned `update` and `read` keep the same identity for the component's
 * lifetime, so they are safe in effect dependency lists.
 */
export function useServiceState<T>(load: () => T) {
  const [state, setState] = useState<T>(load);
  const latest = useRef<T>(state);

  const update = useCallback((compute: (current: T) => T): T => {
    const next = compute(latest.current);
    latest.current = next;
    setState(next);
    return next;
  }, []);

  const read = useCallback((): T => latest.current, []);

  return [state, update, read] as const;
}
