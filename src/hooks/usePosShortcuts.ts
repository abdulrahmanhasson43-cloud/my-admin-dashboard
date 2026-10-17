import { useEffect, useRef } from 'react';

/** What each POS keyboard shortcut does; the page supplies the behaviour. */
export interface PosShortcutActions {
  /** Ctrl+Enter — pay the cart. */
  quickPay: () => void;
  clearCart: () => void;
  /** `+` on the last added line. */
  increment: () => void;
  /** `−` on the last added line. */
  decrement: () => void;
  /** Delete — removes the last added line. */
  removeLast: () => void;
  print: () => void;
}

/** The window event useKeyboardShortcuts dispatches for POS-specific keys. */
export const POS_SHORTCUT_EVENT = 'vuno:pos-shortcut';

/** Maps a shortcut name from the event to its action; unknown names do nothing. */
export function routePosShortcut(type: string, actions: PosShortcutActions): void {
  switch (type) {
    case 'quick-pay': actions.quickPay(); break;
    case 'clear-cart': actions.clearCart(); break;
    case 'quantity-increment': actions.increment(); break;
    case 'quantity-decrement': actions.decrement(); break;
    case 'remove-selected': actions.removeLast(); break;
    case 'print': actions.print(); break;
  }
}

/**
 * usePosShortcuts — listens for the POS shortcut event.
 *
 * The listener is registered once. It always calls the latest `actions`
 * through a ref, so it sees the current cart without being re-attached on
 * every render (the page used to remove and re-add it each render).
 */
export function usePosShortcuts(actions: PosShortcutActions): void {
  const latest = useRef(actions);
  useEffect(() => {
    latest.current = actions;
  });

  useEffect(() => {
    const onShortcut = (event: Event) => {
      const detail = (event as CustomEvent<{ type: string }>).detail;
      routePosShortcut(detail.type, latest.current);
    };
    window.addEventListener(POS_SHORTCUT_EVENT, onShortcut);
    return () => window.removeEventListener(POS_SHORTCUT_EVENT, onShortcut);
  }, []);
}
