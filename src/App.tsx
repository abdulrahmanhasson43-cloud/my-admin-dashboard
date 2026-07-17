import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { ProductsProvider } from '@/context/ProductsContext';
import { AppSettingsProvider } from '@/context/AppSettingsContext';

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
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const SuppliersPage = lazy(() => import('@/pages/SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('@/pages/PurchaseOrdersPage'));
const BranchesPage = lazy(() => import('@/pages/BranchesPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const DiagnosticPage = lazy(() => import('@/pages/DiagnosticPage'));

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[var(--vuno-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AppSettingsProvider>
      <ProductsProvider>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/invoices" element={<InvoicePage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/test-scroll" element={<DiagnosticPage />} />
              <Route path="/more" element={<DashboardPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ProductsProvider>
    </AppSettingsProvider>
  );
}
