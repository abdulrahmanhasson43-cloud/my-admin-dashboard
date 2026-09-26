# الدوال المساعدة (Lib)

يحتوي مجلد `src/lib/` على **3 ملفات** للدوال المساعدة المشتركة عبر التطبيق.

---

## 1. utils.ts — الدوال العامة

**المسار:** `src/lib/utils.ts`

### cn(inputs: ClassValue[]): string

يجمع بين `clsx` (للشروط المنطقية) و`tailwind-merge` (لإزالة تعارضات Tailwind) في دالة واحدة. هذا هو الأساس لكل تنسيق مكونات shadcn/ui.

```typescript
cn('px-2 py-1', isActive && 'bg-primary', 'px-4')
// → 'py-1 bg-primary px-4' (tailwind-merge أزال px-2 المتعارض)
```

### generateId(prefix: string): string

يولّد معرفًا فريدًا بالصيغة `{prefix}-{timestamp}-{random}`. مصمم ليُستدعى من **معالجات الأحداث** (event handlers) وليس أثناء الـ render — لتفادي تحذيرات React Compiler المتعلقة بالنقاء (purity). يضمن عدم تكرار المعرفات حتى لو نُشئ عدة عناصر في نفس المللي ثانية بفضل الجزء العشوائي.

```typescript
const id = generateId('t'); // → 't-1786374743703-j4f2k'
```

### generateNumericId(prefix: string, min: number, max: number): string

يولّد معرفًا تسلسليًا قصيرًا بالصيغة `{PREFIX}-{NNNN}` باستخدام رقم عشوائي ضمن نطاق محدد. مناسب للمعرفات القصيرة سهلة القراءة (الطلبات، المرتجعات). مثل `generateId`، يُستدعى فقط من معالجات الأحداث.

```typescript
const orderId = generateNumericId('ORD', 1000, 9999); // → 'ORD-4823'
```

### formatEnglishDate(raw: string, withTime = true): string

ينسّق تاريخ/وقت الفاتورة بالإنجليزية بشكل مرتب (اسم شهر مختصر، صباحًا/مساءً بالإنجليزية) بدلًا من عرض الـ ISO الخام. يقبل صيغًا مثل `"2025-01-15 14:30"` أو `"2025-01-15"` أو `"15-01-2025"`.

### formatArabicDate(raw: string, withTime = true): string

ينسّق تاريخ/وقت الفاتورة بالعربية (اسم الشهر عربي، صباحًا/مساءً) مع أرقام لاتينية عادية لتتفق مع باقي أرقام الموقع. نفس قبول الصيغ كما في `formatEnglishDate`.

---

## 2. export-utils.ts — تصدير البيانات

**الممسار:** `src/lib/export-utils.ts`

### exportToExcel(rows, fileName, sheetName): void

يصدّر مجموعة بيانات إلى ملف جدول (xlsx). تعمل على الديسكتوب والجوال — تُبنى `Blob` من مصفوفة `ArrayBuffer` وتُستخدم `URL.createObjectURL` + عنصر `<a download>` بدلًا من أي آلية تعتمد على نظام التشغيل.

> الواجهة مستقلة عن Excel — لا تذكر "Excel" في أي مكان مرئي للمستخدم؛ نستخدم "تصدير" فقط.

```typescript
exportToExcel(
  [{ name: 'منتج أ', price: 100 }, { name: 'منتج ب', price: 200 }],
  'تقرير-المنتجات',
  'المنتجات'
);
```

---

## 3. payment-icons.ts — أيقونات طرق الدفع

**المسار:** `src/lib/payment-icons.ts`

### getPaymentIcon(id: string): ComponentType<IconProps>

يحلّ معرّف طريقة دفع إلى مكوّن الأيقونة المناسب. يُرجع `WalletIcon` كاحتياطي للمعرفات غير المعروفة.

```typescript
const Icon = getPaymentIcon('cash'); // → CashIcon
```

> **ملاحظة معمارية:** في `OrdersPage.tsx`، لتفادي تحذير "Cannot create components during render"، استُخدمت خريطة ثابتة `PAYMENT_ICONS` بدلًا من استدعاء هذه الدالة أثناء الـ render. الدالة هنا مناسبة للاستخدام خارج الـ render (مثل خريطة على بيانات ثابتة).
