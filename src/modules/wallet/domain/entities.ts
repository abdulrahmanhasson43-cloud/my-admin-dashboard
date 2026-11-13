/** المبالغ بالجنيه المصري كأعداد صحيحة. */
export type TransactionType = 'topup' | 'purchase' | 'refund' | 'grant';

export interface Transaction {
  id: string;
  type: TransactionType;
  /** قيمة موجبة دائماً؛ الاتجاه يحدده النوع. */
  amount: number;
  description: string;
  at: string; // ISO
}

/** اشتراك في كورس لترم محدّد (أو كل الترمات لو الترمات غير مفعّلة). */
export interface Enrollment {
  id: string;
  courseId: string;
  termId: string;
  startsAt: string;
  endsAt: string;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
  enrollments: Enrollment[];
}

export const ALL_TERMS = 'all';
export const EMPTY_WALLET: WalletState = { balance: 0, transactions: [], enrollments: [] };
export const MIN_TOPUP = 10;
export const MAX_TOPUP = 5000;
