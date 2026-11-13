/** طلب شحن يدوي: الطالب يحوّل المبلغ بطريقة دفع من اختيار المالك ويرسل الطلب، والمالك يوافق أو يرفض. */
export type TopupStatus = 'pending' | 'approved' | 'rejected';
export interface TopupRequest {
  id: string;
  studentEmail: string;
  studentName: string;
  methodId: string;
  methodName: string;
  /** المبلغ الذي يُضاف للرصيد. */
  amount: number;
  /** الرسوم الإضافية التي يدفعها الطالب فوق المبلغ. */
  fee: number;
  /** رقم العملية أو آخر أرقام المحوِّل كما كتبها الطالب. */
  reference: string;
  createdAt: string;
  status: TopupStatus;
  note?: string;
  resolvedAt?: string;
}
export const REFERENCE_MAX = 80;
