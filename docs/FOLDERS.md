# وصف المجلدات (Folders)

يصف هذا الملف كل مجلد رئيسي في `src/` والغرض منه.

---

## src/ — جذر المصدر

المجلد الجذر لكل كود TypeScript/React. يحتوي على نقطة الدخول (`main.tsx`, `App.tsx`) وملف نظام التصميم (`index.css`).

### main.tsx
نقطة دخول التطبيق. يُحمّل `App.tsx` في عنصر `#root` في `index.html`. يُفعّل أدوات React DevTools (إن وجدت).

### App.tsx
المكوّن الجذري. يحتوي على:
- تداخل مزودات Context (9 مزودات حالة + نقطة تركيب الخدمات)
- التوجيه (Routes) مع lazy imports لكل صفحة
- مكوّنات مساعدة: `KeyboardShortcutActivator`, `CommandPaletteOverlay`, `OnboardingWizard`
- `Suspense` مع fallback تحميل

### index.css
نظام التصميم الكامل: متغيرات CSS `--vuno-*`، أنماط Tailwind الأساسية، أنماط الثيم الليلي/النهاري، وأنماط الطباعة.

---

## src/components/ — المكونات المشتركة

مكونات قابلة لإعادة الاستخدام عبر الصفحات. مقسّم إلى:

- **`ui/`** — مكتبة shadcn/ui (40+ مكوّن) مبنية على Radix UI. كل مكوّن في ملف منفصل. ملفات `*-variants.ts` للأنماط، و`*-context.ts` للسياقات الداخلية.
- **`icons/`** — مكتبة الأيقونات SVG المخصصة في `index.tsx`. كل أيقونة مكوّن React.
- **`pos/`** — أجزاء شاشة الكاشير: `CartLines`, `HeldOrdersPanel`, `BundleOffers`, `SaleCompleteView`.
- **`login/`** — `LoginForm` (نموذج واحد للموبايل والديسكتوب)، `LoginModeSwitcher`, `SignUpToggle`.
- المكونات المشتركة على مستوى التطبيق: `AppLayout`, `CommandPalette`, `OnboardingWizard`, `NotificationCenter`, `ProductFormModal`, `BarcodeScannerModal`, `QRCodeButton`, `SalesGoalWidget`, `SearchBar`, `ThermalReceipt`, `SectionCard`, `StatsRow`, `Field`, `DataBackupSection`.

راجع [`COMPONENTS.md`](./COMPONENTS.md) للتفاصيل.

---

## src/pages/ — الصفحات

كل صفحة في التطبيق. كل صفحة في ملف منفصل باسم `XxxPage.tsx`. كلها lazy-loaded من `App.tsx`. 24 صفحة إجمالًا.

راجع [`PAGES.md`](./PAGES.md) للفهرس و`docs/pages/` لملف توثيق لكل صفحة.

---

## src/context/ — سياقات React

9 مزودات لإدارة الحالة + `data-services-context.tsx` (نقطة تركيب كل الخدمات). كل سياق منقسم إلى ملفين: `*Context.tsx` (المزوّد) و`*-context-value.ts` (الـ hook والواجهة).

راجع [`CONTEXTS.md`](./CONTEXTS.md) للتفاصيل الكاملة.

---

## src/hooks/ — الخطافات المخصصة

خطافات الواجهة (`useIsMobile`, `useDeviceType`, `useCommandPalette`, `useKeyboardShortcuts`) + خطاف لكل كيان (`useOrders`, `useClients`, …) + خطافات التنسيق: `useServiceState` (حالة React فوق service) و`useCompleteSale` (use case إتمام البيع) و`useLoginForm`.

راجع [`HOOKS.md`](./HOOKS.md) للتفاصيل.

---

## src/lib/ — الدوال المساعدة

5 ملفات: `utils.ts` (cn, generateId, تنسيق التواريخ), `export-utils.ts` (تصدير Excel), `analytics.ts` (دوال تحليلات نقية), `pricing.ts` (الضريبة وحسابات البيع)، `storage.ts` (الواجهة الوحيدة لـ localStorage). ملاحظة: `payment-icons.ts` انتقل إلى `src/components/` لأنه كود واجهة وليس منطقًا.

راجع [`LIB.md`](./LIB.md) للتفاصيل.

---

## src/services/ — طبقة البيانات

كل كيان في مجلد: `I*Repository` (الواجهة) + `Mock*`/`LocalStorage*Repository` (التطبيق) + `*Service` (القواعد). بالإضافة إلى `sale/` (use case إتمام البيع) ومجلد `mock/` بالبيانات الوهمية. مصممة للاستبدال بـ API حقيقي.

---

## tests/ و src/test-utils/ — الاختبارات

- `tests/architecture.test.ts` — يفشل لو انكسرت حدود الطبقات (لا React في `services/`، لا `Mock*Repository` خارج نقطة التركيب، لا `localStorage` خارج `lib/storage.ts`…).
- `src/**/*.test.ts` — اختبارات الـ services والدوال النقية (بيئة Node).
- `src/**/*.test.tsx` — اختبارات واجهة بـ jsdom (دخان 20 مسار، تدفق الكاشير، تسجيل الدخول).
- `src/test-utils/domStubs.ts` — واجهات المتصفح اللي jsdom مش بيوفرها (`ResizeObserver`, `matchMedia`, `Audio`).

راجع [`SERVICES.md`](./SERVICES.md) للتفاصيل.

---

## src/types/ — تعريفات الأنواع

15 ملف تعريفات TypeScript. `index.ts` يعيد تصدير كل شيء للاستيراد من `@/types`.

راجع [`TYPES.md`](./TYPES.md) للتفاصيل.

---

## src/constants/ — الثوابت

3 ملفات:

| الملف | المحتوى |
|------|---------|
| `navigation.ts` | عناصر التنقل (mainNavItems, moreSections, bottomNavItems, pageTitles) |
| `dashboardActions.ts` | إجراءات لوحة المعلومات السريعة |
| `settingsSections.ts` | أقسام صفحة الإعدادات |

الثوابت منفصلة عن المنطق لتسهيل التعديل والإضافة دون لمس المكونات.

---

## public/ — الأصول الثابتة

ملفات ثابتة تُقدّم كما هي (أيقونات، صور، `favicon`). تُنسخ إلى مجلد الإخراج عند البناء.
