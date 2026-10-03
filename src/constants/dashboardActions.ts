import type { ComponentType } from 'react';
import {
  QuickSellIcon, AddProductIcon, InvoiceIcon, ClientsIcon,
  InventoryIcon, SuppliersIcon, BranchesIcon, SettingsIcon, CrmIcon,
  AIAssistantIcon,
} from '@/components/icons';

export interface DashboardAction {
  label: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  path: string;
  comingSoon?: boolean;
}

export const heroActions: DashboardAction[] = [
  { label: 'العملاء', icon: ClientsIcon, path: '/clients' },
  { label: 'المساعد الذكي', icon: AIAssistantIcon, path: '/ai-assistant' },
  { label: 'إضافة منتج', icon: AddProductIcon, path: '/products' },
  { label: 'الفواتير', icon: InvoiceIcon, path: '/invoices' },
];

export const quickActionsRow1: DashboardAction[] = [
  { label: 'بيع سريع', icon: QuickSellIcon, path: '/pos' },
  { label: 'إضافة منتج', icon: AddProductIcon, path: '/products' },
  { label: 'الفواتير', icon: InvoiceIcon, path: '/invoices' },
  { label: 'العملاء', icon: ClientsIcon, path: '/clients' },
];

export const quickActionsRow2: DashboardAction[] = [
  { label: 'المخزون', icon: InventoryIcon, path: '/inventory' },
  { label: 'الموردين', icon: SuppliersIcon, path: '/suppliers' },
  { label: 'الفروع', icon: BranchesIcon, path: '/branches' },
  { label: 'الإعدادات', icon: SettingsIcon, path: '/settings' },
  { label: 'CRM', icon: CrmIcon, path: '/crm', comingSoon: true },
];
