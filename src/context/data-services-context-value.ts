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
