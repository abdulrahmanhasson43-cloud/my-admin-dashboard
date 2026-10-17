// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { POS_SHORTCUT_EVENT, routePosShortcut, usePosShortcuts, type PosShortcutActions } from './usePosShortcuts';

type FakeActions = { [K in keyof PosShortcutActions]: Mock<() => void> };

function fakeActions(): FakeActions {
  return {
    quickPay: vi.fn<() => void>(),
    clearCart: vi.fn<() => void>(),
    increment: vi.fn<() => void>(),
    decrement: vi.fn<() => void>(),
    removeLast: vi.fn<() => void>(),
    print: vi.fn<() => void>(),
  };
}

function fire(type: string) {
  act(() => {
    window.dispatchEvent(new CustomEvent(POS_SHORTCUT_EVENT, { detail: { type } }));
  });
}

afterEach(() => vi.restoreAllMocks());

describe('routePosShortcut', () => {
  it.each([
    ['quick-pay', 'quickPay'],
    ['clear-cart', 'clearCart'],
    ['quantity-increment', 'increment'],
    ['quantity-decrement', 'decrement'],
    ['remove-selected', 'removeLast'],
    ['print', 'print'],
  ] as const)('%s runs only %s', (type, action) => {
    const actions = fakeActions();
    routePosShortcut(type, actions);
    expect(actions[action]).toHaveBeenCalledTimes(1);
    const others = Object.entries(actions).filter(([name]) => name !== action);
    for (const [, fn] of others) expect(fn).not.toHaveBeenCalled();
  });

  it('ignores a shortcut name it does not know', () => {
    const actions = fakeActions();
    routePosShortcut('something-else', actions);
    for (const fn of Object.values(actions)) expect(fn).not.toHaveBeenCalled();
  });
});

describe('usePosShortcuts', () => {
  it('runs the action for an event fired on window', () => {
    const actions = fakeActions();
    renderHook(() => usePosShortcuts(actions));
    fire('clear-cart');
    expect(actions.clearCart).toHaveBeenCalledTimes(1);
  });

  it('attaches its listener once, however many times the screen re-renders', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { rerender } = renderHook(({ actions }) => usePosShortcuts(actions), { initialProps: { actions: fakeActions() } });
    rerender({ actions: fakeActions() });
    rerender({ actions: fakeActions() });

    const attached = add.mock.calls.filter(([name]) => name === POS_SHORTCUT_EVENT);
    const detached = remove.mock.calls.filter(([name]) => name === POS_SHORTCUT_EVENT);
    expect(attached).toHaveLength(1);
    expect(detached).toHaveLength(0);
  });

  it('always runs the latest actions, so it sees the current cart', () => {
    const first = fakeActions();
    const second = fakeActions();
    const { rerender } = renderHook(({ actions }) => usePosShortcuts(actions), { initialProps: { actions: first } });
    rerender({ actions: second });

    fire('quick-pay');
    expect(second.quickPay).toHaveBeenCalledTimes(1);
    expect(first.quickPay).not.toHaveBeenCalled();
  });

  it('stops listening when the screen goes away', () => {
    const actions = fakeActions();
    const { unmount } = renderHook(() => usePosShortcuts(actions));
    unmount();
    fire('quick-pay');
    expect(actions.quickPay).not.toHaveBeenCalled();
  });
});
