export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod: 'cash' | 'card' | 'wallet' | 'instapay' | 'bimoob';
  notes?: string;
  createdBy: string;
}

export type ExpenseCategory =
  | 'rent'        // إيجار
  | 'utilities'   // كهرباء/مياه/نت
  | 'salaries'    // مرتبات
  | 'supplies'    // مستلزمات
  | 'maintenance' // صيانة
  | 'marketing'   // تسويق
  | 'transport'   // نقل ومواصلات
  | 'other';      // أخرى

export interface ExpenseCategoryMeta {
  id: ExpenseCategory;
  label: string;
  color: string;
}
