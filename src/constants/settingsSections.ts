import type { SettingsSection } from '@/types';
import {
  StoreIcon, InvoiceSettingsIcon, StaffIcon, PaymentMethodsIcon, BranchesIcon, ReceiptIcon,
} from '@/components/icons';

export const settingsSections: SettingsSection[] = [
  { id: 'store', title: 'المتجر', description: 'اسم المتجر، الهاتف، العنوان، الرقم الضريبي', icon: StoreIcon },
  { id: 'invoice', title: 'الفاتورة', description: 'النسبة الضريبية، بادئة الفاتورة، التذييل', icon: InvoiceSettingsIcon },
  { id: 'receipt', title: 'الفاتورة الحرارية', description: 'تخصيص ما يظهر على الإيصال الحراري', icon: ReceiptIcon },
  { id: 'staff', title: 'الموظفين', description: 'إدارة الموظفين والصلاحيات', icon: StaffIcon },
  { id: 'payments', title: 'طرق الدفع', description: 'تفعيل وإيقاف طرق الدفع المختلفة', icon: PaymentMethodsIcon },
  { id: 'branches-inventory', title: 'الفروع والمخزون', description: 'الفروع، النقل بين الفروع، تنبيهات المخزون', icon: BranchesIcon },
];
