import type { NavItem } from '@/types';
import {
  HomeIcon, POSIcon, ProductsIcon, InvoiceIcon, CategoriesIcon,
  ClientsIcon, InventoryIcon, SuppliersIcon,
  PurchaseOrdersIcon, BranchesIcon, SettingsIcon, MenuIcon,
  TrendingUpIcon, ReceiptIcon, ExpenseIcon, TaxInvoiceIcon,
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
  { label: 'الفئات', path: '/categories', icon: CategoriesIcon },
  { label: 'الموردين', path: '/suppliers', icon: SuppliersIcon },
  { label: 'أوامر الشراء', path: '/purchase-orders', icon: PurchaseOrdersIcon },
  { label: 'المصاريف', path: '/expenses', icon: ExpenseIcon },
  { label: 'الفاتورة الضريبية', path: '/tax-invoice', icon: TaxInvoiceIcon },
  { label: 'الفروع', path: '/branches', icon: BranchesIcon },
  { label: 'التقارير', path: '/reports', icon: TrendingUpIcon },
  { label: 'الاختصارات', path: '/shortcuts', icon: ReceiptIcon },
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
  '/clients': 'العملاء',
  '/categories': 'الفئات',
  '/suppliers': 'الموردين',
  '/purchase-orders': 'أوامر الشراء',
  '/branches': 'الفروع',
  '/reports': 'التقارير',
  '/shortcuts': 'الاختصارات',
  '/expenses': 'المصاريف',
  '/tax-invoice': 'الفاتورة الضريبية',
  '/ai-assistant': 'المساعد الذكي',
  '/settings': 'الإعدادات',
};
