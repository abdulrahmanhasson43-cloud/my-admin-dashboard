import { vi } from 'vitest';
import { STORAGE_KEYS } from '@/constants/storageKeys';

/**
 * Browser APIs jsdom does not provide but the app (recharts, framer-motion,
 * the router, the receipt sound) touches. Call once in `beforeAll` of a
 * jsdom-environment test.
 */
export function installDomStubs(): void {
  const noop = () => undefined;

  class FakeObserver {
    observe = noop;
    unobserve = noop;
    disconnect = noop;
    takeRecords = () => [];
  }
  vi.stubGlobal('ResizeObserver', FakeObserver);
  vi.stubGlobal('IntersectionObserver', FakeObserver);

  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: noop,
    removeEventListener: noop,
    addListener: noop,
    removeListener: noop,
    dispatchEvent: () => false,
  }));

  class FakeAudio {
    play = () => Promise.resolve();
  }
  vi.stubGlobal('Audio', FakeAudio);

  window.scrollTo = noop as typeof window.scrollTo;
  // Mark onboarding as done so the wizard does not cover the page.
  window.localStorage.setItem('vuno_onboarding_done', 'true');
}

/**
 * Seeds a signed-in session (the same shape AuthService.signIn stores) so a test
 * can open private routes. Call it AFTER any `localStorage.clear()`.
 */
export function signInForTests() {
  window.localStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify({ signedInAt: new Date().toISOString() }));
}

/** Removes the session so a test can check what a signed-out visitor sees. */
export function signOutForTests() {
  window.localStorage.removeItem(STORAGE_KEYS.authSession);
}
