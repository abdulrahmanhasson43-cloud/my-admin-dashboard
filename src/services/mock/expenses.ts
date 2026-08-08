import type { Expense, ExpenseCategoryMeta } from '@/types/expense';

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

export const getCategoryMeta = (id: string): ExpenseCategoryMeta => {
  return expenseCategories.find(c => c.id === id) ?? expenseCategories[expenseCategories.length - 1];
};

// Generate dates relative to today so the "today" stats always have data
const today = new Date();
const todayStr = today.toISOString().slice(0, 10);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().slice(0, 10);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

export const sampleExpenses: Expense[] = [
  { id: 'exp-001', description: 'إيجار المحل - الشهر الحالي', amount: 8000, category: 'rent', date: todayStr, paymentMethod: 'cash', createdBy: 'أحمد محمد' },
  { id: 'exp-002', description: 'فاتورة الكهرباء', amount: 1250, category: 'utilities', date: todayStr, paymentMethod: 'instapay', notes: 'شهر يوليو', createdBy: 'أحمد محمد' },
  { id: 'exp-003', description: 'مرتب البائع', amount: 3500, category: 'salaries', date: todayStr, paymentMethod: 'wallet', createdBy: 'أحمد محمد' },
  { id: 'exp-004', description: 'شراء أكياس وتغليف', amount: 320, category: 'supplies', date: yesterdayStr, paymentMethod: 'cash', createdBy: 'أحمد محمد' },
  { id: 'exp-005', description: 'صيانة جهاز الكاشير', amount: 450, category: 'maintenance', date: yesterdayStr, paymentMethod: 'cash', notes: 'إصلاح الطابعة الحرارية', createdBy: 'أحمد محمد' },
  { id: 'exp-006', description: 'إعلان على فيسبوك', amount: 600, category: 'marketing', date: yesterdayStr, paymentMethod: 'card', createdBy: 'أحمد محمد' },
  { id: 'exp-007', description: 'فاتورة الإنترنت', amount: 400, category: 'utilities', date: twoDaysAgoStr, paymentMethod: 'instapay', createdBy: 'أحمد محمد' },
  { id: 'exp-008', description: 'نقل بضاعة من المخزن', amount: 250, category: 'transport', date: twoDaysAgoStr, paymentMethod: 'cash', createdBy: 'أحمد محمد' },
  { id: 'exp-009', description: 'مرتب العامل', amount: 2800, category: 'salaries', date: twoDaysAgoStr, paymentMethod: 'wallet', createdBy: 'أحمد محمد' },
  { id: 'exp-010', description: 'مستلزمات تنظيف', amount: 150, category: 'supplies', date: threeDaysAgoStr, paymentMethod: 'cash', createdBy: 'أحمد محمد' },
  { id: 'exp-011', description: 'إيجار المخزن', amount: 3000, category: 'rent', date: threeDaysAgoStr, paymentMethod: 'cash', createdBy: 'أحمد محمد' },
  { id: 'exp-012', description: 'رسوم بنكية', amount: 85, category: 'other', date: threeDaysAgoStr, paymentMethod: 'card', notes: 'عمولة بطاقات', createdBy: 'أحمد محمد' },
];
