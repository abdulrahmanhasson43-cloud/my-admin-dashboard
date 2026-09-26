# فهرس الصفحات (Pages)

يحتوي التطبيق على **24 صفحة** في `src/pages/`، جميعها lazy-loaded. كل صفحة لها ملف توثيق منفصل في `docs/pages/`.

---

## جدول الصفحات

| الصفحة | المسار | الملف | التوثيق | الغرض المختصر |
|--------|--------|------|---------|--------------|
| صفحة الهبوط | `/` | `LandingPage.tsx` | [LandingPage.md](pages/LandingPage.md) | ترحيب + خطط الأسعار |
| تسجيل الدخول | `/login` | `LoginPage.tsx` | [LoginPage.md](pages/LoginPage.md) | تسجيل دخول |
| لوحة المعلومات | `/dashboard` | `DashboardPage.tsx` | [DashboardPage.md](pages/DashboardPage.md) | إحصائيات + رسوم + أهداف |
| نقطة البيع | `/pos` | `POSPage.tsx` | [POSPage.md](pages/POSPage.md) | بيع + سلة + دفع |
| المنتجات | `/products` | `ProductsPage.tsx` | [ProductsPage.md](pages/ProductsPage.md) | إدارة المنتجات |
| المخزون | `/inventory` | `InventoryPage.tsx` | [InventoryPage.md](pages/InventoryPage.md) | مخزون + نقل (DnD) |
| الفواتير | `/invoices` | `InvoicePage.tsx` | [InvoicePage.md](pages/InvoicePage.md) | بناء فاتورة + قائمة |
| الطلبات | `/orders` | `OrdersPage.tsx` | [OrdersPage.md](pages/OrdersPage.md) | كانبان طلبات (DnD) |
| المرتجعات | `/returns` | `ReturnsPage.tsx` | [ReturnsPage.md](pages/ReturnsPage.md) | مرتجعات المبيعات |
| الملف الشخصي | `/profile` | `ProfilePage.tsx` | [ProfilePage.md](pages/ProfilePage.md) | بيانات المستخدم |
| العملاء | `/clients` | `ClientsPage.tsx` | [ClientsPage.md](pages/ClientsPage.md) | إدارة العملاء + خط زمني |
| الفئات | `/categories` | `CategoriesPage.tsx` | [CategoriesPage.md](pages/CategoriesPage.md) | فئات المنتجات |
| الموردون | `/suppliers` | `SuppliersPage.tsx` | [SuppliersPage.md](pages/SuppliersPage.md) | إدارة الموردين |
| أوامر الشراء | `/purchase-orders` | `PurchaseOrdersPage.tsx` | [PurchaseOrdersPage.md](pages/PurchaseOrdersPage.md) | أوامر شراء من الموردين |
| الفروع | `/branches` | `BranchesPage.tsx` | [BranchesPage.md](pages/BranchesPage.md) | إدارة الفروع |
| الإعدادات | `/settings` | `SettingsPage.tsx` | [SettingsPage.md](pages/SettingsPage.md) | إعدادات شاملة بصري |
| التقارير | `/reports` | `ReportsPage.tsx` | [ReportsPage.md](pages/ReportsPage.md) | تقارير + رسوم بيانية |
| الاختصارات | `/shortcuts` | `ShortcutsPage.tsx` | [ShortcutsPage.md](pages/ShortcutsPage.md) | مرجع اختصارات لوحة المفاتيح |
| المصروفات | `/expenses` | `ExpensesPage.tsx` | [ExpensesPage.md](pages/ExpensesPage.md) | مصروفات + تقويم |
| الفاتورة الضريبية | `/tax-invoice` | `TaxInvoiceSettingsPage.tsx` | [TaxInvoiceSettingsPage.md](pages/TaxInvoiceSettingsPage.md) | إعدادات الفاتورة الضريبية |
| المساعد الذكي | `/ai-assistant` | `AIAssistantPage.tsx` | [AIAssistantPage.md](pages/AIAssistantPage.md) | مساعد ذكي تجريبي |
| الورديات | `/shifts` | `ShiftsPage.tsx` | [ShiftsPage.md](pages/ShiftsPage.md) | إدارة الورديات |
| سجل الأنشطة | `/activity` | `ActivityPage.tsx` | [ActivityPage.md](pages/ActivityPage.md) | سجل العمليات |
| التشخيص | — | `DiagnosticPage.tsx` | [DiagnosticPage.md](pages/DiagnosticPage.md) | صفحة تشخيص (تطوير) |

---

## النمط المشترك

كل صفحة تتبع نمطًا مشتركًا:

1. **تصدير افتراضي** لمكوّن واحد باسم `XxxPage`.
2. استهلاك السياقات عبر الـ hooks (`useProducts()`, `useNotifications()`, إلخ).
3. استخدام مكونات `ui/` من shadcn للعناصر التفاعلية.
4. استخدام الأيقونات من `@/components/icons`.
5. تنسيق عبر Tailwind classes مع `var(--vuno-*)`.
6. لا تستورد مكونات صفحات أخرى (لا تبعيات دائرية).
7. الـ layout يأتي من `AppLayout` (الشريط الجانبي/العلوي/السفلي) — الصفحة تعرض فقط المحتوى الداخلي.

---

## إضافة صفحة جديدة

1. أنشئ `src/pages/XxxPage.tsx` بمكوّن افتراضي.
2. في `App.tsx`: أضف `const XxxPage = lazy(() => import('@/pages/XxxPage'));`
3. أضف `<Route path="/xxx" element={<XxxPage />} />` داخل `AppLayout` route.
4. في `src/constants/navigation.ts`: أضف العنصر إلى `moreSections` (أو `mainNavItems`) و`pageTitles`.
5. أنشئ ملف توثيق `docs/pages/XxxPage.md`.
6. أضفه إلى فهرس `docs/PAGES.md`.
