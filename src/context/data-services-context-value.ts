import { createContext, useContext } from 'react';
import type { ClientService } from '@/services/client';
import type { LoyaltyService } from '@/services/loyalty';
import type { ExpenseService } from '@/services/expense';
import type { StaffService } from '@/services/staff';
import type { ProfileService } from '@/services/profile';
import type { PurchaseOrderService } from '@/services/purchaseOrder';
import type { BundleService } from '@/services/bundle';
import type { SettingsService } from '@/services/settings';
import type { ReportingService } from '@/services/reporting';
import type { FlashSaleService } from '@/services/flashSale';
import type { ShiftService } from '@/services/shift';
import type { PricingPlanService } from '@/services/pricingPlan';
import type { ProductService } from '@/services/product';
import type { OrderService } from '@/services/order';
import type { ReturnService } from '@/services/return';
import type { InvoiceService } from '@/services/invoice';
import type { BranchService } from '@/services/branch';
import type { CategoryService } from '@/services/category';
import type { SupplierService } from '@/services/supplier';
import type { NotificationService } from '@/services/notification';
import type { ActivityLogService } from '@/services/activityLog';
import type { HeldOrderService } from '@/services/heldOrder';
import type { SalesGoalService } from '@/services/salesGoal';

/**
 * The set of clean services composed at the application edge.
 */
export interface DataServices {
  client: ClientService;
  loyalty: LoyaltyService;
  expense: ExpenseService;
  staff: StaffService;
  profile: ProfileService;
  purchaseOrder: PurchaseOrderService;
  bundle: BundleService;
  settings: SettingsService;
  reporting: ReportingService;
  flashSale: FlashSaleService;
  shift: ShiftService;
  pricingPlan: PricingPlanService;
  product: ProductService;
  order: OrderService;
  return: ReturnService;
  invoice: InvoiceService;
  branch: BranchService;
  category: CategoryService;
  supplier: SupplierService;
  notification: NotificationService;
  activityLog: ActivityLogService;
  heldOrder: HeldOrderService;
  salesGoal: SalesGoalService;
}

/**
 * The context object + its consumer hook live in this non-component module so
 * that the provider file only exports a component (react-refresh/only-export-
 * components). Mirrors the products-context-value split.
 */
export const DataServicesContext = createContext<DataServices | null>(null);

/** Gives any component access to the injected services. */
export function useDataServices(): DataServices {
  const services = useContext(DataServicesContext);
  if (!services) {
    throw new Error('useDataServices must be used within a DataServicesProvider');
  }
  return services;
}
