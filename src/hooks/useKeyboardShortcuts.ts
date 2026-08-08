import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * A registry of keyboard shortcuts designed in our own way.
 * These are intentionally NOT advertised in the main UI — they are power-user
 * conveniences that desktop users can discover on the dedicated Shortcuts page.
 *
 * Convention (our own, deliberately different from spreadsheet apps):
 *   Alt + key  →  quick navigation between primary sections
 *   Alt + S    →  open the POS (point of sale) — the heart of the platform
 *   Alt + P    →  jump to Products
 *   Alt + I    →  jump to Invoices
 *   Alt + R    →  jump to Reports
 *   Alt + ,    →  open Settings
 *
 * Single-key helpers (only when NOT typing in an input):
 *   g then d   →  go to Dashboard (two-key "go" chord, vim-inspired but ours)
 *   g then p   →  go to Products
 *   g then i   →  go to Invoices
 *   g then s   →  go to POS
 *   /          →  focus the first search field on the page
 *   Esc        →  blur active element / close overlays
 */
type ShortcutHandler = () => void;

interface ShortcutMap {
  [combo: string]: ShortcutHandler;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
}

export function useKeyboardShortcuts(enabled: boolean = true): void {
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (path: string) => {
      if (location.pathname !== path) navigate(path);
    },
    [navigate, location.pathname],
  );

  // Two-key chord state (e.g. "g" then "d")
  useEffect(() => {
    if (!enabled) return;

    let chordPrefix: string | null = null;
    let chordTimer: ReturnType<typeof setTimeout> | null = null;

    const chordMap: Record<string, string> = {
      d: '/dashboard',
      p: '/products',
      i: '/invoices',
      s: '/pos',
      r: '/reports',
      e: '/inventory',
      c: '/categories',
      t: '/settings',
    };

    const resetChord = () => {
      chordPrefix = null;
      if (chordTimer) clearTimeout(chordTimer);
      chordTimer = null;
    };

    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      // Esc always works — blur active element
      if (e.key === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        resetChord();
        return;
      }

      // "/" focuses the first visible search input on the page
      if (e.key === '/' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput =
          document.querySelector<HTMLInputElement>('input[type="search"]') ||
          document.querySelector<HTMLInputElement>('input[placeholder*="بحث"]') ||
          document.querySelector<HTMLInputElement>('input[type="text"]');
        searchInput?.focus();
        resetChord();
        return;
      }

      // Alt-based navigation (our own convention)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const altMap: ShortcutMap = {
          s: () => go('/pos'),
          p: () => go('/products'),
          i: () => go('/invoices'),
          r: () => go('/reports'),
          e: () => go('/inventory'),
          ',': () => go('/settings'),
          d: () => go('/dashboard'),
        };
        const handler = altMap[e.key.toLowerCase()];
        if (handler) {
          e.preventDefault();
          handler();
          resetChord();
          return;
        }
      }

      // Two-key "go" chord: g then <letter>
      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        if (chordPrefix === 'g') {
          const path = chordMap[key];
          if (path) {
            e.preventDefault();
            go(path);
          }
          resetChord();
        } else if (key === 'g') {
          chordPrefix = 'g';
          if (chordTimer) clearTimeout(chordTimer);
          chordTimer = setTimeout(resetChord, 800); // reset if second key not pressed
          e.preventDefault();
        } else {
          resetChord();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (chordTimer) clearTimeout(chordTimer);
    };
  }, [enabled, go]);
}

/**
 * Static list of available desktop shortcuts — used by the Shortcuts page.
 * Keeping it here means the documentation stays in sync with the hook.
 */
export interface ShortcutDef {
  keys: string[];
  label: string;
  description: string;
  group: 'navigation' | 'actions';
}

export const desktopShortcuts: ShortcutDef[] = [
  { keys: ['Alt', 'S'], label: 'نقطة البيع', description: 'افتح شاشة البيع مباشرةً', group: 'navigation' },
  { keys: ['Alt', 'P'], label: 'المنتجات', description: 'انتقل إلى صفحة المنتجات', group: 'navigation' },
  { keys: ['Alt', 'I'], label: 'الفواتير', description: 'انتقل إلى قائمة الفواتير', group: 'navigation' },
  { keys: ['Alt', 'E'], label: 'المخزون', description: 'افتح صفحة المخزون', group: 'navigation' },
  { keys: ['Alt', 'R'], label: 'التقارير', description: 'عرض التقارير والرسوم البيانية', group: 'navigation' },
  { keys: ['Alt', ','], label: 'الإعدادات', description: 'افتح صفحة الإعدادات', group: 'navigation' },
  { keys: ['Alt', 'D'], label: 'الرئيسية', description: 'ارجع إلى لوحة التحكم', group: 'navigation' },
  { keys: ['g', 'd'], label: 'اذهب → الرئيسية', description: 'وتر من حرفين: اضغط g ثم d', group: 'navigation' },
  { keys: ['g', 'p'], label: 'اذهب → المنتجات', description: 'وتر من حرفين: اضغط g ثم p', group: 'navigation' },
  { keys: ['g', 's'], label: 'اذهب → نقطة البيع', description: 'وتر من حرفين: اضغط g ثم s', group: 'navigation' },
  { keys: ['/'], label: 'البحث السريع', description: 'ركّز على حقل البحث في الصفحة الحالية', group: 'actions' },
  { keys: ['Esc'], label: 'إغلاق', description: 'أغلق النوافذ المنبثقة أو ألغِ التركيز', group: 'actions' },
];
