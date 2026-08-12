# نظام التصميم (Design System)

يصف هذا الملف نظام التصميم في فونو: لوحة الألوان، الخطوط، التباعد، المكونات الأساسية، وكيفية الاستخدام الصحيح.

---

## 1. الأساس — متغيرات CSS المخصصة

نظام التصميم مبني على **متغيرات CSS** المعرفة في `src/index.css` تحت بادئة `--vuno-*`. هذا النهج يفصل قيم التصميم عن الكود ويسمح بتبديل الثيم بسهولة.

### المتغيرات الأساسية

```css
:root {
  --vuno-primary:           /* اللون الأساسي (أزرق فونو) */
  --vuno-primary-foreground:/* لون النص فوق الأساسي */
  --vuno-secondary:         /* اللون الثانوي */
  --vuno-background:        /* خلفية التطبيق */
  --vuno-foreground:        /* لون النص الأساسي */
  --vuno-card:              /* خلفية البطاقات */
  --vuno-card-foreground:   /* لون النص داخل البطاقات */
  --vuno-muted:             /* خلفية العناصر الخافتة */
  --vuno-muted-foreground:  /* لون النص الخافت */
  --vuno-border:            /* لون الحدود */
  --vuno-input:             /* لون حقول الإدخال */
  --vuno-ring:              /* لون حلقة التركيز */
  --vuno-accent:            /* لون التمييز */
  --vuno-destructive:       /* لون الأخطاء/الحذف */
  --vuno-success:           /* لون النجاح */
  --vuno-warning:           /* لون التحذير */
  --vuno-radius:            /* نصف قطر الزوايا */
}

.dark {
  /* تجاوز كل القيم أعلاه للوضع الليلي */
}
```

### الاستخدام في المكونات

```tsx
// في Tailwind classes (الطريقة المفضلة):
<div className="bg-[var(--vuno-card)] text-[var(--vuno-foreground)] border-[var(--vuno-border)]" />

// في CSS المباشر:
style={{ backgroundColor: 'var(--vuno-primary)' }}
```

> **القاعدة:** لا تستخدم ألوانًا صلبة (مثل `#3b82f6` أو `bg-blue-500`) في مكونات التطبيق. استخدم دائمًا `var(--vuno-*)` ليبقى التطبيق متوافقًا مع تبديل الثيم.

---

## 2. الثيمات (Themes)

يدعم التطبيق وضعين: **نهاري (light)** و**ليلي (dark)**. التبديل عبر `ThemeContext` (الـ hook `useTheme()`).

عند التبديل، يُضاف/يُزال الصنف `dark` من عنصر `<html>`:

```html
<html class="dark">  <!-- الوضع الليلي -->
<html>               <!-- الوضع النهاري (افتراضي) -->
```

CSS يتعامل مع الباقي عبر `.dark { --vuno-...: ...; }`.

---

## 3. الخطوط

- الخط الأساسي: خط النظام الافتراضي (system-ui) مع دعم العربية.
- الأرقام والهواتف: LTR عبر `dir="ltr"`.
- أحجام الخطوط تتبع نظام Tailwind (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, إلخ).

---

## 4. التباعد والمسافات

يتبع المشروع نظام التباعد في Tailwind (`p-4`, `m-2`, `gap-3`, إلخ). لا توجد متغيرات تباعد مخصصة — Tailwind كافٍ.

القيم الشائعة:
- حشو البطاقات: `p-4` أو `p-6`
- الفجوات في القوائم: `gap-2` أو `gap-3`
- هوامش الأقسام: `mb-4` أو `mb-6`

---

## 5. نصف قطر الزوايا

مُعرّف عبر `--vuno-radius` ويُطبّق على البطاقات والأزرار. مكونات shadcn/ui تستخدم قيم Tailwind (`rounded-md`, `rounded-lg`, `rounded-full`).

---

## 6. مكونات shadcn/ui

المشروع يستخدم **40+ مكوّن** من shadcn/ui في `src/components/ui/`. هذه المكونات:

- مبنية على **Radix UI** للوصولية (Accessibility) وسلوك التفاعل.
- منسّقة بـ **Tailwind CSS** و`class-variance-authority` للأنماط (Variants).
- الكود الكامل موجود داخل المشروع (قابل للتعديل بالكامل، وليس حزمة npm).

أهم المكونات المستخدمة بكثرة:

| المكوّن | الغرض |
|--------|------|
| `Button` | الأزرار (variants: default, destructive, outline, secondary, ghost, link) |
| `Input` / `Textarea` | حقول الإدخال |
| `Select` | القوائم المنسدلة |
| `Dialog` / `Sheet` / `Drawer` | النوافذ المنبثقة واللوحات الجانبية |
| `Table` | الجداول |
| `Tabs` | التبويبات |
| `Card` (عبر SectionCard) | البطاقات |
| `Badge` | الشارات (variants في `badge-variants.ts`) |
| `Toast` (Sonner) | رسائل الإشعار المؤقتة |
| `Command` (cmdk) | لوحة الأوامر |
| `Calendar` / `DatePicker` | التقويم |
| `Chart` (Recharts wrapper) | الرسوم البيانية |
| `DropdownMenu` / `ContextMenu` | القوائم |
| `Switch` / `Checkbox` / `RadioGroup` | عناصر التحديد |
| `Progress` | أشرطة التقدم |
| `Skeleton` | مؤشرات التحميل |
| `ScrollArea` | مناطق التمرير المخصصة |
| `Tooltip` | تلميحات الأدوات |

### ملفات الـ Variants

بعض المكونات لها ملفات variants منفصلة للأنماط:
- `button-variants.ts` — أنماط الأزرار
- `badge-variants.ts` — أنماط الشارات
- `toggle-variants.ts` — أنماط المفاتيح
- `button-group-variants.ts` — أنماط مجموعات الأزرار
- `navigation-menu-variants.ts` — أنماط قوائم التنقل

### ملفات الـ Context الداخلية

بعض مكونات shadcn/ui تستخدم Context داخليًا في ملفات منفصلة لذات السبب (فصل الـ hook عن المكوّن):
- `form-context.ts`
- `sidebar-context.ts`

---

## 7. الأيقونات المخصصة

مكتبة الأيقونات في `src/components/icons/index.tsx` تحتوي على **أيقونات SVG مخصصة** لكل قسم في التطبيق. كل أيقونة مكوّن React يقبل `props` قياسية (`className`, `size`, إلخ).

```tsx
import { HomeIcon, POSIcon, ProductsIcon } from '@/components/icons';

<HomeIcon className="w-5 h-5" />
```

> **لا تستخدم** `lucide-react` في مكونات التطبيق رغم وجوده في الـ dependencies. استخدم دائمًا الأيقونات من `@/components/icons`.

---

## 8. الحركات (Animations)

تُستخدم **Framer Motion** للحركات في بعض الصفحات (انتقالات، ظهور/اختفاء). كما تُستخدم أنيميشن CSS عبر Tailwind (`animate-spin`, `animate-pulse`) و`tailwindcss-animate` و`tw-animate-css` للحركات البسيطة.

---

## 9. الاستجابة (Responsiveness)

التطبيق متجاوب بالكامل عبر نقاط التوقف (breakpoints) في Tailwind:

- **الجوال** (`default`): شريط تنقل سفلي (BottomNav)، تخطيط عمودي.
- **التابلت** (`md`): شريط جانبي مصغّر.
- **الحاسوب** (`lg`+): شريط جانبي كامل (Sidebar)، تخطيط متعدد الأعمدة.

اكتشاف نوع الجهاز عبر `useDeviceType()` hook الذي يُرجع `'mobile'` أو `'tablet'` أو `'desktop'`.

---

## 10. دعم الطباعة (Print)

مكوّن `ThermalReceipt` يدعم تحويل الفاتورة إلى صورة عبر `html-to-image` ثم مشاركتها أو طباعتها. خصائص الطباعة مضبوطة في CSS للفاتورة لتبدو صحيحة عند الطباعة على طابعة حرارية.
