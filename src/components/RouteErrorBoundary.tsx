import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorFallback from '@/components/ErrorFallback';

/**
 * RouteErrorBoundary — ErrorBoundary + the standard fallback, and it recovers
 * on its own when the user navigates to another route.
 */
export default function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname} renderFallback={reset => <ErrorFallback onRetry={reset} />}>
      {children}
    </ErrorBoundary>
  );
}
