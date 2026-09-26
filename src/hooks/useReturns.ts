import { useCallback, useEffect, useState } from 'react';
import type { ReturnRequest } from '@/types/return';
import type { CreateReturnInput } from '@/services/return';
import { useReturnService } from '@/context/return-service-context';
import { toErrorMessage } from '@/lib/utils';

/**
 * useReturns — layers ordinary React state (loading/error/returns/refetch) on
 * top of ReturnService so components get a familiar reactive API, while every
 * bit of business logic and data access stays in ReturnService +
 * IReturnRepository underneath.
 *
 * A failed read is recorded in `error` instead of being swallowed, and every
 * mutation re-throws after recording the message so the page can show the
 * banner and keep its own try/catch around the action.
 */
export function useReturns() {
  const returnService = useReturnService();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pure fetch — returns the snapshot WITHOUT touching state, so it can be
  // reused by the initial effect and by refetch, and calling it from an effect
  // doesn't trip react-hooks/set-state-in-effect.
  const load = useCallback(() => returnService.getAllReturns(), [returnService]);

  // Initial read — state updates live inside promise callbacks, and the
  // cancelled flag guards against updating an unmounted component.
  useEffect(() => {
    let cancelled = false;
    load()
      .then((all) => {
        if (cancelled) return;
        setReturns(all);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await load();
      setReturns(all);
      setError(null);
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  const createReturn = useCallback(async (input: CreateReturnInput) => {
    try {
      const created = await returnService.createReturn(input);
      setReturns(prev => [created, ...prev]);
      return created;
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    }
  }, [returnService]);

  const advanceReturnStatus = useCallback(async (id: string) => {
    try {
      const updated = await returnService.advanceReturnStatus(id);
      setReturns(prev => prev.map(r => (r.id === id ? updated : r)));
      return updated;
    } catch (e: unknown) {
      setError(toErrorMessage(e));
      throw e;
    }
  }, [returnService]);

  return { returns, isLoading, error, refetch, createReturn, advanceReturnStatus };
}
