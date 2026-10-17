import { useCallback, useEffect, useRef, useState } from 'react';
import { SAVED_NOTICE_MS } from '@/lib/settings';

/**
 * useSavedNotice — the "تم الحفظ بنجاح" message: `show()` turns it on and it turns itself off after SAVED_NOTICE_MS.
 * Saving again while it is showing starts the two seconds over (so it never disappears right after a save),
 * and leaving the screen cancels the pending timer.
 */
export function useSavedNotice() {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback(() => {
    clearTimeout(timer.current);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), SAVED_NOTICE_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { visible, show };
}
