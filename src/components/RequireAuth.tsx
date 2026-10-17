import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth-context-value';

/**
 * RequireAuth — the route guard. Wrap every private route in it; a visitor
 * without a session is sent to the login screen instead of seeing the page.
 *
 * Note: while sign-in is simulated (phase 3 adds a backend), this keeps the
 * app's flow honest but is NOT a security boundary — the data is in the browser.
 */
export default function RequireAuth() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}
