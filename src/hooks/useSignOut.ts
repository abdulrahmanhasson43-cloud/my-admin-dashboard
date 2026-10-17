import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context-value';

/**
 * useSignOut — ends the session and sends the user to the login screen.
 * Shared by every sign-out button so they cannot drift apart (one of them used
 * to only navigate and another only showed a message — neither ended anything).
 */
export function useSignOut() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    signOut();
    navigate('/login', { replace: true });
  }, [signOut, navigate]);
}
