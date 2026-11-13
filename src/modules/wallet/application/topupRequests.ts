import type { Result } from '../../../core/result';
import { REFERENCE_MAX, type TopupRequest } from '../domain/topup';

const uid = () => `tp-${Math.random().toString(36).slice(2, 9)}`;

export interface NewTopup { studentEmail: string; studentName: string; methodId: string; methodName: string; amount: number; fee: number; reference: string; min: number; max: number }

export const createTopupRequest = (list: TopupRequest[], n: NewTopup, now: Date): Result<TopupRequest[]> => {
  if (!Number.isInteger(n.amount) || n.amount < n.min) return { ok: false, error: `أقل مبلغ للشحن بهذه الطريقة ${n.min.toLocaleString('ar-EG')} ج.م.` };
  if (n.amount > n.max) return { ok: false, error: `أقصى مبلغ للشحن بهذه الطريقة ${n.max.toLocaleString('ar-EG')} ج.م.` };
  const reference = n.reference.trim();
  if (!reference) return { ok: false, error: 'اكتب رقم العملية أو آخر ٤ أرقام من رقم المحوِّل.' };
  if (reference.length > REFERENCE_MAX) return { ok: false, error: `الحد الأقصى ${REFERENCE_MAX} حرفاً.` };
  if (list.filter((r) => r.studentEmail === n.studentEmail && r.status === 'pending').length >= 3) return { ok: false, error: 'لديك ٣ طلبات قيد المراجعة. انتظر الرد عليها أولاً.' };
  const req: TopupRequest = { id: uid(), studentEmail: n.studentEmail, studentName: n.studentName, methodId: n.methodId, methodName: n.methodName, amount: n.amount, fee: n.fee, reference, createdAt: now.toISOString(), status: 'pending' };
  return { ok: true, value: [req, ...list] };
};

export const resolveTopupRequest = (list: TopupRequest[], id: string, status: 'approved' | 'rejected', note: string, now: Date): Result<{ list: TopupRequest[]; request: TopupRequest }> => {
  const r = list.find((x) => x.id === id);
  if (!r) return { ok: false, error: 'الطلب غير موجود.' };
  if (r.status !== 'pending') return { ok: false, error: 'تم الرد على هذا الطلب من قبل.' };
  const request: TopupRequest = { ...r, status, note: note.trim() || undefined, resolvedAt: now.toISOString() };
  return { ok: true, value: { list: list.map((x) => (x.id === id ? request : x)), request } };
};
