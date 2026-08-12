# البنية المعمارية (Architecture)

يصف هذا الملف البنية المعمارية لمشروع فونو، الأنماط التصميمية المتبعة، تدفق البيانات، والقرارات التقنية الرئيسية.

---

## 1. النمط العام

فونو تطبيق صفحة واحدة (Single Page Application) مبني بـ **React 19 + Vite**. التوجيه يتم عبر **React Router DOM v7** بنمط `BrowserRouter`. كل صفحة تُحمّل كسولًا (lazy import) لتفعيل تقسيم الكود (Code Splitting)، مما يعني أن المستخدم يُحمّل فقط كود الصفحة التي يزورها، وليس كل التطبيق دفعة واحدة.

البنية تتبع نمط **Feature-Based within Layered Architecture** — أي أن الكود منظم في طبقات واضحة (مكونات، صفحات، سياقات، خدمات، أنواع) لكن داخل كل طبقة يكون التنظيم حسب الكيان (Product, Order, Client...).

---

## 2. الطبقات

```
┌─────────────────────────────────────────────┐
│  Pages (src/pages/)                         │  طبقة العرض — كل صفحة مكتفية
│  24 صفحة، كل واحدة lazy-loaded             │  ذاتيًا، تستهلك سياقات ومكتبات UI
├─────────────────────────────────────────────┤
│  Components (src/components/)               │  طبقة المكونات المشتركة
│  ├── ui/  (shadcn/ui, 40+ مكوّن)            │  + مكتبة shadcn/ui القابلة لإعادة الاستخدام
│  ├── icons/ (أيقونات SVG مخصصة)             │  + أيقونات مخصصة
│  └── (15+ مكوّن مشترك)                      │
├─────────────────────────────────────────────┤
│  Context (src/context/)                     │  طبقة إدارة الحالة
│  9 مزودات React Context                     │  لا Redux — Context API فقط
├─────────────────────────────────────────────┤
│  Services (src/services/mock/)              │  طبقة البيانات
│  بيانات وهمية لكل كيان                       │  قابلة للاستبدال بـ API حقيقي
├─────────────────────────────────────────────┤
│  Types (src/types/)                         │  طبقة الأنواع
│  15 ملف تعريفات TypeScript                   │  مصدر الحقيقة لهياكل البيانات
├─────────────────────────────────────────────┤
│  Lib / Hooks / Constants                    │  طبقة المساعدات
│  دوال مساعدة، خطافات، ثوابت                  │
└─────────────────────────────────────────────┘
```

---

## 3. تدفق البيانات

تدفق البيانات في فونو أحادي الاتجاه (Unidirectional)، كما هو متوقع في React:

```
[Mock Services] → (تُهيّئ البيانات الأولية)
      ↓
[Context Providers] → (تحتفظ بالحالة في React state + localStorage)
      ↓
[useXxx() hooks] → (تُستهلك في الصفحات والمكونات)
      ↓
[Pages/Components] → (تعرض البيانات وتستدعي دوال التحديث)
      ↓
[Context setters] → (تحدّث الحالة → إعادة الـ render)
      ↓
[localStorage] → (يُحفظ تلقائيًا عند التغيير)
```

**مثال على تدفق بيع في نقطة البيع:**

1. المستخدم يضيف منتجات للسلة ويدفع في `POSPage`.
2. `POSPage` يستدعي `sellProducts(items)` من `useProducts()`.
3. `ProductsProvider` يحدّث `products` (يخصم الكميات) ويحفظ في `localStorage`.
4. في نفس الوقت، `POSPage` يستدعي `addAchieved(total)` من `useSalesGoal()` لتحديث هدف المبيعات.
5. و`recordSale(total)` من `useShift()` لتسجيل المبيعة في الوردية الحالية.
6. و`logActivity('sale', ...)` من `useActivityLog()` لتسجيل النشاط.
7. تُعاد رسم الصفحات التي تستهلك هذه السياقات فورًا.

هذا يوضح كيف تتناسق عدة سياقات معًا لتنفيذ عملية واحدة.

---

## 4. الأنماط التصميمية الرئيسية

### 4.1 التحميل الكسول (Lazy Loading)

كل صفحة في `App.tsx` مُعرّفة كـ `lazy(() => import(...))`. مع `Suspense` و`fallback` يعرض مؤشر تحميل دوار. هذا يحل مشكلة بطء التحميل الأولي ويجعل التطبيق سريع الاستجابة.

### 4.2 تقسيم الكود اليدوي (Manual Code Splitting)

في `vite.config.ts`، المكتبات الثقيلة مقسّمة إلى chunks منفصلة:

- `vendor-react` — react, react-dom, react-router-dom (يُحمّل أولًا)
- `vendor-charts` — recharts (يُحمّل فقط عند فتح صفحة بها رسوم)
- `vendor-motion` — framer-motion (يُحمّل فقط عند الحاجة للحركات)

### 4.3 مسار الـ Alias `@/`

معرّف في `vite.config.ts` و`tsconfig.json`:

```typescript
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
```

كل الاستيرادات تستخدم `@/` بدلًا من المسارات النسبية (`../../`)، مما يجعل الكود أنظف وأسهل في إعادة التنظيم.

### 4.4 السياق المنقسم (Split Context Pattern)

كما هو موضح بالتفصيل في [`CONTEXTS.md`](./CONTEXTS.md)، كل سياق منقسم إلى ملفين لفصل الـ hook عن المكوّن المزوّد.

### 4.5 الخدمات الوهمية (Mock Services)

طبقة `src/services/mock/` تحتوي على ملف لكل كيان يُصدّر بيانات أولية (`sampleXxx`) وأحيانًا دوال محاكاة لـ API. البنية مصممة بحيث استبدالها بـ API حقيقي يتطلب تغيير هذه الطبقة فقط دون لمس المكونات.

### 4.6 السحب والإفلات الأصلي (Native Drag & Drop)

يستخدم المشروع **HTML5 Drag & Drop API** الأصلي (لا مكتبة خارجية مثل dnd-kit) في:
- لوحة كانبان الطلبات (`OrdersPage.tsx`)
- نقل المخزون بين المستودع والمتجر (`InventoryPage.tsx`)

هذا يقلل حجم الحزم (bundle size) ويحافظ على البساطة.

### 4.7 توليد المعرفات النقي (Pure ID Generation)

بسبب قاعدة `react-hooks/purity` في React Compiler، لا يمكن استدعاء `Math.random()` أو `Date.now()` أثناء الـ render. الحل هو الدوال المساعدة في `src/lib/utils.ts`:

- `generateId(prefix)` — يولّد معرفًا فريدًا `{prefix}-{timestamp}-{random}`
- `generateNumericId(prefix, min, max)` — يولّد معرفًا رقميًا في نطاق

تُستدعى هذه من معالجات الأحداث (event handlers) أو الـ lazy initializers، وليس من جسم المكوّن أو `useMemo`.

### 4.8 الخرائط الثابتة للمكونات (Static Component Maps)

بدلًا من دالة تُعيد مكوّنًا أثناء الـ render (مثل `getIcon(type)`)، تُستخدم خرائط ثابتة:

```typescript
const PAYMENT_ICONS: Record<PaymentMethod, IconType> = {
  cash: CashIcon, card: CardIcon, wallet: WalletIcon, instapay: InstaPayIcon,
};
const Icon = PAYMENT_ICONS[method]; // بحث في الخريطة بدلًا من استدعاء دالة
```

هذا يتجنب تحذير "Cannot create components during render" ويكون أسرع.

### 4.9 القيم المشتقة بدلًا من التأثيرات (Derived Values over Effects)

بدلًا من `useEffect` + `setState` لمزامنة حالة مشتقة، يُفضّل `useMemo`:

```typescript
// ❌ خطأ (set-state-in-effect):
useEffect(() => { if (condition) setSelected(x); }, [dep]);

// ✅ صحيح (derived):
const effectiveValue = useMemo(() => condition ? x : selected, [dep, selected]);
```

---

## 5. دعم RTL والعربية

التطبيق عربي بالكامل من اليمين لليسار. في `index.html`:

```html
<html lang="ar" dir="rtl">
```

عناصر تحتاج اتجاه LTR (مثل الأرقام، الهواتف، الباركود) تُلف بـ:

```tsx
<span dir="ltr">{phoneNumber}</span>
```

أسماء الأشهر والأرقام تُنسّق عبر `toLocaleString('ar-EG')`.

---

## 6. الاستمرارية (Persistence)

عدة سياقات تُحفظ حالتها في `localStorage` لتبقى بعد تحديث الصفحة:

| المفتاح | السياق | المحتوى |
|--------|--------|---------|
| `vuno-theme` | ThemeContext | الثيم الحالي |
| `vuno-active-branch-id` | BranchContext | الفرع النشط |
| `vuno_activity_log` | ActivityLogContext | سجل الأنشطة (حد 200) |
| `vuno_held_orders` | HeldOrdersContext | الطلبات المعلقة |
| `vuno_onboarding_done` | OnboardingWizard | هل اكتملت التهيئة |

---

## 7. القرارات التقنية ومبرراتها

**لماذا Context API وليس Redux؟** المشروع متوسط الحجم، والحالة متماسكة حول كيانات واضحة. Context API يكفي ويُجنّبنا تعقيد Redux وحجمه. لو نما المشروع بكثرة، يمكن الترقية إلى Zustand (خفيف) أو Redux Toolkit.

**لماذا shadcn/ui وليس Material UI؟** shadcn/ui يعطي الكود الكامل للمكونات داخل المشروع (قابل للتعديل بالكامل)، أنماطه قائمة على Tailwind (متوافق مع نظامنا)، وحجمه أصغر لأنك تستورد فقط ما تحتاجه.

**لماذا أيقونات مخصصة وليس lucide-react؟** للحفاظ على اتساق بصري تام مع هوية فونو والتحكم في كل تفصيل. lucide-react موجود في الـ dependencies لكنه غير مستخدم في الواجهة.

**لماذا HTML5 DnD وليس dnd-kit؟** تقليل الحجم والتعقيد. لو احتجنا ميزات متقدمة (تعدد الأعمدة، إلغاء، حركات) يمكن الترقية.

**لماذا البيانات الوهمية؟** للتطوير والعرض التوضيحي السريع. البنية تسمح بالاستبدال السهل بطبقة API حقيقية.
