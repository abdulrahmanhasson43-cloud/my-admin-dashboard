# LowStockAlertsWidget — ودجة تنبيهات المخزون الذكية

> **الملف:** `src/components/LowStockAlertsWidget.tsx` · **السطور:** ~204

## نظرة عامة

ودجة تنبيهات المخزون الذكية (الفكرة #12 من `NEW_IDEAS.md`) هي مكوّن قابل لإعادة الاستخدام يعرض المنتجات منخفضة المخزون مع **توقّع عدد الأيام قبل النفاد** وزر مباشر لإنشاء أمر شراء. تحل محل قسم "مخزون منخفض" الأساسي القديم في لوحة التحكم بنسخة محسّنة وذكية.

تستخدم الودجة بيانات المبيعات المسجّلة في سجل النشاطات (`ActivityLogContext`) لحساب متوسط الاستهلاك اليومي، ثم تتنبأ بتاريخ النفاد لكل منتج. تُصنّف المنتجات إلى ثلاث مستويات خطورة: حرج (نفد المخزون)، عاجل (النصف الأدنى من الحد)، تحذير (أقل من الحد).

## التصدير

| الاسم | النوع | الوصف |
|-------|------|-------|
| `LowStockAlertsWidget` | `React.FC` (default export) | المكوّن الرئيسي للودجة |

### الخصائص (Props)

| الخاصية | النوع | الافتراضي | الوصف |
|---------|------|-----------|-------|
| `maxItems` | `number` | `5` | الحد الأقصى لعدد المنتجات المعروضة |

## السياقات المستخدمة

| السياق | الـ Hook | البيانات المستخدمة |
|--------|---------|-------------------|
| `ProductsContext` | `useProducts` | `products` — قائمة المنتجات لفلترة المخزون المنخفض |
| `AppSettingsContext` | `useAppSettings` | `lowStockThreshold` — حد المخزون المنخفض (افتراضي 10) |
| `ActivityLogContext` | `useActivityLog` | `activities` — حساب متوسط المبيعات اليومية من أنشطة `sale` |

## المكوّنات/الأيقونات المستخدمة

- `motion` من `framer-motion` — أنيميشن دخول تدريجي للعناصر
- `AlertTriangleIcon`, `ArrowLeftIcon`, `PackageIcon`, `TrendingDownIcon`, `ShoppingCartIcon` — من مكتبة الأيقونات المخصّصة

## المنطق الحسابي

### متوسط المبيعات اليومية (`avgDailySales`)

يُحسب عبر `useMemo` من أنشطة نوع `sale` في سجل النشاطات: يقسم عدد أنشطة البيع على عدد الأيام الفريدة (المستخرجة من حقل `timestamp`). هذا يتبع قاعدة React Compiler بعدم استخدام `useEffect` + `setState` للقيم المشتقّة.

### تصنيف الخطورة (`severity`)

| المستوى | الشرط | اللون | التسمية |
|---------|-------|-------|---------|
| `critical` | `storeStock === 0` | `--vuno-danger` | نفد المخزون |
| `urgent` | `storeStock <= threshold / 2` | `--vuno-warning` | عاجل |
| `warning` | `storeStock < threshold` | `--vuno-primary` | منخفض |

### الأيام المتوقعة قبل النفاد (`daysToStockout`)

`Math.ceil(storeStock / avgDailySales)` — يكون `null` إذا لم تتوفر بيانات مبيعات كافية.

## الحالة الفارغة

عند عدم وجود منتجات منخفضة المخزون، تعرض الودجة رسالة نجاح بأيقونة `PackageIcon` وخلفية خضراء (`--vuno-success`) بدلاً من قائمة فارغة.

## التوجيه (Navigation)

- زر "عرض الكل" في الرأس → `navigate('/inventory')`
- زر "أمر شراء" لكل منتج → `navigate('/purchase-orders')`
- زر "إنشاء أمر شراء شامل" في التذييل → `navigate('/purchase-orders')`

## ملاحظات للمطوّر

- **React Compiler:** جميع القيم المشتقّة (`avgDailySales`, `lowStockItems`) محسوبة عبر `useMemo` — لا توجد `useEffect` + `setState`.
- **RTL:** الأرقام والمخزون تستخدم `dir="ltr"` و `tabular-nums` لمحاذاة صحيحة.
- **التصميم:** يستخدم متغيّرات CSS `--vuno-*` وفئة `card-vuno` و `color-mix()` للألوان الشفافة.
- **إعادة الاستخدام:** يمكن استخدامها في أي صفحة تحتاج تنبيهات مخزون (لوحة التحكم، المخزون، الفروع) عبر `<LowStockAlertsWidget maxItems={N} />`.

## المستهلكون

| الملف | الاستخدام |
|------|-----------|
| `src/pages/DashboardPage.tsx` | مدمجة في لوحة التحكم بدلاً من قسم المخزون المنخفض الأساسي القديم |

## روابط ذات صلة

- [لوحة التحكم](pages/DashboardPage.md)
- [صفحة المخزون](pages/InventoryPage.md)
- [أوامر الشراء](pages/PurchaseOrdersPage.md)
- [السياقات](../CONTEXTS.md)
- [نظام التصميم](../DESIGN-SYSTEM.md)
- [NEW_IDEAS.md](../../NEW_IDEAS.md) — الفكرة #12
