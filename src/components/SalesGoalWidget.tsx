import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSalesGoal } from '@/context/sales-goal-context-value';
import { TargetIcon, CheckIcon, ZapIcon } from '@/components/icons';

/**
 * ودجت هدف المبيعات الشهري — الفكرة #3.
 * يعرض شريط تقدم متحرك، النسبة المئوية، المبلغ المحقق والهدف.
 * يسمح بتغيير الهدف عبر زر "تعديل الهدف".
 */
export default function SalesGoalWidget() {
  const { currentGoal, setTarget, progressPercent, isGoalReached } = useSalesGoal();
  const [editing, setEditing] = useState(false);
  const [inputTarget, setInputTarget] = useState(currentGoal?.target.toString() ?? '100000');

  const remaining = (currentGoal?.target ?? 0) - (currentGoal?.achieved ?? 0);

  const handleSave = () => {
    const val = parseInt(inputTarget, 10);
    if (Number.isFinite(val) && val > 0) {
      setTarget(val);
    }
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: isGoalReached ? 'color-mix(in srgb, var(--vuno-success) 15%, transparent)' : 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
          >
            {isGoalReached ? (
              <CheckIcon size={20} className="text-[var(--vuno-success)]" />
            ) : (
              <TargetIcon size={20} className="text-[var(--vuno-primary)]" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-[15px] text-[var(--vuno-text)]">هدف المبيعات الشهري</h3>
            <p className="text-[11px] text-[var(--vuno-text-muted)]">{currentGoal?.month}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setInputTarget(currentGoal?.target.toString() ?? '100000');
            setEditing(!editing);
          }}
          className="text-[11px] font-medium text-[var(--vuno-primary)] hover:opacity-70 transition-opacity px-3 py-1.5 rounded-full"
          style={{ border: '1px solid var(--vuno-border)' }}
        >
          {editing ? 'إلغاء' : 'تعديل الهدف'}
        </button>
      </div>

      {/* Edit mode */}
      {editing ? (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            value={inputTarget}
            onChange={e => setInputTarget(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-[14px] text-[var(--vuno-text)] focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
            placeholder="الهدف الشهري بـ EGP"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-full text-white font-medium text-[13px] flex-shrink-0"
            style={{ background: 'var(--vuno-primary)' }}
          >
            حفظ
          </button>
        </div>
      ) : null}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[13px] text-[var(--vuno-text-secondary)]">
            {(currentGoal?.achieved ?? 0).toLocaleString()} EGP
          </span>
          <span className="text-[13px] text-[var(--vuno-text-muted)]">
            من {(currentGoal?.target ?? 0).toLocaleString()} EGP
          </span>
        </div>
        <div
          className="relative h-3 rounded-full overflow-hidden"
          style={{ background: 'var(--vuno-border-light)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full flex items-center justify-end pr-1.5"
            style={{
              background: isGoalReached
                ? 'var(--vuno-success)'
                : progressPercent >= 75
                  ? 'var(--vuno-success)'
                  : progressPercent >= 50
                    ? 'var(--vuno-warning)'
                    : 'var(--vuno-primary)',
            }}
          >
            {progressPercent > 15 && (
              <span className="text-[9px] font-bold text-white tabular-nums">{progressPercent}%</span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">النسبة</p>
          <p className="text-[16px] font-bold text-[var(--vuno-text)] tabular-nums">{progressPercent}%</p>
        </div>
        <div className="text-center border-r border-l border-[var(--vuno-border-light)]">
          <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">المتبقي</p>
          <p className="text-[16px] font-bold text-[var(--vuno-text)] tabular-nums">
            {remaining > 0 ? remaining.toLocaleString() : '0'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">الحالة</p>
          <p
            className="text-[14px] font-bold flex items-center justify-center gap-1"
            style={{ color: isGoalReached ? 'var(--vuno-success)' : 'var(--vuno-text-secondary)' }}
          >
            {isGoalReached ? (
              <>
                <CheckIcon size={14} />
                مكتمل
              </>
            ) : progressPercent >= 75 ? (
              <>
                <ZapIcon size={14} />
                قريب
              </>
            ) : (
              'جاري'
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
