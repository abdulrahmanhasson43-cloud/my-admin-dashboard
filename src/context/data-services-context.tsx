import { useMemo, type ReactNode } from 'react';
import { ClientService, MockClientRepository } from '@/services/client';
import { LoyaltyService, MockLoyaltyRepository } from '@/services/loyalty';
import { ExpenseService, MockExpenseRepository } from '@/services/expense';
import { StaffService, MockStaffRepository } from '@/services/staff';
import { ProfileService, MockProfileRepository } from '@/services/profile';
import { PurchaseOrderService, MockPurchaseOrderRepository } from '@/services/purchaseOrder';
import { BundleService, MockBundleRepository } from '@/services/bundle';
import { SettingsService, MockSettingsRepository } from '@/services/settings';
import { ReportingService, MockReportingRepository } from '@/services/reporting';
import { FlashSaleService, MockFlashSaleRepository } from '@/services/flashSale';
import { ShiftService, MockShiftRepository } from '@/services/shift';
import { PricingPlanService, MockPricingPlanRepository } from '@/services/pricingPlan';
import { DataServicesContext, type DataServices } from './data-services-context-value';

/**
 * DataServicesProvider — the composition root for the remaining domain modules.
 *
 * This is the ONLY file in the app allowed to import the Mock*Repository
 * classes below. Every page/component reaches the services through the
 * dedicated hooks (useClients, useExpenses, …) and never touches
 * services/mock directly.
 *
 * TODO(phase-3): once a real backend exists, swap each `new Mock*Repository()`
 * for its Firestore counterpart here — one line each, and nowhere else in the
 * app changes.
 */
export function DataServicesProvider({ children }: { children: ReactNode }) {
  const services = useMemo<DataServices>(
    () => ({
      client: new ClientService(new MockClientRepository()),
      loyalty: new LoyaltyService(new MockLoyaltyRepository()),
      expense: new ExpenseService(new MockExpenseRepository()),
      staff: new StaffService(new MockStaffRepository()),
      profile: new ProfileService(new MockProfileRepository()),
      purchaseOrder: new PurchaseOrderService(new MockPurchaseOrderRepository()),
      bundle: new BundleService(new MockBundleRepository()),
      settings: new SettingsService(new MockSettingsRepository()),
      reporting: new ReportingService(new MockReportingRepository()),
      flashSale: new FlashSaleService(new MockFlashSaleRepository()),
      shift: new ShiftService(new MockShiftRepository()),
      pricingPlan: new PricingPlanService(new MockPricingPlanRepository()),
    }),
    [],
  );

  return (
    <DataServicesContext.Provider value={services}>
      {children}
    </DataServicesContext.Provider>
  );
}
