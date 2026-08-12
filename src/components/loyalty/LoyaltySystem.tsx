/**
 * components/loyalty/LoyaltySystem.tsx
 * ============================================================
 *  الفكرة #36 — Loyalty Points System (نظام نقاط الولاء)
 *  عرض نقاط العميل، مستواه (برونزي/فضي/ذهبي/بلاتيني)، شريط التقدم
 *  للمستوى التالي، سجل كسب واستبدال النقاط، وخيارات المكافآت.
 * ============================================================
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LoyaltySummary, RewardOption } from '@/types';
import {
  loyaltyLevels,
  getLoyaltyLevel,
  getNextLoyaltyLevel,
  rewardOptions,
} from '@/types';
import {
  CoinsIcon,
  StarIcon,
  TrendingUpIcon,
  SparklesIcon,
  CheckIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

interface LoyaltySystemProps {
  /** ملخص نقاط العميل */
  summary: LoyaltySummary;
  /** معرف العميل — لعرض السجل */
  clientId?: string;
  /** سجل كسب النقاط */
  earnedHistory?: { id: string; invoiceId: string; points: number; date: string }[];
  /** سجل استبدال النقاط */
  redeemedHistory?: { id: string; reward: string; pointsSpent: number; date: string }[];
  /** دالة استبدال نقاط (اختياري) */
  onRedeem?: (reward: RewardOption) => void;
  title?: string;
}

export default function LoyaltySystem({
  summary,
  clientId: _clientId,
  earnedHistory = [],
  redeemedHistory = [],
  onRedeem,
  title = 'نظام نقاط الولاء',
}: LoyaltySystemProps) {
  const [tab, setTab] = useState<'rewards' | 'history'>('rewards');
  const { currentPoints, totalEarned, redeemedPoints, level, nextLevel, pointsToNext } = summary;
  const progressPercent = nextLevel
    ? Math.min(100, Math.round((currentPoints / nextLevel.minPoints) * 100))
    : 100;

  return (
    <div className="card-vuno p-5">
      {/* العنوان */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
          <CoinsIcon size={18} className="text-[var(--vuno-primary)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--vuno-text)]">{title}</h3>
          <p className="text-[11px] text-[var(--vuno-text-muted)]">نقاطك ومكافآتك</p>
        </div>
      </div>

      {/* المستوى + النقاط الحالية */}
      <div className={cn('rounded-2xl p-4 mb-4', level.bgColor)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{level.emoji}</span>
            <div>
              <p className={cn('text-sm font-bold', level.color)}>{level.label}</p>
              <p className="text-[11px] text-[var(--vuno-text-muted)]">مستواك الحالي</p>
            </div>
          </div>
          <div className="text-left">
            <p className={cn('text-2xl font-bold tabular-nums', level.color)}>{currentPoints.toLocaleString()}</p>
            <p className="text-[10px] text-[var(--vuno-text-muted)]">نقطة</p>
          </div>
        </div>

        {/* شريط التقدم للمستوى التالي */}
        {nextLevel ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[var(--vuno-text-secondary)]">
                تحتاج {pointsToNext.toLocaleString()} نقطة للمستوى {nextLevel.label} {nextLevel.emoji}
              </span>
              <span className="text-[10px] font-semibold text-[var(--vuno-text-secondary)] tabular-nums">{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/60 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-full', level.color.replace('text-', 'bg-'))}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--vuno-text-secondary)]">
            <StarIcon size={12} />
            وصلت للمستوى الأعلى! 🎉
          </div>
        )}
      </div>

      {/* ملخص النقاط */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <PointStat label="إجمالي المكتسب" value={totalEarned} icon={<TrendingUpIcon size={12} />} color="text-emerald-600" />
        <PointStat label="إجمالي المستبدل" value={redeemedPoints} icon={<CoinsIcon size={12} />} color="text-amber-600" />
        <PointStat label="المتبقي" value={currentPoints} icon={<StarIcon size={12} />} color="text-[var(--vuno-primary)]" />
      </div>

      {/* جدول المستويات */}
      <div className="flex items-center justify-between gap-1 mb-4">
        {loyaltyLevels.map((lvl) => {
          const isCurrent = lvl.label === level.label;
          const isPassed = currentPoints >= lvl.minPoints;
          return (
            <div
              key={lvl.label}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-center transition-all',
                isCurrent ? cn(lvl.bgColor, 'scale-105 shadow-sm') : 'opacity-50',
              )}
            >
              <span className="text-base">{lvl.emoji}</span>
              <span className={cn('text-[9px] font-semibold', isPassed ? lvl.color : 'text-[var(--vuno-text-muted)]')}>
                {lvl.label}
              </span>
              <span className="text-[8px] text-[var(--vuno-text-muted)] tabular-nums">{lvl.minPoints}+</span>
            </div>
          );
        })}
      </div>

      {/* التبويبات: المكافآت / السجل */}
      <div className="flex gap-1 p-1 bg-[var(--vuno-surface-pearl)] rounded-xl mb-3">
        <button
          onClick={() => setTab('rewards')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors',
            tab === 'rewards' ? 'bg-white text-[var(--vuno-primary)] shadow-sm' : 'text-[var(--vuno-text-muted)]',
          )}
        >
          <SparklesIcon size={14} />
          المكافآت
        </button>
        <button
          onClick={() => setTab('history')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors',
            tab === 'history' ? 'bg-white text-[var(--vuno-primary)] shadow-sm' : 'text-[var(--vuno-text-muted)]',
          )}
        >
          <CoinsIcon size={14} />
          السجل
        </button>
      </div>

      {/* المحتوى */}
      {tab === 'rewards' ? (
        <div className="space-y-2">
          {rewardOptions.map((reward) => {
            const canRedeem = currentPoints >= reward.pointsCost;
            return (
              <RewardCard
                key={reward.type}
                reward={reward}
                canRedeem={canRedeem}
                onRedeem={() => onRedeem?.(reward)}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {earnedHistory.length === 0 && redeemedHistory.length === 0 ? (
            <div className="text-center py-6 text-[var(--vuno-text-muted)]">
              <CoinsIcon size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">لا يوجد سجل بعد</p>
            </div>
          ) : (
            <>
              {earnedHistory.map((entry, idx) => (
                <HistoryRow
                  key={`e-${entry.id}-${idx}`}
                  icon={<TrendingUpIcon size={13} />}
                  color="text-emerald-600 bg-emerald-50"
                  title={`كسب نقاط من فاتورة ${entry.invoiceId}`}
                  points={`+${entry.points}`}
                  date={entry.date}
                />
              ))}
              {redeemedHistory.map((entry, idx) => (
                <HistoryRow
                  key={`r-${entry.id}-${idx}`}
                  icon={<SparklesIcon size={13} />}
                  color="text-amber-600 bg-amber-50"
                  title={`استبدال: ${entry.reward}`}
                  points={`-${entry.pointsSpent}`}
                  date={entry.date}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** بطاقة مكافأة */
function RewardCard({
  reward,
  canRedeem,
  onRedeem,
}: {
  reward: RewardOption;
  canRedeem: boolean;
  onRedeem: () => void;
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-all',
      canRedeem
        ? 'border-[var(--vuno-border)] hover:border-[var(--vuno-primary)] hover:shadow-sm'
        : 'border-[var(--vuno-border-light)] opacity-60',
    )}>
      <span className="text-2xl flex-shrink-0">{reward.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--vuno-text)]">{reward.label}</p>
        <p className="text-[10px] text-[var(--vuno-text-muted)] truncate">{reward.description}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[11px] font-bold text-[var(--vuno-primary)] tabular-nums">{reward.pointsCost} نقطة</span>
        <button
          onClick={onRedeem}
          disabled={!canRedeem}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors',
            canRedeem
              ? 'bg-[var(--vuno-primary)] text-white hover:bg-[var(--vuno-primary-light)]'
              : 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)] cursor-not-allowed',
          )}
        >
          {canRedeem ? <><CheckIcon size={11} /> استبدال</> : 'نقاط غير كافية'}
        </button>
      </div>
    </div>
  );
}

/** صف سجل */
function HistoryRow({
  icon,
  color,
  title,
  points,
  date,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  points: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--vuno-surface-pearl)]">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[var(--vuno-text)] truncate">{title}</p>
        <p className="text-[9px] text-[var(--vuno-text-muted)]">{date}</p>
      </div>
      <span className={cn(
        'text-[11px] font-bold tabular-nums flex-shrink-0',
        points.startsWith('+') ? 'text-emerald-600' : 'text-amber-600',
      )}>
        {points}
      </span>
    </div>
  );
}

/** إحصائية نقاط صغيرة */
function PointStat({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-[var(--vuno-surface-pearl)]">
      <div className={cn('flex items-center justify-center mb-0.5', color)}>{icon}</div>
      <p className="text-[13px] font-bold text-[var(--vuno-text)] tabular-nums">{value.toLocaleString()}</p>
      <p className="text-[9px] text-[var(--vuno-text-muted)]">{label}</p>
    </div>
  );
}

export { getLoyaltyLevel, getNextLoyaltyLevel };
