import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * الفكرة #24 — اختصارات لوحة المفاتيح العالمية.
 *
 * يضيف هذا الـ hook اختصارات Ctrl لمستخدمي سطح المكتب:
 *   Ctrl+F     →  التركيز على حقل البحث في نقطة البيع
 *   Ctrl+Enter →  الدفع السريع (يُحفّز زر الدفع في POS)
 *   + / -      →  زيادة/تقليل كمية المنتج المحدد (داخل POS فقط)
 *   Delete      →  إزالة المنتج المحدد من السلة (داخل POS فقط)
 *   Ctrl+K     →  لوحة الأوامر (Command Palette)
 *   Ctrl+N     →  فاتورة جديدة (يذهب إلى POS فارغة)
 *   Ctrl+P     →  طباعة الفاتورة الحالية
 *   Ctrl+1     →  الانتقال إلى لوحة التحكم
 *   Ctrl+2     →  الانتقال إلى نقطة البيع
 *   Ctrl+3     →  الانتقال إلى المنتجات
 *
 * كما يحتفظ بالاختصارات السابقة:
 *   Alt + key  →  التنقل السريع بين الأقسام
 *   g then <letter> →  وتر من حرفين (vim-inspired)
 *   /          →  تركيز حقل البحث
 *   Esc        →  إغلاق/إلغاء التركيز
 *
 * عند تنفيذ أي اختصار يظهر إشعار (toast) قصير يؤكد الإجراء.
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

  // Toast helper — concise and informative
  const notify = useCallback((label: string) => {
    toast(label, {
      duration: 1800,
      position: 'top-center',
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
    });
  }, []);

  // Dispatch a custom event so POS page can react to Ctrl+Enter, +/-, Delete
  const dispatchPOSEvent = useCallback((type: string, payload?: unknown) => {
    window.dispatchEvent(new CustomEvent('vuno:pos-shortcut', { detail: { type, payload } }));
  }, []);

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
      // Esc always works — blur active element
      if (e.key === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        resetChord();
        return;
      }

      // ─── Ctrl-based shortcuts (Idea #24) ───
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        // Ctrl+K — Command palette (let CommandPalette hook handle it natively)
        if (key === 'k') {
          // Don't preventDefault — the useCommandPalette hook handles Ctrl+K
          resetChord();
          return;
        }

        // Ctrl+F — focus search in POS (prevent browser default find)
        if (key === 'f') {
          if (location.pathname === '/pos') {
            e.preventDefault();
            const searchInput =
              document.querySelector<HTMLInputElement>('input[data-pos-search="true"]') ||
              document.querySelector<HTMLInputElement>('input[type="search"]') ||
              document.querySelector<HTMLInputElement>('input[placeholder*="بحث"]');
            searchInput?.focus();
            notify('🔍 تم تركيز البحث');
          }
          resetChord();
          return;
        }

        // Ctrl+Enter — Quick pay in POS
        if (e.key === 'Enter') {
          if (location.pathname === '/pos') {
            e.preventDefault();
            dispatchPOSEvent('quick-pay');
            notify('⚡ دفع سريع');
          }
          resetChord();
          return;
        }

        // Ctrl+N — New invoice (go to fresh POS)
        if (key === 'n') {
          e.preventDefault();
          // Dispatch event to clear cart, then navigate
          dispatchPOSEvent('clear-cart');
          go('/pos');
          notify('🧾 فاتورة جديدة');
          resetChord();
          return;
        }

        // Ctrl+P — Print current invoice
        if (key === 'p') {
          // Only intercept in invoice/receipt contexts
          if (location.pathname.includes('/invoices') || location.pathname.includes('/pos')) {
            e.preventDefault();
            dispatchPOSEvent('print');
            notify('🖨️ طباعة الفاتورة');
          }
          resetChord();
          return;
        }

        // Ctrl+1/2/3 — Quick navigation
        if (key === '1') {
          e.preventDefault();
          go('/dashboard');
          notify('🏠 لوحة التحكم');
          resetChord();
          return;
        }
        if (key === '2') {
          e.preventDefault();
          go('/pos');
          notify('🛒 نقطة البيع');
          resetChord();
          return;
        }
        if (key === '3') {
          e.preventDefault();
          go('/products');
          notify('📦 المنتجات');
          resetChord();
          return;
        }

        // If it's some other Ctrl combo (like Ctrl+C, Ctrl+V), let it pass through
        resetChord();
        return;
      }

      // ─── POS-only single-key shortcuts (+/- and Delete) ───
      if (!e.altKey && !e.ctrlKey && !e.metaKey && location.pathname === '/pos') {
        if (e.key === '+' || e.key === '=') {
          if (!isTypingTarget(e.target)) {
            e.preventDefault();
            dispatchPOSEvent('quantity-increment');
            notify('➕ زيادة الكمية');
            resetChord();
            return;
          }
        }
        if (e.key === '-' || e.key === '_') {
          if (!isTypingTarget(e.target)) {
            e.preventDefault();
            dispatchPOSEvent('quantity-decrement');
            notify('➖ تقليل الكمية');
            resetChord();
            return;
          }
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (!isTypingTarget(e.target)) {
            e.preventDefault();
            dispatchPOSEvent('remove-selected');
            notify('🗑️ إزالة من السلة');
            resetChord();
            return;
          }
        }
      }

      // "/" focuses the first visible search input on the page
      if (e.key === '/' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (isTypingTarget(e.target)) return;
        e.preventDefault();
        const searchInput =
          document.querySelector<HTMLInputElement>('input[type="search"]') ||
          document.querySelector<HTMLInputElement>('input[placeholder*="بحث"]') ||
          document.querySelector<HTMLInputElement>('input[data-pos-search="true"]');
        searchInput?.focus();
        resetChord();
        return;
      }

      // Alt-based navigation (legacy convention, kept for compatibility)
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
          chordTimer = setTimeout(resetChord, 800);
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
  }, [enabled, go, location.pathname, notify, dispatchPOSEvent]);
}

/**
 * Static list of available desktop shortcuts — used by the Shortcuts page.
 * Keeping it here means the documentation stays in sync with the hook.
 */
export interface ShortcutDef {
  keys: string[];
  label: string;
  description: string;
  group: 'navigation' | 'actions' | 'pos';
}

export const desktopShortcuts: ShortcutDef[] = [
  // Ctrl-based shortcuts (Idea #24)
  { keys: ['Ctrl', 'F'], label: 'بحث في POS', description: 'التركيز على حقل البحث في نقطة البيع', group: 'pos' },
  { keys: ['Ctrl', 'Enter'], label: 'دفع سريع', description: 'تأكيد الدفع فورًا في نقطة البيع', group: 'pos' },
  { keys: ['+'], label: 'زيادة الكمية', description: 'زيادة كمية المنتج المحدد في السلة', group: 'pos' },
  { keys: ['-'], label: 'تقليل الكمية', description: 'تقليل كمية المنتج المحدد في السلة', group: 'pos' },
  { keys: ['Delete'], label: 'إزالة المنتج', description: 'إزالة المنتج المحدد من السلة', group: 'pos' },
  { keys: ['Ctrl', 'K'], label: 'لوحة الأوامر', description: 'فتح لوحة الأوامر السريعة (Command Palette)', group: 'actions' },
  { keys: ['Ctrl', 'N'], label: 'فاتورة جديدة', description: 'فتح نقطة البيع بفاتورة فارغة', group: 'actions' },
  { keys: ['Ctrl', 'P'], label: 'طباعة', description: 'طباعة الفاتورة الحالية', group: 'actions' },
  { keys: ['Ctrl', '1'], label: 'لوحة التحكم', description: 'الانتقال السريع إلى لوحة التحكم', group: 'navigation' },
  { keys: ['Ctrl', '2'], label: 'نقطة البيع', description: 'الانتقال السريع إلى نقطة البيع', group: 'navigation' },
  { keys: ['Ctrl', '3'], label: 'المنتجات', description: 'الانتقال السريع إلى المنتجات', group: 'navigation' },
  // Legacy shortcuts
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
