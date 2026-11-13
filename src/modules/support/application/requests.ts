import type { Result } from '../../../core/result';
import { REASON_MAX, REASON_MIN, type SupportRequest } from '../domain/entities';

const uid = () => `rq-${Math.random().toString(36).slice(2, 9)}`;

export interface NewRequest {
  student: { email: string; name: string; gradeId?: string; termId?: string };
  requestedGradeId?: string;
  requestedTermId?: string;
  reason: string;
}

export const createRequest = (list: SupportRequest[], input: NewRequest, now: Date): Result<SupportRequest[]> => {
  const reason = input.reason.trim();
  const { student } = input;
  if (reason.length < REASON_MIN) return { ok: false, error: 'اكتب سبب الطلب (٥ أحرف على الأقل).' };
  if (reason.length > REASON_MAX) return { ok: false, error: `السبب طويل (${REASON_MAX} حرفاً كحد أقصى).` };
  const gradeChanged = !!input.requestedGradeId && input.requestedGradeId !== student.gradeId;
  const termChanged = !!input.requestedTermId && input.requestedTermId !== student.termId;
  if (!gradeChanged && !termChanged) return { ok: false, error: 'اختر سنة أو ترماً مختلفاً عن الحالي.' };
  if (list.some((r) => r.studentEmail === student.email && r.status === 'pending')) return { ok: false, error: 'لديك طلب قيد المراجعة بالفعل. انتظر ردّ الدعم.' };
  const req: SupportRequest = {
    id: uid(), studentEmail: student.email, studentName: student.name,
    currentGradeId: student.gradeId, currentTermId: student.termId,
    requestedGradeId: gradeChanged ? input.requestedGradeId : undefined,
    requestedTermId: termChanged ? input.requestedTermId : undefined,
    reason, status: 'pending', createdAt: now.toISOString(),
  };
  return { ok: true, value: [req, ...list] };
};

export const resolveRequest = (list: SupportRequest[], id: string, decision: 'approved' | 'rejected', by: string, note: string, now: Date): Result<{ list: SupportRequest[]; request: SupportRequest }> => {
  const r = list.find((x) => x.id === id);
  if (!r) return { ok: false, error: 'الطلب غير موجود.' };
  if (r.status !== 'pending') return { ok: false, error: 'تمت معالجة هذا الطلب من قبل.' };
  const next: SupportRequest = { ...r, status: decision, resolvedBy: by, resolvedAt: now.toISOString(), note: note.trim() || undefined };
  return { ok: true, value: { list: list.map((x) => (x.id === id ? next : x)), request: next } };
};
