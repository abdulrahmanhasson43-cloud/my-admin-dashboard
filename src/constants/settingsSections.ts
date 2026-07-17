import type { SettingsSection } from '@/types';
import {
  StoreIcon, InvoiceSettingsIcon, StaffIcon, PaymentMethodsIcon, BranchesIcon,
} from '@/components/icons';

export const settingsSections: SettingsSection[] = [
  { id: 'store', title: 'المتجر', description: 'إعدادات المتجر والفرع الرئيسي', icon: StoreIcon },
  { id: 'invoice', title: 'الفاتورة', description: 'إعدادات الفواتير والطباعة', icon: InvoiceSettingsIcon },
  { id: 'staff', title: 'الموظفين', description: 'إدارة الموظفين والصلاحيات', icon: StaffIcon },
  { id: 'payments', title: 'طرق الدفع', description: 'إعدادات طرق الدفع المختلفة', icon: PaymentMethodsIcon },
  { id: 'branches-inventory', title: 'الفروع والمخزون', description: 'الفروع ونقل المخزون', icon: BranchesIcon },
];
