import { useMemo } from 'react';
import { toast } from 'sonner';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useProducts } from '@/context/products-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import { useShift } from '@/context/shift-context-value';
import { useBranch } from '@/context/branch-context-value';
import {
  WhatsAppIcon, ClockIcon, NotificationIcon, SendIcon, CheckIcon,
} from '@/components/icons';

/**
 * إعدادات الملخص اليومي عبر WhatsApp — الفكرة #20
 *
 * يتيح للمالك:
 *  - تفعيل/إيقاف الملخص اليومي
 *  - تحديد وقت الإرسال
 *  - إدخال رقم WhatsApp المستلم
 *  - معاينة الرسالة
 *  - إرسال يدوي فوري عبر wa.me
 */
export default function DailySummarySection() {
  const {
    dailySummaryEnabled, setDailySummaryEnabled,
    dailySummaryTime, setDailySummaryTime,
    dailySummaryPhone, setDailySummaryPhone,
    receiptSettings,
  } = useAppSettings();
  const storeName = receiptSettings.storeName;
  const { products } = useProducts();
  const { lowStockThreshold = 10 } = useAppSettings();
  const { activities } = useActivityLog();
  const { currentShift, shifts } = useShift();
  const { activeBranch } = useBranch();

  /** توليد نص الملخص اليومي — الفكرة #20 */
  const summaryMessage = useMemo(() => {
    const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

    // مبيعات اليوم من سجل النشاط
    const todaySales = activities.filter((a) => a.type === 'sale');
    const totalSales = todaySales.reduce((sum, a) => sum + (a.amount ?? 0), 0);

    // المنتجات منخفضة المخزون
    const lowStock = products.filter((p) => p.status === 'active' && p.storeStock < lowStockThreshold);

    // ورديات اليوم المغلقة + الحالية
    const todayClosed = shifts.filter((s) => s.status === 'closed');

    const lines: string[] = [];
    lines.push(`📊 *ملخص يومي — ${storeName || 'متجر Vuno'}*`);
    lines.push(`📅 ${today}`);
    if (activeBranch) lines.push(`🏷️ الفرع: ${activeBranch.name}`);
    lines.push('');
    lines.push(`💰 إجمالي المبيعات: ${totalSales.toLocaleString()} EGP`);
    lines.push(`🧾 عدد الفواتير: ${todaySales.length}`);
    lines.push('');
    if (currentShift) {
      lines.push(`👷 وردية مفتوحة: ${currentShift.cashierName}`);
      lines.push(`   مبيعات الوردية: ${currentShift.totalSales.toLocaleString()} EGP`);
    } else if (todayClosed.length > 0) {
      lines.push(`👷 ورديات مغلقة اليوم: ${todayClosed.length}`);
    }
    lines.push('');
    lines.push(`📦 منتجات منخفضة المخزون: ${lowStock.length}`);
    if (lowStock.length > 0) {
      lowStock.slice(0, 5).forEach((p) => {
        lines.push(`   • ${p.name}: ${p.storeStock} قطعة`);
      });
    }
    lines.push('');
    lines.push(`🤖 Vuno — نظام إدارة المتجر`);

    return lines.join('\n');
  }, [activities, products, lowStockThreshold, storeName, activeBranch, currentShift, shifts]);

  /** تنسيق رقم WhatsApp */
  const formatWhatsAppNumber = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('0')) cleaned = '20' + cleaned.slice(1);
    if (!cleaned.startsWith('20') && !cleaned.startsWith('+')) cleaned = '20' + cleaned;
    return cleaned.replace(/^\+/, '');
  };

  /** إرسال الملخص عبر wa.me — الفكرة #20 */
  const handleSendNow = () => {
    if (!dailySummaryPhone.trim()) {
      toast.error('أدخل رقم WhatsApp أولاً');
      return;
    }
    const number = formatWhatsAppNumber(dailySummaryPhone);
    const encoded = encodeURIComponent(summaryMessage);
    window.open(`https://wa.me/${number}?text=${encoded}`, '_blank', 'noopener,noreferrer');
    toast.success('تم فتح WhatsApp بالملخص اليومي');
  };

  return (
    <div className="space-y-5">
      {/* Toggle card */}
      <div className="card-vuno p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'color-mix(in srgb, #25D366 10%, transparent)' }}
            >
              <WhatsAppIcon size={22} className="text-[#25D366]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--vuno-text)]">الملخص اليومي عبر WhatsApp</h3>
              <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5 leading-relaxed">
                استلم ملخصًا يوميًا بمبيعاتك ومخزونك على WhatsApp في وقت محدد
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={() => {
              setDailySummaryEnabled(!dailySummaryEnabled);
              toast.success(dailySummaryEnabled ? 'تم إيقاف الملخص اليومي' : 'تم تفعيل الملخص اليومي');
            }}
            className="relative w-12 h-7 rounded-full transition-colors flex-shrink-0"
            style={{ background: dailySummaryEnabled ? '#25D366' : 'var(--vuno-border)' }}
            aria-label="تفعيل الملخص اليومي"
          >
            <span
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ right: dailySummaryEnabled ? '2px' : '26px' }}
            />
          </button>
        </div>
      </div>

      {/* Settings — only visible when enabled */}
      {dailySummaryEnabled && (
        <>
          {/* Time + Phone inputs */}
          <div className="card-vuno p-5 space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 flex items-center gap-1.5">
                <ClockIcon size={14} className="text-[var(--vuno-text-muted)]" />
                وقت الإرسال اليومي
              </label>
              <input
                type="time"
                dir="ltr"
                value={dailySummaryTime}
                onChange={(e) => setDailySummaryTime(e.target.value)}
                className="w-full h-11 px-4 rounded-xl text-[14px] font-medium"
                style={{
                  background: 'var(--vuno-surface)',
                  border: '1px solid var(--vuno-border)',
                  color: 'var(--vuno-text)',
                }}
              />
              <p className="text-[11px] text-[var(--vuno-text-muted)] mt-1.5">
                سيتم تذكيرك بإرسال الملخص يوميًا في هذا الوقت
              </p>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 flex items-center gap-1.5">
                <WhatsAppIcon size={14} className="text-[#25D366]" />
                رقم WhatsApp المستلم
              </label>
              <input
                type="tel"
                dir="ltr"
                inputMode="tel"
                value={dailySummaryPhone}
                onChange={(e) => setDailySummaryPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-11 px-4 rounded-xl text-[14px] font-medium text-left"
                style={{
                  background: 'var(--vuno-surface)',
                  border: '1px solid var(--vuno-border)',
                  color: 'var(--vuno-text)',
                }}
              />
              <p className="text-[11px] text-[var(--vuno-text-muted)] mt-1.5">
                أدخل رقمًا مصريًا (يُضاف تلقائيًا كود +20)
              </p>
            </div>
          </div>

          {/* Message preview */}
          <div className="card-vuno p-5">
            <div className="flex items-center gap-2 mb-3">
              <NotificationIcon size={16} className="text-[var(--vuno-primary)]" />
              <h4 className="text-[13px] font-semibold text-[var(--vuno-text)]">معاينة الرسالة</h4>
            </div>
            <pre
              dir="rtl"
              className="whitespace-pre-wrap text-[12.5px] leading-relaxed rounded-xl p-4 font-sans"
              style={{
                background: 'color-mix(in srgb, #25D366 5%, transparent)',
                border: '1px solid color-mix(in srgb, #25D366 15%, transparent)',
                color: 'var(--vuno-text)',
              }}
            >
              {summaryMessage}
            </pre>

            {/* Send button */}
            <button
              onClick={handleSendNow}
              className="w-full h-12 rounded-full text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-transform active:scale-95 mt-4"
              style={{ background: '#25D366' }}
            >
              <SendIcon size={18} />
              إرسال الملخص الآن عبر WhatsApp
            </button>
            <p className="text-[11px] text-[var(--vuno-text-muted)] text-center mt-2 flex items-center justify-center gap-1">
              <CheckIcon size={12} className="text-[var(--vuno-success)]" />
              سيتم فتح WhatsApp برسالة جاهزة للإرسال
            </p>
          </div>
        </>
      )}
    </div>
  );
}
