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

/**
 * Canonical expense-category metadata (label + colour).
 *
 * This is DOMAIN knowledge (how the business names and colours its expense
 * categories), not mock data — so it belongs to the domain layer, not to
 * services/mock. Both the mock adapter and the UI import it from here.
 */
export const expenseCategories: ExpenseCategoryMeta[] = [
  { id: 'rent', label: 'إيجار', color: '#8E8E93' },
  { id: 'utilities', label: 'كهرباء ومياه', color: '#FF9500' },
  { id: 'salaries', label: 'مرتبات', color: '#0066CC' },
  { id: 'supplies', label: 'مستلزمات', color: '#34C759' },
  { id: 'maintenance', label: 'صيانة', color: '#FF3B30' },
  { id: 'marketing', label: 'تسويق', color: '#AF52DE' },
  { id: 'transport', label: 'نقل ومواصلات', color: '#5AC8FA' },
  { id: 'other', label: 'أخرى', color: '#6366F1' },
];

/** Resolve a category id to its metadata (falls back to the last entry). */
export const getCategoryMeta = (id: string): ExpenseCategoryMeta => {
  return expenseCategories.find(c => c.id === id) ?? expenseCategories[expenseCategories.length - 1];
};
