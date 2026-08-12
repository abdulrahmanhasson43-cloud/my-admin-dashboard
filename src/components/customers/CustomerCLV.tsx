/**
 * components/customers/CustomerCLV.tsx
 * ============================================================
 *  الفكرة #35 — Customer Lifetime Value (CLV)
 *  حساب وعرض قيمة العميل مدى الحياة + مستواه (VIP/ممتاز/عادي/خامل).
 *  يعرض: إجمالي المشتريات، عدد الفواتير، متوسط الفاتورة، الأشهر النشطة،
 *  التوقع المستقبلي، والمستوى مع الأيقونة واللون المناسب.
 * ============================================================
 */

import { motion } from 'framer-motion';
import type { CustomerCLV as CLVData } from '@/types';
import { tierMeta } from '@/types';
import { computeCLV, forecastCLV } from '@/lib/analytics';
import type { Client } from '@/types';
import {
  DollarSignIcon,
  ReceiptIcon,
  CalendarIcon,
  TrendingUpIcon,
  CoinsIcon,
  UserIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface CustomerCLVProps {
  /** بيانات العميل */
  client: Client;
  /** أنشطة العميل (للحساب) — اختياري */
  activities?: { type: string; amount?: number; date: string }[];
  /** وضع العرض: 'full' بطاقة كاملة، 'compact' صف مختصر */
  variant?: 'full' | 'compact';
}

function fmtEGP(n: number): string {
  return n.toLocaleString('en-US') + ' ج.م';
}

export default function CustomerCLV({ client, activities = [], variant = 'full' }: CustomerCLVProps) {
  const clv = computeCLV(client, activities);
  const forecast = forecastCLV(clv, 12);
  const meta = tierMeta[clv.tier];

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border', meta.bgColor, meta.color, meta.borderColor)}>
        <span>{meta.emoji}</span>
        <span>{meta.label}</span>
        <span className="text-[var(--vuno-text-muted)] font-normal tabular-nums">· {fmtEGP(clv.totalPurchases)}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-vuno p-5"
    >
      {/* الرأس: الاسم + المستوى */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center flex-shrink-0">
            <UserIcon size={22} className="text-[var(--vuno-primary)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--vuno-text)]">{client.name}</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">{client.phone}</p>
          </div>
        </div>
        <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border', meta.bgColor, meta.color, meta.borderColor)}>
          <span className="text-base">{meta.emoji}</span>
          {meta.label}
        </div>
      </div>

      {/* القيمة الكلية (CLV) */}
      <div className="rounded-2xl bg-gradient-to-br from-[var(--vuno-primary)] to-[var(--vuno-primary-light)] p-4 mb-4 text-white">
        <div className="flex items-center gap-1.5 mb-1 opacity-80">
          <CoinsIcon size={14} />
          <span className="text-[11px]">قيمة العميل مدى الحياة (CLV)</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{fmtEGP(clv.totalPurchases)}</p>
        <div className="flex items-center gap-1 mt-2 opacity-70">
          <TrendingUpIcon size={12} />
          <span className="text-[10px]">متوقع خلال 12 شهر: {fmtEGP(forecast)}</span>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatTile
          icon={<ReceiptIcon size={14} />}
          label="عدد الفواتير"
          value={String(clv.invoiceCount)}
          color="bg-blue-50 text-blue-600"
        />
        <StatTile
          icon={<DollarSignIcon size={14} />}
          label="متوسط الفاتورة"
          value={fmtEGP(clv.averageInvoice)}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatTile
          icon={<CalendarIcon size={14} />}
          label="أشهر نشطة"
          value={String(clv.monthsActive)}
          color="bg-purple-50 text-purple-600"
        />
        <StatTile
          icon={<TrendingUpIcon size={14} />}
          label="آخر شراء"
          value={clv.lastPurchase}
          color="bg-amber-50 text-amber-600"
        />
      </div>
    </motion.div>
  );
}

/** بطاقة إحصائية صغيرة */
function StatTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--vuno-surface-pearl)]">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--vuno-text-muted)]">{label}</p>
        <p className="text-[13px] font-bold text-[var(--vuno-text)] tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

export { computeCLV, forecastCLV };
export type { CLVData };
