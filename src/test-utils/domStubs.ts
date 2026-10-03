import { vi } from 'vitest';

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
