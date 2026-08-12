import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { ProductsProvider } from '@/context/ProductsContext';
import { AppSettingsProvider } from '@/context/AppSettingsContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ActivityLogProvider } from '@/context/ActivityLogContext';
import { SalesGoalProvider } from '@/context/SalesGoalContext';
import { ShiftProvider } from '@/context/ShiftContext';
import { HeldOrdersProvider } from '@/context/HeldOrdersContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { BranchProvider } from '@/context/BranchContext';
import CommandPalette from '@/components/CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useDeviceType } from '@/hooks/useDeviceType';
import OnboardingWizard from '@/components/OnboardingWizard';

// Each page now loads on-demand instead of all being bundled into one
// huge file that has to be downloaded and parsed before the app can
// respond to touch/scroll input. This is the fix for the "app freezes,
// scroll doesn't respond to swipes" issue.
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const POSPage = lazy(() => import('@/pages/POSPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const InvoicePage = lazy(() => import('@/pages/InvoicePage'));
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const SuppliersPage = lazy(() => import('@/pages/SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('@/pages/PurchaseOrdersPage'));
const BranchesPage = lazy(() => import('@/pages/BranchesPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const ShortcutsPage = lazy(() => import('@/pages/ShortcutsPage'));
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'));
const TaxInvoiceSettingsPage = lazy(() => import('@/pages/TaxInvoiceSettingsPage'));
const AIAssistantPage = lazy(() => import('@/pages/AIAssistantPage'));
const ShiftsPage = lazy(() => import('@/pages/ShiftsPage'));
const ActivityPage = lazy(() => import('@/pages/ActivityPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const ReturnsPage = lazy(() => import('@/pages/ReturnsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const DailyClosingReportPage = lazy(() => import('@/pages/DailyClosingReportPage'));
const PublicInvoicePage = lazy(() => import('@/pages/PublicInvoicePage'));
// الجزء 4 — الأفكار #31-40: صفحات التحليلات والباقات
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const BundlesPage = lazy(() => import('@/pages/BundlesPage'));

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[var(--vuno-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Activates the hidden desktop keyboard shortcuts only when the user is on
 * a non-touch device. On mobile/tablet we rely on touch gestures instead.
 */
function KeyboardShortcutActivator() {
  const deviceType = useDeviceType();
  useKeyboardShortcuts(deviceType === 'desktop');
  return null;
}

/**
 * Renders the global Command Palette overlay. Reads the open-state from the
 * useCommandPalette hook which listens for Ctrl+K / Cmd+K globally.
 */
function CommandPaletteOverlay() {
  const { open, setOpen } = useCommandPalette();
  return <CommandPalette open={open} onOpenChange={setOpen} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <BranchProvider>
        <AppSettingsProvider>
          <NotificationsProvider>
            <ActivityLogProvider>
              <ProductsProvider>
                <SalesGoalProvider>
                  <ShiftProvider>
                    <HeldOrdersProvider>
                      <KeyboardShortcutActivator />
                      <CommandPaletteOverlay />
                      <OnboardingWizard />
                      <Suspense fallback={<PageLoadingFallback />}>
                        <Routes>
                          {/* Public invoice page — الفكرة #29: لا يتطلب
                              تسجيل دخول، يُعرض خارج تخطيط التطبيق. */}
                          <Route path="/public/invoice/:invoiceId" element={<PublicInvoicePage />} />
                          <Route element={<AppLayout />}>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/pos" element={<POSPage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/inventory" element={<InventoryPage />} />
                            <Route path="/invoices" element={<InvoicePage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/returns" element={<ReturnsPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/clients" element={<ClientsPage />} />
                            <Route path="/categories" element={<CategoriesPage />} />
                            <Route path="/suppliers" element={<SuppliersPage />} />
                            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                            <Route path="/branches" element={<BranchesPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/shortcuts" element={<ShortcutsPage />} />
                            <Route path="/expenses" element={<ExpensesPage />} />
                            <Route path="/tax-invoice" element={<TaxInvoiceSettingsPage />} />
                            <Route path="/ai-assistant" element={<AIAssistantPage />} />
                            <Route path="/shifts" element={<ShiftsPage />} />
                            <Route path="/activity" element={<ActivityPage />} />
                            <Route path="/daily-closing-report" element={<DailyClosingReportPage />} />
                            {/* الجزء 4 — الأفكار #31-40 */}
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="/bundles" element={<BundlesPage />} />
                            <Route path="/more" element={<DashboardPage />} />
                          </Route>
                        </Routes>
                      </Suspense>
                    </HeldOrdersProvider>
                  </ShiftProvider>
                </SalesGoalProvider>
              </ProductsProvider>
            </ActivityLogProvider>
          </NotificationsProvider>
        </AppSettingsProvider>
      </BranchProvider>
    </ThemeProvider>
  );
}
