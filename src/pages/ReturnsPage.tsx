import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  PlusIcon, RefundIcon, DollarSignIcon, PackageIcon, CheckIcon,
} from '@/components/icons';
import DataStatus from '@/components/DataStatus';
import StatsRow from '@/components/StatsRow';
import ReturnCard from '@/components/returns/ReturnCard';
import ReturnListRow from '@/components/returns/ReturnListRow';
import CreateReturnModal from '@/components/returns/CreateReturnModal';
import { useReturns } from '@/hooks/useReturns';
import type { CreateReturnInput } from '@/services/return';
import { getReturnStatusMeta } from '@/types/return';
import { formatThousands } from '@/lib/utils';

type Tab = 'customer' | 'supplier';

const TABS: { id: Tab; label: string }[] = [
  { id: 'customer', label: 'مرتجعات العملاء' },
  { id: 'supplier', label: 'مرتجعات الموردين' },
];

/**
 * Returns: customer and supplier return requests, moving each one pending → approved → refunded
 * (the stock effect of the last step is in services/return/ProcessReturn.ts).
 * The cards and the new-return form are in components/returns/, the form's state in hooks/useReturnForm.ts,
 * and what can be returned is decided by lib/returns.ts.
 */
export default function ReturnsPage() {
  const [tab, setTab] = useState<Tab>('customer');
  const [showModal, setShowModal] = useState(false);
  const { returns, isLoading, error, refetch, advanceReturnStatus, createReturn } = useReturns();

  const filtered = useMemo(() =>
    returns.filter(r => r.type === tab).sort((a, b) => b.date.localeCompare(a.date)),
  [returns, tab]);

  const advanceStatus = async (id: string) => {
    try {
      const updated = await advanceReturnStatus(id);
      toast.success(`تم تحديث حالة المرتجع إلى ${getReturnStatusMeta(updated.status).label}`);
    } catch {
      // The hook has already recorded the error in `error` — the banner shows it.
    }
  };

  const handleCreate = async (input: CreateReturnInput) => {
    try {
      const ret = await createReturn(input);
      setShowModal(false);
      toast.success(`تم إنشاء المرتجع ${ret.id}`);
    } catch {
      // The hook has already recorded the error in `error` — the banner shows it.
    }
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;
  const refundedCount = returns.filter(r => r.status === 'refunded').length;
  const totalRefund = returns.filter(r => r.status === 'refunded').reduce((s, r) => s + r.refundAmount, 0);

  const stats = [
    { label: 'إجمالي المرتجعات', value: returns.length.toString(), icon: RefundIcon, color: 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-primary)]' },
    { label: 'قيد المراجعة', value: pendingCount.toString(), icon: PackageIcon, color: 'bg-orange-50 text-orange-600' },
    { label: 'تم الاسترداد', value: refundedCount.toString(), icon: CheckIcon, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'إجمالي المسترد', value: `${formatThousands(totalRefund)} ج.م`, icon: DollarSignIcon, color: 'bg-red-50 text-[var(--vuno-danger)]' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <StatsRow items={stats} />

      <DataStatus
        spaced
        error={error}
        isLoading={isLoading}
        isEmpty={returns.length === 0}
        onRetry={refetch}
      />

      {/* Tabs + Add button */}
      <div className="flex items-center justify-between gap-3 mt-5 mb-4">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'gradient-btn text-white'
                  : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-11 px-4 rounded-full text-white font-medium flex items-center gap-2 hover:opacity-90 flex-shrink-0 whitespace-nowrap"
          style={{ background: 'var(--vuno-primary)' }}
        >
          <PlusIcon size={18} />
          <span className="hidden sm:inline">مرتجع جديد</span>
        </button>
      </div>

      {/* Returns list — flat rows on mobile, boxed-card grid on desktop
          where the extra width makes cards feel natural again */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RefundIcon size={48} className="text-[var(--vuno-text-muted)] mb-3" />
          <p className="text-[var(--vuno-text-secondary)] font-medium">لا توجد مرتجعات {tab === 'customer' ? 'للعملاء' : 'للموردين'} حالياً</p>
          <p className="text-[var(--vuno-text-muted)] text-sm mt-1">اضغط "مرتجع جديد" لإنشاء واحد</p>
        </div>
      ) : (
        <>
          <div className="lg:hidden">
            {filtered.map(ret => (
              <ReturnListRow key={ret.id} ret={ret} onAdvance={advanceStatus} />
            ))}
          </div>
          <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(ret => (
              <ReturnCard key={ret.id} ret={ret} onAdvance={advanceStatus} />
            ))}
          </div>
        </>
      )}

      {showModal && (
        <CreateReturnModal type={tab} onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
