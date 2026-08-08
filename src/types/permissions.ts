export type Role = 'owner' | 'manager' | 'employee';

export interface RoleMeta {
  id: Role;
  label: string;
  description: string;
  color: string;
}

export type PermissionModule =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'inventory'
  | 'invoices'
  | 'purchase-orders'
  | 'suppliers'
  | 'clients'
  | 'expenses'
  | 'reports'
  | 'branches'
  | 'settings'
  | 'tax-invoice'
  | 'ai-assistant';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export type Permission = {
  module: PermissionModule;
  actions: PermissionAction[];
};

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: Role;
  branchId: string;
  branchName: string;
  status: 'active' | 'inactive';
  lastActive: string;
  permissions: Permission[];
}

export const roleMeta: RoleMeta[] = [
  {
    id: 'owner',
    label: 'المالك',
    description: 'صلاحيات كاملة على جميع الفروع والإعدادات',
    color: '#0066CC',
  },
  {
    id: 'manager',
    label: 'مدير',
    description: 'إدارة الفرع المُعيَّن، التقارير، والموظفين',
    color: '#34C759',
  },
  {
    id: 'employee',
    label: 'موظف',
    description: 'نقطة البيع والفواتير فقط',
    color: '#FF9500',
  },
];

export const permissionModuleLabels: Record<PermissionModule, string> = {
  'dashboard': 'لوحة التحكم',
  'pos': 'نقطة البيع',
  'products': 'المنتجات',
  'inventory': 'المخزون',
  'invoices': 'الفواتير',
  'purchase-orders': 'أوامر الشراء',
  'suppliers': 'الموردون',
  'clients': 'العملاء',
  'expenses': 'المصروفات',
  'reports': 'التقارير',
  'branches': 'الفروع',
  'settings': 'الإعدادات',
  'tax-invoice': 'الفاتورة الضريبية',
  'ai-assistant': 'المساعد الذكي',
};

export const permissionActionLabels: Record<PermissionAction, string> = {
  'view': 'عرض',
  'create': 'إضافة',
  'edit': 'تعديل',
  'delete': 'حذف',
};

// Default permission sets per role
export const defaultPermissions: Record<Role, Permission[]> = {
  owner: [
    { module: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'pos', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'products', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'inventory', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'invoices', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'purchase-orders', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'suppliers', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'clients', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'expenses', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'reports', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'branches', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'settings', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'tax-invoice', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'ai-assistant', actions: ['view', 'create', 'edit', 'delete'] },
  ],
  manager: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pos', actions: ['view', 'create', 'edit'] },
    { module: 'products', actions: ['view', 'edit'] },
    { module: 'inventory', actions: ['view', 'create', 'edit'] },
    { module: 'invoices', actions: ['view', 'create', 'edit'] },
    { module: 'purchase-orders', actions: ['view', 'create'] },
    { module: 'suppliers', actions: ['view'] },
    { module: 'clients', actions: ['view', 'create', 'edit'] },
    { module: 'expenses', actions: ['view', 'create', 'edit'] },
    { module: 'reports', actions: ['view'] },
    { module: 'branches', actions: ['view'] },
  ],
  employee: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pos', actions: ['view', 'create'] },
    { module: 'products', actions: ['view'] },
    { module: 'invoices', actions: ['view', 'create'] },
    { module: 'clients', actions: ['view', 'create'] },
  ],
};
