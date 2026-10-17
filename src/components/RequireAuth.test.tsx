// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from '@/components/RequireAuth';
import { AuthProvider } from '@/context/AuthContext';
import { DataServicesProvider } from '@/context/data-services-context';
import { useSignOut } from '@/hooks/useSignOut';
import { installDomStubs, signInForTests, signOutForTests } from '@/test-utils/domStubs';

/** The guard and the sign-out hook, with the real AuthService behind them. */

beforeAll(installDomStubs);
beforeEach(signOutForTests);
afterEach(() => cleanup());

function SignOutButton() {
  const signOut = useSignOut();
  return <button onClick={signOut}>sign out</button>;
}

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DataServicesProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<p>login screen</p>} />
            <Route element={<RequireAuth />}>
              <Route
                path="/private"
                element={
                  <>
                    <p>private screen</p>
                    <SignOutButton />
                  </>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </DataServicesProvider>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  it('sends a visitor with no session to the login screen', () => {
    renderAt('/private');
    expect(screen.getByText('login screen')).toBeTruthy();
    expect(screen.queryByText('private screen')).toBeNull();
  });

  it('lets a signed-in user through', () => {
    signInForTests();
    renderAt('/private');
    expect(screen.getByText('private screen')).toBeTruthy();
  });

  it('a stored session that is not well formed does not open the guard', () => {
    window.localStorage.setItem('vuno_auth_session', '{"signedInAt":"not a date"}');
    renderAt('/private');
    expect(screen.getByText('login screen')).toBeTruthy();
  });

  it('signing out leads to the login screen and stays signed out after a reload', () => {
    signInForTests();
    renderAt('/private');
    fireEvent.click(screen.getByText('sign out'));
    expect(screen.getByText('login screen')).toBeTruthy();

    cleanup();
    renderAt('/private'); // a fresh mount reads the session again, like a page reload
    expect(screen.getByText('login screen')).toBeTruthy();
  });
});
