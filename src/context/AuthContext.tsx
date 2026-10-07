import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from '@/context/auth-context-value';
import { useDataServices } from './data-services-context-value';

/**
 * AuthProvider — holds "is someone signed in" in React state, so the route
 * guard and the sign-out buttons re-render the moment it changes. The rule
 * itself (and where the session is kept) lives in AuthService.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth: service } = useDataServices();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => service.isSignedIn());

  const signIn = useCallback(() => {
    service.signIn();
    setIsSignedIn(true);
  }, [service]);

  const signOut = useCallback(() => {
    service.signOut();
    setIsSignedIn(false);
  }, [service]);

  const value = useMemo(() => ({ isSignedIn, signIn, signOut }), [isSignedIn, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
