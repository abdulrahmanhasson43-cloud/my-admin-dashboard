// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorFallback from '@/components/ErrorFallback';

/** A render error must replace only the crashed part with a fallback — never a blank screen. */

const crash = { on: true };

function Flaky(): ReactElement {
  if (crash.on) throw new Error('boom');
  return <p>healthy</p>;
}

beforeEach(() => {
  crash.on = true;
  // React logs every caught render error; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe('ErrorBoundary', () => {
  it('shows the fallback instead of crashing when a child throws', () => {
    render(
      <ErrorBoundary renderFallback={() => <p>fallback</p>}>
        <Flaky />
      </ErrorBoundary>,
    );
    expect(screen.getByText('fallback')).toBeTruthy();
  });

  it('renders the children untouched when nothing throws', () => {
    crash.on = false;
    render(
      <ErrorBoundary renderFallback={() => <p>fallback</p>}>
        <Flaky />
      </ErrorBoundary>,
    );
    expect(screen.getByText('healthy')).toBeTruthy();
    expect(screen.queryByText('fallback')).toBeNull();
  });

  it('retries when the fallback calls reset', () => {
    render(
      <ErrorBoundary renderFallback={reset => <button onClick={reset}>retry</button>}>
        <Flaky />
      </ErrorBoundary>,
    );
    crash.on = false;
    fireEvent.click(screen.getByText('retry'));
    expect(screen.getByText('healthy')).toBeTruthy();
  });

  it('retries by itself when the reset key changes (the user went to another route)', () => {
    const tree = (key: string) => (
      <ErrorBoundary resetKey={key} renderFallback={() => <p>fallback</p>}>
        <Flaky />
      </ErrorBoundary>
    );
    const { rerender } = render(tree('/a'));
    expect(screen.getByText('fallback')).toBeTruthy();

    crash.on = false;
    rerender(tree('/b'));
    expect(screen.getByText('healthy')).toBeTruthy();
  });

  it('stays on the fallback if the reset key has not changed', () => {
    const tree = (key: string) => (
      <ErrorBoundary resetKey={key} renderFallback={() => <p>fallback</p>}>
        <Flaky />
      </ErrorBoundary>
    );
    const { rerender } = render(tree('/a'));
    crash.on = false;
    rerender(tree('/a'));
    expect(screen.getByText('fallback')).toBeTruthy();
  });
});

describe('ErrorFallback', () => {
  it('announces the problem and offers a retry', () => {
    const onRetry = vi.fn();
    render(<ErrorFallback onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByText('حاول مرة أخرى'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
