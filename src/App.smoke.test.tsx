// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { installDomStubs } from '@/test-utils/domStubs';

/**
 * Smoke test: the whole app (every provider, the composition root, the lazy
 * pages) renders in jsdom without throwing. It cannot judge how a screen LOOKS,
 * but it catches the failures a refactor actually causes — a missing provider,
 * a service nobody registered, a context that throws on first render.
 */

beforeAll(installDomStubs);

afterEach(() => cleanup());

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

const ROUTES = [
  '/dashboard', '/pos', '/products', '/inventory', '/invoices', '/orders', '/returns',
  '/clients', '/categories', '/suppliers', '/purchase-orders', '/branches', '/settings',
  '/reports', '/expenses', '/shifts', '/activity', '/analytics', '/bundles', '/profile',
];

describe('App smoke test', () => {
  it.each(ROUTES)('renders %s without crashing', async route => {
    const { container } = renderAt(route);
    // Lazy pages load asynchronously — wait until the spinner is replaced by content.
    await waitFor(() => expect(container.querySelector('.animate-spin')).toBeNull(), { timeout: 5000 });
    expect((container.textContent ?? '').trim().length).toBeGreaterThan(20);
  });
});
