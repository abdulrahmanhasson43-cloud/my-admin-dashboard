export type RequestStatus = 'pending' | 'approved' | 'rejected';

/** طلب من طالب لتعديل سنته الدراسية أو ترمه. الطالب لا يعدّلهما بنفسه؛ فريق الدعم وحده ينفّذ. */
export interface SupportRequest {
  id: string;
  studentEmail: string;
  studentName: string;
  currentGradeId?: string;
  currentTermId?: string;
  requestedGradeId?: string;
  requestedTermId?: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  note?: string;
}

export const REASON_MIN = 5;
export const REASON_MAX = 500;
