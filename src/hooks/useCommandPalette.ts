import { useEffect, useState, useCallback } from 'react';

/**
 * Hook للتحكم في فتح/إغلاق لوحة الأوامر.
 * يستمع لـ Ctrl+K (أو Cmd+K على Mac) لفتح اللوحة، و Esc للإغلاق.
 * الفكرة #1: لوحة الأوامر (Command Palette).
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K أو Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      // Esc يغلق اللوحة
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen(prev => !prev), []);

  return { open, setOpen, openPalette, closePalette, togglePalette };
}
