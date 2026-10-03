import type { NavItem } from '@/types';
import {
  HomeIcon, POSIcon, ProductsIcon, InvoiceIcon, CategoriesIcon,
  ClientsIcon, InventoryIcon, SuppliersIcon,
  PurchaseOrdersIcon, BranchesIcon, SettingsIcon, MenuIcon,
  TrendingUpIcon, ReceiptIcon, ExpenseIcon, TaxInvoiceIcon,
  ClockIcon, ActivityIcon, OrdersIcon, ReturnsIcon, ProfileIcon, CoinsIcon,
  PackageIcon,
} from '@/components/icons';

export const mainNavItems: NavItem[] = [
  { label: 'الرئيسية', path: '/dashboard', icon: HomeIcon },
  { label: 'نقطة البيع', path: '/pos', icon: POSIcon },
  { label: 'المنتجات', path: '/products', icon: ProductsIcon },
  { label: 'الفواتير', path: '/invoices', icon: InvoiceIcon },
  { label: 'المخزون', path: '/inventory', icon: InventoryIcon },
];

export const moreSections: NavItem[] = [
  { label: 'العملاء', path: '/clients', icon: ClientsIcon },
  { label: 'الطلبات', path: '/orders', icon: OrdersIcon },
  { label: 'أوامر الشراء', path: '/purchase-orders', icon: PurchaseOrdersIcon },
  { label: 'الباقات والعروض', path: '/bundles', icon: PackageIcon },
  { label: 'المرتجعات', path: '/returns', icon: ReturnsIcon },
  { label: 'الفئات', path: '/categories', icon: CategoriesIcon },
  { label: 'الموردين', path: '/suppliers', icon: SuppliersIcon },
  { label: 'المصاريف', path: '/expenses', icon: ExpenseIcon },
  { label: 'الفاتورة الضريبية', path: '/tax-invoice', icon: TaxInvoiceIcon },
  { label: 'الفروع', path: '/branches', icon: BranchesIcon },
  { label: 'إدارة الورديات', path: '/shifts', icon: ClockIcon },
  { label: 'سجل النشاطات', path: '/activity', icon: ActivityIcon },
  { label: 'التحليلات المتقدمة', path: '/analytics', icon: TrendingUpIcon },
  { label: 'التقارير', path: '/reports', icon: TrendingUpIcon },
  { label: 'تقرير إقفال اليوم', path: '/daily-closing-report', icon: CoinsIcon },
  { label: 'الاختصارات', path: '/shortcuts', icon: ReceiptIcon },
  { label: 'الملف الشخصي', path: '/profile', icon: ProfileIcon },
  { label: 'الإعدادات', path: '/settings', icon: SettingsIcon },
];

export const bottomNavItems: NavItem[] = [
  { label: 'الرئيسية', path: '/dashboard', icon: HomeIcon },
  { label: 'نقطة البيع', path: '/pos', icon: POSIcon },
  { label: 'المنتجات', path: '/products', icon: ProductsIcon },
  { label: 'المزيد', path: '/more', icon: MenuIcon },
];

export const pageTitles: Record<string, string> = {
  '/dashboard': 'الرئيسية',
  '/pos': 'نقطة البيع',
  '/products': 'المنتجات',
  '/invoices': 'الفواتير',
  '/inventory': 'المخزون',
  '/orders': 'الطلبات',
  '/returns': 'المرتجعات',
  '/profile': 'الملف الشخصي',
  '/clients': 'العملاء',
  '/categories': 'الفئات',
  '/suppliers': 'الموردين',
  '/purchase-orders': 'أوامر الشراء',
  '/branches': 'الفروع',
  '/shifts': 'إدارة الورديات',
  '/activity': 'سجل النشاطات',
  '/reports': 'التقارير',
  '/daily-closing-report': 'تقرير إقفال اليوم',
  '/shortcuts': 'الاختصارات',
  '/expenses': 'المصاريف',
  '/tax-invoice': 'الفاتورة الضريبية',
  '/ai-assistant': 'المساعد الذكي',
  '/settings': 'الإعدادات',
  '/analytics': 'التحليلات المتقدمة',
  '/bundles': 'الباقات والعروض',
};
