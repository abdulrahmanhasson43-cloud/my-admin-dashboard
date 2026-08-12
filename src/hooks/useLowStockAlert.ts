import { useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useNotifications } from '@/context/notifications-context-value';

/**
 * تنبيه نقص المخزون عند فتح التطبيق — الفكرة #15
 *
 * عند أول تحميل للتطبيق:
 *  1. يبحث عن المنتجات التي storeStock < lowStockThreshold
 *  2. يُصدر صوت beep عبر Web Audio API
 *  3. يُظهر toast تفاعلي مع زر "عرض المخزون"
 *  4. يُضيف إشعارًا إلى مركز التنبيهات
 *
 * يُستدعى مرة واحدة فقط (useRef guard) لتفادي التكرار.
 */
export function useLowStockAlert() {
  const { products } = useProducts();
  const { lowStockThreshold = 10 } = useAppSettings();
  const { notifyLowStock } = useNotifications();
  const firedRef = useRef(false);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.storeStock < lowStockThreshold && p.status === 'active'),
    [products, lowStockThreshold],
  );

  useEffect(() => {
    if (firedRef.current) return;
    if (lowStockProducts.length === 0) return;
    firedRef.current = true;

    // ▸ 1. صوت beep عبر Web Audio API (لا حاجة لملف mp3)
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // تجاهل أخطاء الصوت (قد يكون مكتومًا في بعض المتصفحات)
    }

    // ▸ 2. اهتزاز على الأجهزة المحمولة
    try {
      navigator.vibrate?.([120, 60, 120]);
    } catch {
      // ignore
    }

    // ▸ 3. Toast تفاعلي
    const names = lowStockProducts.slice(0, 3).map((p) => p.name).join('، ');
    const extra = lowStockProducts.length > 3 ? ` (+${lowStockProducts.length - 3})` : '';
    toast.warning(`⚠️ ${lowStockProducts.length} منتج على وشك النفاد: ${names}${extra}`, {
      duration: 6000,
      action: {
        label: 'عرض المخزون',
        onClick: () => {
          window.location.hash = '#/inventory';
        },
      },
    });

    // ▸ 4. إشعار في مركز التنبيهات
    notifyLowStock(lowStockProducts.map((p) => p.name));
  }, [lowStockProducts, notifyLowStock]);

  return { lowStockCount: lowStockProducts.length, lowStockProducts };
}
