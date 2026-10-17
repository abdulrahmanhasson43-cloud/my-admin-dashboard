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
import { ProductService, MockProductRepository } from '@/services/product';
import { OrderService, MockOrderRepository } from '@/services/order';
import { ReturnService, MockReturnRepository } from '@/services/return';
import { InvoiceService, MockInvoiceRepository } from '@/services/invoice';
import { BranchService, MockBranchRepository } from '@/services/branch';
import { CategoryService, MockCategoryRepository } from '@/services/category';
import { SupplierService, MockSupplierRepository } from '@/services/supplier';
import { NotificationService, LocalStorageNotificationRepository } from '@/services/notification';
import { ActivityLogService, LocalStorageActivityLogRepository } from '@/services/activityLog';
import { HeldOrderService, LocalStorageHeldOrderRepository } from '@/services/heldOrder';
import { SalesGoalService, LocalStorageSalesGoalRepository } from '@/services/salesGoal';
import { AuthService, LocalStorageAuthSessionRepository } from '@/services/auth';
import { DataServicesContext, type DataServices } from './data-services-context-value';

/**
 * DataServicesProvider — THE composition root: the one place where concrete
 * repositories (Mock*Repository, LocalStorage*Repository) are created and
 * handed to their services. An architecture test enforces that no other file
 * imports a concrete repository.
 *
 * Every page/component reaches the services through the dedicated hooks
 * (useClients, useOrders, useNotifications, …) and never touches a repository.
 *
 * TODO(phase-3): once a real backend exists, swap each `new Mock*Repository()`
 * / `new LocalStorage*Repository()` for its backend counterpart here — one
 * line each, and nowhere else in the app changes. (The five LocalStorage-backed
 * ports are synchronous; a remote adapter needs an async port plus a loading
 * state in its provider.)
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
      product: new ProductService(new MockProductRepository()),
      order: new OrderService(new MockOrderRepository()),
      return: new ReturnService(new MockReturnRepository()),
      invoice: new InvoiceService(new MockInvoiceRepository()),
      branch: new BranchService(new MockBranchRepository()),
      category: new CategoryService(new MockCategoryRepository()),
      supplier: new SupplierService(new MockSupplierRepository()),
      notification: new NotificationService(new LocalStorageNotificationRepository()),
      activityLog: new ActivityLogService(new LocalStorageActivityLogRepository()),
      heldOrder: new HeldOrderService(new LocalStorageHeldOrderRepository()),
      salesGoal: new SalesGoalService(new LocalStorageSalesGoalRepository()),
      auth: new AuthService(new LocalStorageAuthSessionRepository()),
    }),
    [],
  );

  return (
    <DataServicesContext.Provider value={services}>
      {children}
    </DataServicesContext.Provider>
  );
}
