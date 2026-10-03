import type { SettingsSection } from '@/types';
import {
  StoreIcon, InvoiceSettingsIcon, StaffIcon, PaymentMethodsIcon, BranchesIcon, ReceiptIcon,
  MoonIcon, ArchiveIcon, ClockIcon, WhatsAppIcon,
} from '@/components/icons';

export const settingsSections: SettingsSection[] = [
  { id: 'store', title: 'المتجر', description: 'اسم المتجر، الهاتف، العنوان، الرقم الضريبي', icon: StoreIcon },
  { id: 'invoice', title: 'الفاتورة', description: 'النسبة الضريبية، بادئة الفاتورة، التذييل', icon: InvoiceSettingsIcon },
  { id: 'receipt', title: 'الفاتورة الحرارية', description: 'تخصيص ما يظهر على الإيصال الحراري', icon: ReceiptIcon },
  { id: 'staff', title: 'الموظفين', description: 'إدارة الموظفين والصلاحيات', icon: StaffIcon },
  { id: 'payments', title: 'طرق الدفع', description: 'تفعيل وإيقاف طرق الدفع المختلفة', icon: PaymentMethodsIcon },
  { id: 'branches-inventory', title: 'الفروع والمخزون', description: 'الفروع، النقل بين الفروع، تنبيهات المخزون', icon: BranchesIcon },
  { id: 'shifts', title: 'الورديات', description: 'إدارة ورديات الكاشير والصندوق', icon: ClockIcon },
  { id: 'daily-summary', title: 'الملخص اليومي', description: 'ملخص يومي لمبيعاتك على WhatsApp', icon: WhatsAppIcon },
  { id: 'appearance', title: 'المظهر', description: 'الوضع الليلي/النهاري، تخصيص الألوان', icon: MoonIcon },
  { id: 'data-backup', title: 'النسخ الاحتياطي', description: 'تصدير واستيراد بيانات المتجر', icon: ArchiveIcon },
];
