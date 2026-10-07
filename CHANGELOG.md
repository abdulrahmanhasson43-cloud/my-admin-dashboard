# 📋 CHANGELOG — مشروع Vuno (مرحلة التوثيق والتحسين)

> **التاريخ:** أغسطس 2025
> **الإصدار:** 2.1.0 — Documentation & Enhancement Phase
> **المرجع:** ملف `vuno_part1_ideas_1_10.md` + طلب المستخدم للتوثيق الشامل والتحسينات

---

## جولة التقسيم 1 (نسخة 30) — شاشة الكاشير وشاشة الطلبات

> **مهم:** زي الجولة اللي قبلها، اتعملت من غير إنترنت، فما اتشغّلش `npm ci` ولا `tsc -b` ولا `eslint` ولا الاختبارات. الفرق إن الفحص بقى أقوى (تفاصيله في ملف السياق نسخة 30). شغّل الاختبارات قبل الاعتماد.

- **`POSPage` 805 → 423 سطر.** الواجهة اتنقلت لـ12 مكوّن جديد في `components/pos/` (شاشة النجاح، غلاف السلة، الإجماليات، نقاط الولاء، طرق الدفع، الدفع السريع، المبلغ المدفوع، زرار العميل، أزرار الإجراء، شريط البحث، الفئات، قايمة المنتجات). اختصارات الكيبورد في `usePosShortcuts`. منطق البيع (`checkout` والتعليق والدفع السريع) فضل في الصفحة من غير أي تغيير. اتشال `PackageIcon` المحلي (نسخة طبق الأصل من اللي في `components/icons`).
- **`OrdersPage` 556 → 54 سطر.** المكونات الأربعة اللي كانت جواها بقت ملفات في `components/orders/` (+ لوحة الكانبان وقايمة الموبايل والشريط العلوي وشريط الخطأ والإحصائيات). القواعد النقية في `lib/orders.ts` (+ اختبارات)، والحالة في `useOrdersBoard` و`useNewOrderForm`، وخريطة أيقونات الدفع في `constants/orderPaymentIcons.ts` (اسمها `ORDER_PAYMENT_ICONS`).
- **الـJSX اتنقل بالحرف:** تحقق آلي إن كل `className` (168) والنصوص العربية (93) وقيم `style` (45) متطابقة قبل وبعد. الفروق الوحيدة: متغير `selected` اتسمّى `isSelected` جوه نفس الـclass، و`aria-label="إضافة المنتج"` اتضاف لزرار إضافة سطر في نافذة الطلب الجديد (علشان يتلاقى بالـrole).
- **الاختبارات:** `lib/orders.test.ts` (دوال نقية)، و`OrdersPage.test.tsx` (5 اختبارات شاشة كاملة، ما كانش فيه واحد للطلبات). `POSPage.test.tsx` الموجود هو اللي بيغطي الكاشير. كلهم مكتوبين ومش متشغّلين.
- **اتكشف ومااتغيّرش:** `selectedCartItemId` في `POSPage` عمره ما بياخد قيمة غير `null`، فاختصارات الكيبورد لما "عنصر محدد" كود ميت.

---

## جولة الحماية (نسخة 29) — حماية المسارات، صفحة الخطأ، وCI

> **مهم:** الجولة دي اتعملت من غير إنترنت، فما اتشغّلش `npm ci` ولا `tsc -b` ولا `eslint` ولا `npm test` ولا `npm run build`. التفاصيل في ملف السياق (نسخة 29). شغّل الاختبارات قبل الاعتماد.

- **حماية المسارات:** كل مسار خاص (25 مسار) بقى جوه `<Route element={<RequireAuth />}>`. اللي ما عندوش جلسة بيتحوّل لـ`/login`. `/` و`/login` وصفحة الفاتورة العامة فضلوا مفتوحين. **تغيير سلوك:** أول فتح بعد النشر هيطلب تسجيل دخول مرة واحدة (أي إدخال بيدخل، لأن التسجيل لسه محاكاة)، وبعدها الجلسة بتفضل بعد التحديث.
- **دومين `auth` جديد** (`services/auth/`) بنفس قالب الباقي: `IAuthSessionRepository` + `LocalStorageAuthSessionRepository` + `AuthService` (+ 4 اختبارات). الجلسة بتتحقق من شكلها (التخزين مش موثوق). مسجّل في `DataServicesProvider`، ومفتاحه `authSession` مش داخل في النسخة الاحتياطية.
- **زرارا الخروج ما كانوش بيخرّجوا:** زرار القايمة الجانبية كان `navigate('/login')` بس، وزرار الملف الشخصي كان بيعرض رسالة بس. الاتنين دلوقتي على `useSignOut`.
- **`ErrorBoundary`:** أي خطأ رندر كان بيفضّي التطبيق لشاشة بيضا. دلوقتي الجزء اللي وقع بس بيتبدل برسالة وزرارين، والقايمة بتفضل شغالة (الحدود حوالين `<Outlet />` في `AppLayout`، ونسخة تانية حوالين `<Suspense>` في `App.tsx`). بيصلّح نفسه لما المستخدم يروح لصفحة تانية.
- **CI:** `.github/workflows/ci.yml` بيشغّل `lint` و`test` و`build` (والـbuild بيعمل `tsc -b`) على كل push وpull request. قبل كده بناء Vercel كان بيشغّل `tsc` و`vite build` بس، والاختبارات ما كانتش بتتشغّل أوتوماتيك.
- **الاختبارات:** 17 جديدة (`AuthService` 4، `RequireAuth` والخروج 4، `ErrorBoundary`/`ErrorFallback` 6، حارس المسارات في اختبار الدخان 3). اختبارات الصفحات الأربعة (المصاريف، الكاشير، الفواتير، الفروع) واختبار الدخان اتجهزوا بجلسة دخول تجريبية (`signInForTests` في `test-utils/domStubs.ts`) لأنهم بيفتحوا مسارات خاصة.

---

## جولة المعمارية 4 (نسخة 28) — تقسيم 3 صفحات + رسائل التنبيه ما كانتش بتظهر

- **`ExpensesPage` (708 → 140 سطر):** حسابات التقويم والتجميع والملخص والتصفية وتصدير Excel وتحليل نموذج الإضافة بقت دوال نقية في `lib/expenses.ts` (14 اختبار). الواجهة اتقسمت لـ`components/expenses/`: `CalendarView` و`DayPanel` و`ExpenseFormPanel` و`ExpenseViewToggle` و`ExpenseCategoryFilter` و`ExpenseList`.
- **`InvoicePage` (687 → 159 سطر):** قواعد بناء الفاتورة (إضافة منتج، الكمية، الحذف، الخصم قبل الضريبة) في `lib/invoiceBuilder.ts` (9 اختبارات)، وحالة اللوحة والحفظ في `hooks/useInvoiceBuilder.ts`، والثوابت في `constants/invoice.ts`، والواجهة في `components/invoice/`: `InvoiceBuilderPanel` و`InvoiceDetailModal` و`InvoiceListRows` و`InvoiceMobileCards` و`InvoiceStatusBadge`.
- **`BranchesPage` (660 → 182 سطر):** قواعد الصلاحيات (تبديل صلاحية، وجودها، عدّ الأدوار) في `lib/permissions.ts` (11 اختبار)، ونماذج الفرع والموظف في `hooks/useBranchForm.ts` و`hooks/useStaffForm.ts`، والواجهة في `components/branches/`: `ActiveBranchBanner` و`BranchFormPanel` و`BranchCard` و`RoleLegend` و`StaffRow` و`StaffFormModal`.
- **رسائل التنبيه (`toast`) ما كانتش بتظهر أصلًا:** التطبيق بينادي `toast.success/error` من حوالي 76 مكان (باقي الدفع، مسح الباركود، استرجاع النسخة، تنبيه المخزون…)، لكن مفيش أي مكان كان بيعرض الحاوية `<Toaster />`، فكل الرسائل دي كانت غير مرئية. اتضاف `components/AppToaster.tsx` في `App.tsx`. اتأكدت بالاختبار: بدونه الرسالة مش بتظهر، ومعاه بتظهر. **الشكل نفسه (الموضع، الألوان) لسه محتاج نظرة بعينك.**
- **المصروفات: مبلغ صفر أو سالب كان بيضيع بصمت:** النموذج كان بيتقفل، والخدمة بترفض، والخطأ بيروح لـunhandled promise rejection، فمفيش حاجة تتحفظ ومفيش رسالة. دلوقتي رسالة "المبلغ لازم يكون رقم أكبر من صفر" والنموذج بيفضل مفتوح، وأي فشل تاني في الحفظ برضه بيطلّع رسالة ويفضل النموذج مفتوح.
- **اختبارات صفحات كاملة:** المصاريف (6) والفواتير (7) والفروع والموظفين (13) بالـproviders الحقيقية.

---

## جولة المعمارية 3 (نسخة 27) — اختبارات كل الخدمات + أخطاء اتكشفت

- **اختبارات لكل الخدمات:** الـ16 خدمة اللي كانت من غير اختبارات (`Return`, `Bundle`, `Invoice`, `Expense`, `Client`, `Staff`, `PurchaseOrder`, `Settings`, `Shift`, `Branch`, `Category`, `Supplier`, `Loyalty`, `Profile`, `FlashSale`, `PricingPlan`) بقى عليها اختبارات بدون ما يتغير سلوكها. دلوقتي كل الـ23 دومين + use case البيع متغطيين.
- **أرقام الفواتير والمرتجعات كانت بتتكرر:** `INV-` برقم من 900 احتمال و`RET-` من 900 كمان، فمع بضع عشرات من الفواتير بيحصل تكرار (اختبار 1000 فاتورة طلّع 573 رقم مختلف بس). تكرار الرقم معناه إن `markAsPaid` أو `cancelInvoice` ممكن يمسّ فاتورة غلط. اتصلح بـ`pickUniqueId` في `lib/utils.ts` (بيتحقق من الـ repository ويرجع لرقم زمني لو الأرقام القصيرة خلصت).
- **الدفع السريع كان بيسجّل طريقة الدفع الغلط:** لو الكاشير اختار "بطاقة" ثم ضغط 500 (دفع سريع بيحوّل لكاش)، الإيصال كان بيطلع "بطاقة". السبب إن `handleCheckout` كان بيقرا الحالة قبل ما تتحدّث. دلوقتي `checkout(paymentMethod)` بياخد الطريقة كمعامل، وفيه اختبار على الحالة دي.
- **`POSPage`:** حالة الكتالوج (بحث وفئة وتصفية) وحالة الدفع (الطريقة والمبلغ والباقي) بقوا `usePosCatalog` و`usePosPayment` بدل ما يكونوا جوه الصفحة، وعليهم اختبارات. الصفحة 805 سطر و14 `useState` (كانت 18).
- اختبار الـstaff كان بيمر وهو فاضي: استخدم دور (`cashier`) مش موجود في النظام فكان الطرفين `undefined`. اتصلح على الأدوار الحقيقية (`owner`/`manager`/`employee`).

---

## جولة المعمارية 2 (نسخة 26) — إكمال الباقي

- **4 contexts بقت على نمط الـ repository:** `Notifications` و`ActivityLog` و`HeldOrders` و`SalesGoal` كانوا بيخزّنوا في `localStorage` بدون أي service. دلوقتي كل واحد له `I*Repository` + `LocalStorage*Repository` + `*Service` (القواعد: الحد الأقصى 50/200، "تم الوصول للهدف"، ترقيم الطلبات المعلقة…) + اختبارات، والـ provider بقى بيحتفظ بالحالة بس.
- **نقطة تركيب واحدة:** السبع providers القديمة (`Product/Order/Return/Invoice/Branch/Category/Supplier ServiceProvider`) اتحذفت واتنقلت لـ `DataServicesProvider`. الـ hooks (`useOrderService` وغيره) محتفظة بنفس الأسماء وبقت بتقرأ منه. اختبار المعمارية بقى يفشل لو أي ملف غير `data-services-context.tsx` استورد `Mock*`/`LocalStorage*Repository`.
- **إتمام البيع use case:** منطق `handleCheckout` (بيع ثم وردية ثم هدف ثم سجل) اتنقل لـ `services/sale/CompleteSale.ts` كدالة نقية على "ports" مع اختبارات بـ fakes، و`hooks/useCompleteSale.ts` بيوصّله بالـ contexts الحقيقية.
- **تقسيم `POSPage`:** من 1072 لحوالي 820 سطر. اتفصل `SaleCompleteView` و`HeldOrdersPanel` و`BundleOffers` و`CartLines` في `components/pos/`.
- **`LoginPage`:** نموذج الموبايل والديسكتوب (كانوا مكررين حرفيًا تقريبًا) بقوا `components/login/LoginForm.tsx` واحد + `hooks/useLoginForm.ts`. الفروق الصغيرة بين التصميمين اتحفظت في `variant`.
- **اختبارات واجهة:** jsdom + Testing Library. اختبار دخان بيفتح 20 مسار بالـ providers الحقيقية، واختبارات تدفق الكاشير (إضافة، دفع، إيصال، هدف، سجل، تعليق واسترداد) وتسجيل الدخول.
- **أخطاء اتصلحت في الطريق:**
  - `resumeOrder` كان بيحدد النتيجة جوه `setState(prev => …)` فممكن يرجّع `null` ويضيع الطلب المعلق. بقى بيرجّع الطلب فعلًا.
  - `SalesGoalContext` كان بينادي `addNotification` (setState في component تاني) من جوه updater، وده بيطلّع تحذير React. بقى بعد تغيير الحالة.
  - ترقيم الطلبات المعلقة `HLD-` + آخر 6 أرقام من الساعة ممكن يتكرر. بقى فريد.
  - `new Audio().play()` كان ممكن يرمي Promise rejection لو المتصفح منع الصوت. بقى مأمّن.
- **تغييرات سلوك صغيرة (مقصودة):**
  - صوت "تم الدفع" بقى بيشتغل بعد نجاح البيع، مش قبل ما يتأكد (كان بيشتغل حتى لو البيع فشل).
  - إشعار "تم تحقيق هدف الشهر" بقى بيطلع عند لحظة العبور فعلًا. قبل كده كان مرة لكل تشغيل للتطبيق: بيتكرر بعد كل reload مع أول بيعة بعد الوصول للهدف، ولا يطلع تاني لو رفعت الهدف وعدّيته بعدين.
  - رقم الطلب المعلق بيزيد له لاحقة عشوائية بس لما يتكرر مع طلب موجود.

---

## جولة المعمارية (نسخة 25) — Clean Architecture

- **اختبارات:** إضافة vitest + 54 اختبار (`ProductService` و`OrderService` و`ReportingService` و`pricing` و`storage` و`cart`) + `tests/architecture.test.ts` اللي بيفشل لو حد كسر حدود الطبقات. الأمر: `npm test`.
- **البيانات الثابتة في الصفحات:** أرقام الأسبوع والسنة والفئات وطرق الدفع والخسائر وإيراد اليوم كانت مكتوبة جوه `DashboardPage` و`ReportsPage`. اتنقلت لـ `ReportingService` (نفس الأرقام بالظبط)، وألوان الرسم فضلت في الصفحة لأنها عرض مش بيانات.
- **سلة الكاشير:** قواعد السلة (إضافة، متغيرات، تغيير الكمية، حذف، عدّ) اتنقلت من `POSPage` لدوال نقية في `lib/cart.ts` مع اختبارات.
- **الضريبة:** نسبة 14% بقت في `lib/pricing.ts` فقط (كانت في 3 أماكن).
- **التخزين:** كل استخدام مباشر لـ `localStorage` (9 ملفات) اتنقل لـ `lib/storage.ts` + `constants/storageKeys.ts`.
- **إصلاح خطأ:** استيراد النسخة الاحتياطية كان بيكتب الإشعارات على مفتاح `vuno_notifications` بينما التطبيق بيقرأ `vuno-notifications`، فالإشعارات ما كانتش بترجع.
- **فصل الطبقات:** `types/order.ts` بطّل يستورد أيقونات الواجهة (الأيقونات والألوان في `constants/orderStatusMeta.ts`)، و`payment-icons.ts` انتقل من `lib/` إلى `components/`.

---

## نظرة عامة

هذا التغيير يوثّق جميع التعديلات والإضافات التي تمت في مرحلة توثيق وتحسين مشروع Vuno. تنقسم التغييرات إلى أربع مراحل: مراجعة الكود وتنظيفه، التوثيق الشامل، الميزات الجديدة، والتحقق النهائي. جميع التعديلات متوافقة مع البنية التقنية الأصلية (React 19 + TypeScript + Vite + shadcn/ui + Tailwind CSS) ولم يتم تغيير أي تبعية أو بنية أساسية.

---

## 📌 جدول المحتويات

1. [مرحلة 1: مراجعة الكود وتنظيفه](#مرحلة-1-مراجعة-الكود-وتنظيفه)
2. [مرحلة 2: التوثيق الشامل](#مرحلة-2-التوثيق-الشامل)
3. [مرحلة 3: الميزات الجديدة](#مرحلة-3-الميزات-الجديدة)
4. [مرحلة 4: التحقق النهائي](#مرحلة-4-التحقق-النهائي)
5. [ملخص الملفات المُعدّلة والمُضافة](#ملخص-الملفات-المعدّلة-والمضافة)

---

## مرحلة 1: مراجعة الكود وتنظيفه

### الأخطاء المُصحَّحة (Clean Code Audit)

تمت مراجعة كامل الكود المصدري (165 ملف TypeScript/TSX) وإصلاح جميع مخالفات قواعد ESLint و TypeScript:

| الخطأ | الملفات المتأثرة | الإصلاح |
|-------|------------------|---------|
| `prefer-const` | عدة ملفات | تغيير `let` إلى `const` حيث لا يحدث إعادة إسناد |
| `react-hooks/set-state-in-effect` | عدة صفحات | استبدال `useEffect` + `setState` بـ `useMemo` للقيم المشتقّة |
| `react-hooks/purity` | عدة مكوّنات | استبدال `Math.random()`/`Date.now()` في وقت التصيير بـ `generateId()`/`generateNumericId()` |
| `react-refresh/only-export-components` | ملفات السياقات | فصل قيم السياق والـ hooks إلى ملفات `*-context-value.ts` منفصلة |
| `react-hooks/exhaustive-deps` | عدة ملفات | إضافة التبعيات الناقصة لمصفوفات `useEffect`/`useCallback` |
| إنشاء مكوّنات أثناء التصيير | عدة ملفات | استبدال الدوال التي تُرجع مكوّنات بخرائط ثابتة (مثل `PAYMENT_ICONS: Record<...>`) |

### النتيجة

- **ESLint:** 0 أخطاء (1 تحذير موجود مسبقاً في `NotificationsContext.tsx` غير مرتبط بالتغييرات)
- **TypeScript (`tsc --noEmit`):** 0 أخطاء
- **البناء الإنتاجي (`vite build`):** ناجح

---

## مرحلة 2: التوثيق الشامل

تم إنشاء **49 ملف توثيق Markdown** شامل يغطي كل عنصر في المشروع، بحيث يمكن لأي مطوّر جديد فهم المشروع بالكامل دون قراءة الكود من الصفر.

### 2.1 التوثيق الرئيسي (11 ملف في `docs/`)

| الملف | المحتوى |
|------|---------|
| `docs/ARCHITECTURE.md` | الأنماط المعمارية، تدفق البيانات، البنية الطبقية، فصل السياقات |
| `docs/CONTEXTS.md` | توثيق كامل لجميع مزوّدات React Context التسعة |
| `docs/DESIGN-SYSTEM.md` | متغيّرات CSS `--vuno-*`، الثيمات (فاتح/داكن)، المكوّنات، الأنيميشن |
| `docs/FOLDERS.md` | وصف كل مجلد رئيسي في المشروع |
| `docs/HOOKS.md` | توثيق الـ hooks المخصّصة الأربعة |
| `docs/LIB.md` | توثيق ملفات lib الثلاثة (utils, export-utils, payment-icons) |
| `docs/SERVICES.md` | توثيق طبقة الخدمات الوهمية (mock services) |
| `docs/TYPES.md` | توثيق جميع ملفات تعريفات الأنواع الـ 15 |
| `docs/PAGES.md` | فهرس لجميع الصفحات الـ 24 |
| `docs/COMPONENTS.md` | فهرس لجميع المكوّنات المشتركة الـ 15 |

### 2.2 توثيق الصفحات (24 ملف في `docs/pages/`)

تم إنشاء ملف `.md` منفصل لكل صفحة من الصفحات الـ 24، يتبع قالباً موحّداً يشمل:

- عنوان الصفحة ومسار الملف وعدد السطور والمسار (route)
- نظرة عامة وملخص وظيفي
- السياقات المستخدمة
- المكوّنات المشتركة المستخدمة
- الخدمات والثوابت
- ملاحظات للمطوّر (توافق React Compiler، RTL، الاستجابة)
- روابط مرجعية متقاطعة

**الملفات:** `DashboardPage.md`, `POSPage.md`, `ProductsPage.md`, `OrdersPage.md`, `InventoryPage.md`, `InvoicePage.md`, `ClientsPage.md`, `ExpensesPage.md`, `ReturnsPage.md`, `ReportsPage.md`, `SettingsPage.md`, `BranchesPage.md`, `CategoriesPage.md`, `SuppliersPage.md`, `PurchaseOrdersPage.md`, `ShiftsPage.md`, `ActivityPage.md`, `AIAssistantPage.md`, `ProfilePage.md`, `LoginPage.md`, `LandingPage.md`, `ShortcutsPage.md`, `TaxInvoiceSettingsPage.md`, `DiagnosticPage.md`

### 2.3 توثيق المكوّنات (15 ملف في `docs/components/`)

تم إنشاء ملف `.md` منفصل لكل مكوّن مشترك رئيسي، يتبع قالباً موحّداً يشمل:

- عنوان المكوّن ومسار الملف وعدد السطور
- نظرة عامة
- التصديرات والخصائص (Props)
- المستهلكون (أين يُستخدم المكوّن)
- السياقات المستخدمة
- ملاحظات للمطوّر
- روابط مرجعية متقاطعة

**الملفات:** `AppLayout.md`, `CommandPalette.md`, `OnboardingWizard.md`, `NotificationCenter.md`, `ProductFormModal.md`, `BarcodeScannerModal.md`, `QRCodeButton.md`, `SalesGoalWidget.md`, `SearchBar.md`, `ThermalReceipt.md`, `SectionCard.md`, `StatsRow.md`, `Field.md`, `DataBackupSection.md`, `LowStockAlertsWidget.md` (جديد)

### 2.4 التوثيق داخل الكود (JSDoc)

- **`src/lib/utils.ts`:** إضافة JSDoc كامل لدالة `cn()` مع مثال استخدام
- **`src/lib/export-utils.ts`:** كان يحتوي على JSDoc شامل (تم التحقق منه)
- **`src/lib/payment-icons.ts`:** كان يحتوي على JSDoc (تم التحقق منه)
- باقي ملفات lib كانت موثّقة بالفعل من المراحل السابقة

### 2.5 README الرئيسي

- **`README.md`** (~24KB، ~4000 كلمة): توثيق شامل بالعربية يشمل نظرة عامة، البنية التقنية، تعليمات التشغيل، هيكل المشروع، الأنماط المعمارية، نظام التصميم، السياقات، الصفحات، المكوّنات، الخدمات، الأنواع، الـ hooks، ودليل المساهمة

---

## مرحلة 3: الميزات الجديدة

### 3.1 التحقق من الأفكار العشر الأصلية

تم التحقق من أن جميع الأفكار العشر من ملف `vuno_part1_ideas_1_10.md` كانت مُنفّذة بالفعل في المشروع (الجزء 2):

1. لوحة الأوامر (Command Palette) ✅
2. بطاقات المنتجات (Product Cards) ✅
3. ودجة هدف المبيعات (Sales Goal Widget) ✅
4. واجهة نقطة البيع (POS Interface) ✅
5. لوحة الطلبات Kanban (Orders Kanban) ✅
6. الخط الزمني للعميل (Customer Timeline) ✅
7. نقل المخزون (Inventory Transfer) ✅
8. تقويم المصاريف (Expense Calendar) ✅
9. منشئ الفواتير (Invoice Builder) ✅
10. لوحة الإعدادات البصرية (Settings Visual Panel) ✅

### 3.2 ملف الأفكار الجديدة — `NEW_IDEAS.md`

تم إنشاء ملف `NEW_IDEAS.md` (~302 سطر) يوثّق **12 فكرة تحسين إضافية** (#11-22) بالعربية:

| # | الفكرة | الأولوية | المدة المقدّرة |
|---|--------|---------|---------------|
| 11 | لوحة تحكم قابلة للتخصيص (Customizable Dashboard Widgets) | 🟡 متوسطة | 3-4 أيام |
| 12 | تنبيهات المخزون الذكية (Smart Low-Stock Alerts) | 🔴 عالية | 2-3 أيام |
| 13 | الوضع غير المتصل (Offline Mode) | 🟡 متوسطة | 5-7 أيام |
| 14 | حاسبة الضرائب التلقائية (Auto Tax Calculator) | 🔴 عالية | 1-2 يوم |
| 15 | التنبؤ بالمبيعات (Sales Forecasting) | 🟢 منخفضة | 4-5 أيام |
| 16 | محرّك العروض والخصومات (Promotions & Discounts) | 🟡 متوسطة | 3-4 أيام |
| 17 | المهام اليومية/قائمة المهام (Daily Tasks/To-Do) | 🟢 منخفضة | 2-3 أيام |
| 18 | التحكم بالوصول حسب الدور (Role-Based Access Control) | 🔴 عالية | 4-5 أيام |
| 19 | تصدير PDF (PDF Export) | 🟡 متوسطة | 2-3 أيام |
| 20 | تعدد اللغات (Multi-language / i18n) | 🟢 منخفضة | 5-7 أيام |
| 21 | لوحة مقارنة الفروع (Branch Comparison Dashboard) | 🟡 متوسطة | 3-4 أيام |
| 22 | البحث الشامل (Global Search) | 🔴 عالية | 2-3 أيام |

كل فكرة تتضمن: الوصف، التصميم المقترح للواجهة، التنفيذ التقني، الأولوية، والمدة المقدّرة.

### 3.3 تنفيذ الفكرة #12 — ودجة تنبيهات المخزون الذكية

#### الملف الجديد: `src/components/LowStockAlertsWidget.tsx` (204 سطر)

**الوصف:** مكوّن قابل لإعادة الاستخدام يعرض المنتجات منخفضة المخزون مع **توقّع عدد الأيام قبل النفاد** وزر مباشر لإنشاء أمر شراء.

**المميزات:**
- يحسب متوسط المبيعات اليومية من سجل النشاطات (`ActivityLogContext`)
- يتنبأ بعدد الأيام قبل نفاد كل منتج (`Math.ceil(storeStock / avgDailySales)`)
- يصنّف المنتجات إلى ثلاث مستويات خطورة:
  - 🔴 **حرج** (نفد المخزون — `storeStock === 0`)
  - 🟡 **عاجل** (النصف الأدنى من الحد — `storeStock <= threshold / 2`)
  - 🔵 **تحذير** (أقل من الحد — `storeStock < threshold`)
- زر "أمر شراء" لكل منتج + زر شامل في التذييل
- حالة فارغة برسالة نجاح عند عدم وجود منتجات منخفضة
- أنيميشن دخول تدريجي (Framer Motion)

**التوافق مع أنماط المشروع:**
- ✅ يستخدم `useMemo` للقيم المشتقّة (React Compiler compliant)
- ✅ يستخدم متغيّرات CSS `--vuno-*` وفئة `card-vuno`
- ✅ يدعم RTL: الأرقام بـ `dir="ltr"` و `tabular-nums`
- ✅ يستخدم الأيقونات المخصّصة من `@/components/icons`
- ✅ يستخدم السياقات الموجودة (`useProducts`, `useAppSettings`, `useActivityLog`)
- ✅ يحتوي على JSDoc كامل

#### الملف المُعدّل: `src/pages/DashboardPage.tsx`

- إضافة استيراد `LowStockAlertsWidget`
- استبدال قسم "مخزون منخفض" الأساسي القديم بالودجة المحسّنة `<LowStockAlertsWidget maxItems={5} />`
- إزالة استيراد `AlertTriangleIcon` غير المستخدم (كان مستخدماً في القسم القديم فقط)
- متغيّر `lowStockProducts` لا يزال مستخدماً في عدّاد الإحصائيات

#### الملف الجديد: `docs/components/LowStockAlertsWidget.md`

توثيق كامل للودجة الجديدة يتبع نفس قالب توثيق المكوّنات.

---

## مرحلة 4: التحقق النهائي

### التحقق من البناء

- **TypeScript (`tsc --noEmit`):** ✅ 0 أخطاء
- **ESLint (`eslint .`):** ✅ 0 أخطاء (1 تحذير موجود مسبقاً)
- **البناء الإنتاجي (`vite build`):** ✅ ناجح

### التوافق

- ✅ لم يتم تغيير أي تبعية أو إصدار
- ✅ لم يتم تغيير البنية الأساسية للمشروع
- ✅ جميع التعديلات تتبع أنماط الكود الموجودة
- ✅ جميع الملفات الجديدة تتبع اصطلاحات التسمية والتنظيم الموجودة

---

## ملخص الملفات المُعدّلة والمُضافة

### ملفات مُضافة (52 ملف جديد)

**التوثيق (49 ملف):**
- `README.md` (تحديث شامل)
- `docs/ARCHITECTURE.md`
- `docs/CONTEXTS.md`
- `docs/DESIGN-SYSTEM.md`
- `docs/FOLDERS.md`
- `docs/HOOKS.md`
- `docs/LIB.md`
- `docs/SERVICES.md`
- `docs/TYPES.md`
- `docs/PAGES.md`
- `docs/COMPONENTS.md`
- `docs/pages/*.md` (24 ملف)
- `docs/components/*.md` (15 ملف، منها 1 جديد للودجة الجديدة)

**الميزات الجديدة (3 ملفات):**
- `NEW_IDEAS.md` — 12 فكرة تحسين إضافية
- `src/components/LowStockAlertsWidget.tsx` — ودجة تنبيهات المخزون الذكية
- `CHANGELOG.md` — هذا الملف

### ملفات مُعدّلة (2 ملف)

- `src/pages/DashboardPage.tsx` — دمج الودجة الجديدة وإزالة الكود غير المستخدم
- `src/lib/utils.ts` — إضافة JSDoc لدالة `cn()`

---

## ملاحظات للمطوّرين

- جميع التوثيق مكتوب بالعربية مع المصطلحات التقنية بالإنجليزية حيث يلزم
- كل ملف توثيق يحتوي على روابط مرجعية متقاطعة للملفات ذات الصلة
- يمكن لأي مطوّر جديد البدء بقراءة `README.md` ثم التعمّق عبر `docs/` حسب الحاجة
- الأفكار الجديدة في `NEW_IDEAS.md` مرتّبة حسب الأولوية مع تعليمات تنفيذ تتبع أنماط المشروع الحالية

---

## 📦 الإصدار 2.2.0 — تنفيذ أفكار الجزء الثاني (#11–#20)

> **التاريخ:** أغسطس 2025
> **المرجع:** ملف `vuno_part2_ideas_11_20.md` (10 أفكار جديدة)
> **التحقق:** `tsc --noEmit` (0 أخطاء) · `vite build` (نجح في 9.04s) · `eslint` (0 أخطاء)

---

### نظرة عامة

تم تنفيذ 10 أفكار جديدة من ملف الأفكار الجزء الثاني. بعض الأفكار كانت موجودة جزئيًا في الكود وتم تعزيزها، وأخرى تم إنشاؤها من الصفر. جميع التعديلات متوافقة مع البنية التقنية الأصلية (React 19 + TypeScript + Vite + Tailwind CSS) ولم يتم تغيير أي تبعية أو بنية أساسية.

---

### الأفكار المنفّذة

#### #11 Barcode Scanner — ماسح الباركود
- إعادة كتابة `BarcodeScannerModal.tsx` بالكامل
- صوت beep عبر Web Audio API (موجة جيبية 880Hz) — لا حاجة لملف mp3
- اهتزاز عبر `navigator.vibrate()` على الأجهزة المحمولة
- خط مسح متحرك (Framer Motion) + أقواس زاوية لمنطقة المسح
- معالجة عدم العثور على المنتج: toast + زر "إضافة منتج جديد"
- `detectedRef` لمنع الكشف المكرر في نفس الإطار

#### #12 Hold Order — تعليق الطلب
- ملف جديد `HoldOrderPopup.tsx` — نافذة منبثقة لإدخال اسم العميل + سبب التعليق
- أسباب جاهزة: "العميل راح يجيب فلوس"، "انتظار تأكيد"، "أخرى"
- تحديث `HeldOrdersContext` و `held-orders-context-value.ts` لقبول `reason`
- إضافة حقل `reason?: string` إلى `HeldOrder` في `types/shift.ts`
- عرض شارة السبب (pill صفراء) على بطاقات الطلبات المعلقة في POSPage

#### #13 Quick Pay Buttons — أزرار الدفع السريع
- زيادة المبالغ المسبقة إلى 6: `[50, 100, 200, 500, 1000, 2000]`
- شبكة 3 أعمدة (`grid-cols-3`) بدلاً من 4
- حقل إدخال المبلغ المدفوع يدويًا
- عرض الباقي (التُكعة) باللون الأخضر مع أيقونة `CoinsIcon`
- زر دفع أخضر كبير (`bg: #16a34a`)
- toasts للباقي / الدفع المطابق

#### #14 Shift Management — إدارة الورديات
- حساب الفرق (variance) و المبلغ المتوقع في `ShiftContext.closeShift`
- إضافة `variance?` و `expectedAmount?` إلى `Shift` في `types/shift.ts`
- عرض المبلغ المتوقع في بطاقة الوردية الحالية
- معاينة الفرق المباشر أثناء إدخال مبلغ الختام (أخضر/أحمر)
- شارة الفرق على بطاقات الورديات المغلقة
- زر "طباعة تقرير الوردية" — يفتح نافذة طباعة بتصميم RTL نظيف
- شارة حالة الوردية في التوب بار (نقطة خضراء نابضة + "وردية مفتوحة")

#### #15 Low Stock Alert — تنبيه نقص المخزون
- hook جديد `useLowStockAlert.ts` — يُستدعى مرة واحدة عند فتح التطبيق
- صوت beep عبر Web Audio API عند اكتشاف منتجات منخفضة
- اهتزاز عبر `navigator.vibrate([120, 60, 120])`
- toast تفاعلي مع زر "عرض المخزون" للانتقال المباشر
- إضافة إشعار إلى مركز التنبيهات عبر `notifyLowStock`
- شارة حمراء نابضة على أيقونة المخزون في الشريط الجانبي بعدد المنتجات

#### #16 Supplier Cards Grid — بطاقات الموردين
- زر WhatsApp على كل بطاقة مورد (لون `#25D366`) يفتح `wa.me`
- تنسيق تلقائي لأرقام الهواتف المصرية (إضافة كود +20)
- أزرار تصفية حسب الحالة: الكل / نشط / غير نشط (pills مع عداد)

#### #17 Returns Manager — إدارة المرتجعات
- ✅ كان موجودًا بالكامل مسبقًا (`ReturnsPage.tsx`) — تبويبات عملااء/موردين، بطاقات بأسباب، خط أنابيب الحالة، نافذة إنشاء مرتجع

#### #18 Multi-Branch Switcher — مبدّل الفروع
- ✅ التبديل كان موجودًا في التوب بار
- ✅ تم إضافة خيار "إضافة فرع جديد" في أسفل القائمة المنسدلة (ينتقل إلى `/branches`)

#### #19 AI Insights — رؤى ذكية
- مكون جديد `AIInsightsWidget.tsx` — بطاقات توصيات ديناميكية
- تحليل البيانات وإنتاج 4 أنواع توصيات:
  - "زِد مخزون هذا المنتج" — للمنتجات على وشك النفاد
  - "اعرض خصمًا على هذا المنتج" — للمنتجات الراكدة
  - "تقدّمك نحو الهدف" — نسبة تحقق هدف المبيعات
  - "ركّز على هذا المنتج الرابح" — أعلى هامش ربح
- كل بطاقة لها لون حسب النوع (نجاح/تحذير/معلومة) وزر انتقال
- دمج في `DashboardPage` بعد قسم تنبيهات المخزون

#### #20 Daily Summary WhatsApp — الملخص اليومي
- مكون جديد `DailySummarySection.tsx` — قسم إعدادات كامل
- مفتاح تفعيل/إيقاف + إدخال وقت الإرسال + رقم WhatsApp
- توليد رسالة ملخص يومي (مبيعات، فواتير، وردية، منتجات منخفضة)
- زر "إرسال الملخص الآن" يفتح `wa.me` برسالة جاهزة (URL-encoded)
- إضافة قسم "الملخص اليومي" إلى `settingsSections.ts`
- دمج في `SettingsPage` مع `SectionHeader` وأيقونة WhatsApp

---

### الملفات المُضافة (4 ملفات)

- `src/components/HoldOrderPopup.tsx` — نافذة تعليق الطلب (#12)
- `src/hooks/useLowStockAlert.ts` — hook تنبيه نقص المخزون (#15)
- `src/components/AIInsightsWidget.tsx` — ودج الرؤى الذكية (#19)
- `src/components/DailySummarySection.tsx` — قسم الملخص اليومي (#20)

### الملفات المُعدّلة (10 ملفات)

- `src/components/icons/index.tsx` — 5 أيقونات جديدة (Lightbulb, Volume, ScanLine, Coins, CircleSlash)
- `src/types/shift.ts` — `HeldOrder.reason`, `Shift.variance`, `Shift.expectedAmount`
- `src/context/ShiftContext.tsx` — حساب variance في `closeShift`
- `src/context/held-orders-context-value.ts` + `HeldOrdersContext.tsx` — `holdOrder` يقبل `reason`
- `src/context/app-settings-context-value.ts` + `AppSettingsContext.tsx` — إعدادات الملخص اليومي
- `src/components/BarcodeScannerModal.tsx` — إعادة كتابة كاملة (#11)
- `src/pages/POSPage.tsx` — #11 toasts + #12 popup + #13 quick pay UI
- `src/pages/ShiftsPage.tsx` — variance + تقرير قابل للطباعة (#14)
- `src/components/AppLayout.tsx` — شارة الوردية + شارة المخزون + خيار إضافة فرع
- `src/pages/SuppliersPage.tsx` — زر WhatsApp + أزرار التصفية (#16)
- `src/pages/DashboardPage.tsx` — دمج AIInsightsWidget (#19)
- `src/constants/settingsSections.ts` + `src/pages/SettingsPage.tsx` — قسم الملخص اليومي (#20)

---

### ملاحظات تقنية

- استخدم Web Audio API لتوليد أصوات beep برمجيًا بدلاً من الاعتماد على ملفات mp3
- استخدم `useRef` guard في `useLowStockAlert` لتفادي تكرار التنبيه
- استخدم `useMemo` لجميع القيم المشتقة (expectedAmount, variance, insights, summaryMessage)
- شارة المخزون في الشريط الجانبي تستخدم `animate-pulse` للجذب الانتباه
- تقرير الوردية يفتح نافذة منفصلة بـ `window.open` مع `@media print` للطباعة النظيفة
- رسالة WhatsApp تُرسل عبر `wa.me/{number}?text={encoded}` مع ترميز URL كامل
