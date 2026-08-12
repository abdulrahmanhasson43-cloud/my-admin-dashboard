# وصف المجلدات (Folders)

يصف هذا الملف كل مجلد رئيسي في `src/` والغرض منه.

---

## src/ — جذر المصدر

المجلد الجذر لكل كود TypeScript/React. يحتوي على نقطة الدخول (`main.tsx`, `App.tsx`) وملف نظام التصميم (`index.css`).

### main.tsx
نقطة دخول التطبيق. يُحمّل `App.tsx` في عنصر `#root` في `index.html`. يُفعّل أدوات React DevTools (إن وجدت).

### App.tsx
المكوّن الجذري. يحتوي على:
- تداخل مزودات Context (9 مزودات)
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
- المكونات المشتركة على مستوى التطبيق: `AppLayout`, `CommandPalette`, `OnboardingWizard`, `NotificationCenter`, `ProductFormModal`, `BarcodeScannerModal`, `QRCodeButton`, `SalesGoalWidget`, `SearchBar`, `ThermalReceipt`, `SectionCard`, `StatsRow`, `Field`, `DataBackupSection`.

راجع [`COMPONENTS.md`](./COMPONENTS.md) للتفاصيل.

---

## src/pages/ — الصفحات

كل صفحة في التطبيق. كل صفحة في ملف منفصل باسم `XxxPage.tsx`. كلها lazy-loaded من `App.tsx`. 24 صفحة إجمالًا.

راجع [`PAGES.md`](./PAGES.md) للفهرس و`docs/pages/` لملف توثيق لكل صفحة.

---

## src/context/ — سياقات React

9 مزودات لإدارة الحالة. كل سياق منقسم إلى ملفين: `*Context.tsx` (المزوّد) و`*-context-value.ts` (الـ hook والواجهة).

راجع [`CONTEXTS.md`](./CONTEXTS.md) للتفاصيل الكاملة.

---

## src/hooks/ — الخطافات المخصصة

4 خطافات: `useIsMobile`, `useDeviceType`, `useCommandPalette`, `useKeyboardShortcuts`.

راجع [`HOOKS.md`](./HOOKS.md) للتفاصيل.

---

## src/lib/ — الدوال المساعدة

3 ملفات: `utils.ts` (cn, generateId, تنسيق التواريخ), `export-utils.ts` (تصدير Excel), `payment-icons.ts` (أيقونات طرق الدفع).

راجع [`LIB.md`](./LIB.md) للتفاصيل.

---

## src/services/ — طبقة البيانات

مجلد `mock/` يحتوي على 15 ملف بالبيانات الوهمية لكل كيان. مصممة للاستبدال بـ API حقيقي.

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
