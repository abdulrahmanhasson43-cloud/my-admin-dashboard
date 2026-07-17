import type { NavItem } from '@/types';
import {
  HomeIcon, POSIcon, ProductsIcon, InvoiceIcon, CategoriesIcon,
  PricingIcon, ClientsIcon, InventoryIcon, SuppliersIcon,
  PurchaseOrdersIcon, BranchesIcon, SettingsIcon, MenuIcon,
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
  { label: 'الأسعار', path: '/pricing', icon: PricingIcon },
  { label: 'الموردين', path: '/suppliers', icon: SuppliersIcon },
  { label: 'أوامر الشراء', path: '/purchase-orders', icon: PurchaseOrdersIcon },
  { label: 'الفروع', path: '/branches', icon: BranchesIcon },
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
  '/pricing': 'الأسعار',
  '/suppliers': 'الموردين',
  '/purchase-orders': 'أوامر الشراء',
  '/branches': 'الفروع',
  '/settings': 'الإعدادات',
};
