import type { Course } from '../../../core/entities';
import type { Result } from '../../../core/result';
import { ALL_TERMS, MAX_TOPUP, MIN_TOPUP, type WalletState } from '../domain/entities';
import { hasEntitlement } from '../domain/rules';

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const egp = (n: number) => `${n.toLocaleString('ar-EG')} ج.م`;

/** شحن المحفظة بمبلغ. (الدفع الفعلي يتم خارجياً عبر بوابة الدفع قبل استدعاء هذه الدالة.) */
export interface TopUpOptions { min?: number; max?: number; description?: string }
export const topUp = (s: WalletState, amount: number, now: Date, opts: TopUpOptions = {}): Result<WalletState> => {
  const min = opts.min ?? MIN_TOPUP, max = opts.max ?? MAX_TOPUP;
  if (!Number.isInteger(amount) || amount < min) return { ok: false, error: `أقل مبلغ للشحن ${egp(min)}.` };
  if (amount > max) return { ok: false, error: `أقصى مبلغ للشحن في العملية الواحدة ${egp(max)}.` };
  return {
    ok: true,
    value: {
      ...s,
      balance: s.balance + amount,
      transactions: [{ id: uid('tx'), type: 'topup', amount, description: opts.description ?? 'شحن المحفظة', at: now.toISOString() }, ...s.transactions],
    },
  };
};

/** شراء اشتراك في كورس لترم محدّد: يخصم من الرصيد ويفتح الوصول للمدة المحسوبة. */
export const purchase = (s: WalletState, course: Course, termId: string, termName: string, price: number, days: number, now: Date): Result<WalletState> => {
  if (hasEntitlement(s.enrollments, course.id, termId === ALL_TERMS ? undefined : termId, now))
    return { ok: false, error: 'لديك اشتراك فعّال بالفعل في هذا الكورس.' };
  if (price > s.balance) return { ok: false, error: `رصيدك ${egp(s.balance)} ولا يكفي. ينقصك ${egp(price - s.balance)}.` };
  const ends = new Date(now.getTime() + days * 86_400_000);
  return {
    ok: true,
    value: {
      balance: s.balance - price,
      transactions: [{ id: uid('tx'), type: 'purchase', amount: price, description: `${course.title}${termName ? ` — ${termName}` : ''}`, at: now.toISOString() }, ...s.transactions],
      enrollments: [{ id: uid('en'), courseId: course.id, termId, startsAt: now.toISOString(), endsAt: ends.toISOString() }, ...s.enrollments],
    },
  };
};

/** منح اشتراك بدون خصم من الرصيد (مثلاً عند تفعيل كود من المدرّس). يُسجَّل في السجل بقيمة صفر. */
export const grant = (s: WalletState, course: Course, termId: string, days: number, description: string, now: Date): Result<WalletState> => {
  const ends = new Date(now.getTime() + days * 86_400_000);
  return {
    ok: true,
    value: {
      ...s,
      transactions: [{ id: uid('tx'), type: 'grant', amount: 0, description, at: now.toISOString() }, ...s.transactions],
      enrollments: [{ id: uid('en'), courseId: course.id, termId, startsAt: now.toISOString(), endsAt: ends.toISOString() }, ...s.enrollments],
    },
  };
};
