import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useSalesGoal } from '@/context/sales-goal-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import {
  LightbulbIcon, TrendingUpIcon,
  TagIcon, TargetIcon,
} from '@/components/icons';

/**
 * بطاقات الذكاء الاصطناعي — توصيات ذكية للمالك — الفكرة #19
 *
 * يُحلل البيانات ويُولّد بطاقات توصيات ديناميكية:
 *  - "زِد مخزون هذا المنتج" (للمنتجات على وشك النفاد)
 *  - "اعمل عرضًا على هذا المنتج" (للمنتجات الراكدة — مخزون عالي بدون مبيعات)
 *  - "تقدّمك نحو الهدف" (نسبة تحقق هدف المبيعات)
 *  - "منتج رابح — ركّز عليه" (أعلى هامش ربح)
 */
export default function AIInsightsWidget() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { lowStockThreshold = 10 } = useAppSettings();
  const { currentGoal, progressPercent, isGoalReached } = useSalesGoal();
  const { activities } = useActivityLog();

  const insights = useMemo(() => {
    const list: InsightCard[] = [];

    // ▸ متوسط المبيعات اليومية من سجل النشاط
    const saleActivities = activities.filter((a) => a.type === 'sale');
    const totalSalesAmount = saleActivities.reduce((sum, a) => sum + (a.amount ?? 0), 0);

    // ▸ 1. منتجات راكدة — "اعمل عرضًا" (مخزون عالي + قليل المبيعات)
    // ملاحظة: اقتراح "زِد المخزون" اتشال من هنا عشان مكرر مع قسم
    // "تنبيهات المخزون" (LowStockAlertsWidget) اللي فوق مباشرة —
    // مفيش داعي نقول نفس الكلام مرتين في نفس الصفحة.
    const stagnant = products
      .filter((p) => p.status === 'active' && p.stock > 30 && p.storeStock > 15)
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 1);
    if (stagnant.length > 0) {
      const discount = Math.round(((stagnant[0].price - stagnant[0].cost) / stagnant[0].price) * 100);
      list.push({
        id: 'offer',
        type: 'info',
        icon: TagIcon,
        title: 'اعرض خصمًا على هذا المنتج',
        message: `«${stagnant[0].name}» مخزونه مرتفع (${stagnant[0].stock} قطعة). اقترح خصم ${Math.max(10, Math.min(discount, 25))}% لتحريكه.`,
        action: { label: 'إنشاء فاتورة', path: '/invoice' },
      });
    }

    // ▸ 3. تقدّم الهدف
    if (currentGoal) {
      if (isGoalReached) {
        list.push({
          id: 'goal-done',
          type: 'success',
          icon: TargetIcon,
          title: 'وصلت لهدف الشهر!',
          message: `حققت ${currentGoal.achieved.toLocaleString()} EGP من أصل ${currentGoal.target.toLocaleString()} EGP. ضع هدفًا أعلى للشهر القادم.`,
          action: { label: 'عدّل الهدف', path: '/dashboard' },
        });
      } else {
        const remaining = currentGoal.target - currentGoal.achieved;
        list.push({
          id: 'goal-progress',
          type: progressPercent >= 75 ? 'success' : progressPercent >= 40 ? 'info' : 'warning',
          icon: TargetIcon,
          title: `تقدّمك نحو الهدف: ${progressPercent}%`,
          message: `تبقى ${remaining.toLocaleString()} EGP لبلوغ هدف الشهر. بمعدل ${Math.ceil(remaining / 30).toLocaleString()} EGP يوميًا.`,
          action: { label: 'عرض لوحة المبيعات', path: '/dashboard' },
        });
      }
    }

    // ▸ 4. منتج رابح — أعلى هامش ربح
    const profitable = products
      .filter((p) => p.status === 'active')
      .map((p) => ({ p, margin: p.price - p.cost, marginPct: ((p.price - p.cost) / p.price) * 100 }))
      .sort((a, b) => b.marginPct - a.marginPct)[0];
    if (profitable && profitable.marginPct > 40) {
      list.push({
        id: 'profit',
        type: 'success',
        icon: TrendingUpIcon,
        title: 'ركّز على هذا المنتج الرابح',
        message: `«${profitable.p.name}» هامش ربحه ${Math.round(profitable.marginPct)}%. اعمل حملة تسويقية له لزيادة المبيعات.`,
        action: { label: 'عرض المنتجات', path: '/inventory' },
      });
    }

    // ▸ 5. ملخص المبيعات إذا لا توجد رؤى كافية
    if (list.length === 0 && totalSalesAmount > 0) {
      list.push({
        id: 'summary',
        type: 'info',
        icon: LightbulbIcon,
        title: 'مبيعاتك تسير جيدًا',
        message: `إجمالي المبيعات المسجلة: ${totalSalesAmount.toLocaleString()} EGP. واصل المراقبة لتحسين الأداء.`,
        action: { label: 'لوحة التحكم', path: '/dashboard' },
      });
    }

    return list.slice(0, 4);
  }, [products, lowStockThreshold, currentGoal, progressPercent, isGoalReached, activities]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-1"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)' }}
        >
          <LightbulbIcon size={18} className="text-[var(--vuno-primary)]" />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-[var(--vuno-text)]">رؤى ذكية</h3>
          <p className="text-[11px] text-[var(--vuno-text-muted)]">
            توصيات مبنية على بيانات متجرك
          </p>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)', color: 'var(--vuno-primary)' }}
        >
          AI
        </span>
      </div>

      {/* Insight rows — small quiet tinted rows (soft background per type,
          no border/shadow) so this section reads differently from the
          plain white rows used in Low Stock, matching the "small quiet
          card, not big heavy card" preference. */}
      <div>
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          const colors = TYPE_STYLES[insight.type];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.24) }}
              className="flex items-start gap-3 p-3 rounded-2xl mb-2 last:mb-0"
              style={{ background: colors.bg }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: colors.iconBg }}
              >
                <Icon size={15} className={colors.iconClass} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-[var(--vuno-text)] leading-snug">
                    {insight.title}
                  </p>
                  {insight.action && (
                    <button
                      onClick={() => navigate(insight.action!.path)}
                      className="flex-shrink-0 text-[11px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                      style={{ color: colors.actionColor }}
                    >
                      {insight.action.label}
                      <span aria-hidden>←</span>
                    </button>
                  )}
                </div>
                <p className="text-[11.5px] text-[var(--vuno-text-secondary)] mt-0.5 leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Types ─────────────────────────────────────────── */
type InsightType = 'success' | 'warning' | 'info' | 'danger';

interface InsightCard {
  id: string;
  type: InsightType;
  icon: React.FC<{ className?: string; size?: number }>;
  title: string;
  message: string;
  action?: { label: string; path: string };
}

const TYPE_STYLES: Record<
  InsightType,
  { bg: string; border: string; iconBg: string; iconClass: string; actionColor: string }
> = {
  success: {
    bg: 'color-mix(in srgb, #16a34a 5%, transparent)',
    border: 'color-mix(in srgb, #16a34a 20%, transparent)',
    iconBg: 'color-mix(in srgb, #16a34a 12%, transparent)',
    iconClass: 'text-green-600',
    actionColor: '#16a34a',
  },
  warning: {
    bg: 'color-mix(in srgb, #f59e0b 5%, transparent)',
    border: 'color-mix(in srgb, #f59e0b 20%, transparent)',
    iconBg: 'color-mix(in srgb, #f59e0b 12%, transparent)',
    iconClass: 'text-amber-600',
    actionColor: '#d97706',
  },
  info: {
    bg: 'color-mix(in srgb, var(--vuno-primary) 5%, transparent)',
    border: 'color-mix(in srgb, var(--vuno-primary) 20%, transparent)',
    iconBg: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)',
    iconClass: 'text-[var(--vuno-primary)]',
    actionColor: 'var(--vuno-primary)',
  },
  danger: {
    bg: 'color-mix(in srgb, var(--vuno-danger) 5%, transparent)',
    border: 'color-mix(in srgb, var(--vuno-danger) 20%, transparent)',
    iconBg: 'color-mix(in srgb, var(--vuno-danger) 12%, transparent)',
    iconClass: 'text-red-600',
    actionColor: 'var(--vuno-danger)',
  },
};

