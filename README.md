# فونو (Vuno) — نظام إدارة المتاجر ونقاط البيع

<div align="center">

**تطبيق متجر متكامل بواجهة عربية (RTL) لإدارة نقاط البيع، المخزون، الفواتير، الطلبات، العملاء، الموردين، المصروفات، التقارير والمزيد.**

مبني بـ React 19 + TypeScript + Vite — تصميم احترافي، أداء عالٍ، وتجربة مستخدم سلسة على الجوال والحاسوب.

</div>

---

## فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المميزات الرئيسية](#المميزات-الرئيسية)
3. [التقنيات المستخدمة](#التقنيات-المستخدمة)
4. [هيكل المشروع](#هيكل-المشروع)
5. [التشغيل المحلي](#التشغيل-الملي)
6. [البناء والإنتاج](#البناء-والنتاج)
7. [البرامج النصية (Scripts)](#البرامج-النصية-scripts)
8. [إعدادات ESLint و React Compiler](#إعدادات-eslint-و-react-compiler)
9. [إدارة الحالة (State Management)](#إدارة-الحالة-state-management)
10. [نظام التصميم (Design System)](#نظام-التصميم-design-system)
11. [الصفحات والمسارات](#الصفحات-والمسارات)
12. [المكونات المشتركة](#المكونات-المشتركة)
13. [اختصارات لوحة المفاتيح](#اختصارات-لوحة-المفاتيح)
14. [الوثائق التفصيلية](#الوثائق-التفصيلية)
15. [دليل المطور الجديد](#دليل-المطور-الجديد)

---

## نظرة عامة

**فونو (Vuno)** هو نظام إدارة متاجر ونقاط بيع (POS) مصمم خصيصًا للسوق العربي. يوفر واجهة عربية كاملة من اليمين إلى اليسار (RTL)، مع دعم للأرقام والهواتف بنظام LTR حيثما يلزم. يغطي النظام كامل دورة عمل المتجر بدءًا من نقطة البيع مرورًا بإدارة المنتجات والمخزون، وصولًا إلى الفواتير والطلبات والمرتجعات والتقارير المالية.

النظام مبني كتطبيق صفحة واحدة (SPA) باستخدام React 19 مع التحميل الكسول (Lazy Loading) لكل صفحة، مما يضمن أداءً عاليًا وسرعة استجابة فورية. لا يعتمد المشروع على Redux أو مكتبات إدارة حالة خارجية، بل يستخدم React Context API بشكل منظم ومتقن لتوزيع الحالة عبر التطبيق. الطبقة البيانية مستندة إلى مكتبة shadcn/ui المبنية فوق Radix UI مع تنسيقات Tailwind CSS، ونظام تصميم مخصص عبر متغيرات CSS (`--vuno-*`).

> **ملاحظة:** المشروع يستخدم بيانات وهمية (Mock Data) في طبقة `src/services/mock/` لتسهيل التطوير والعرض التوضيحي. البنية مصممة بحيث يمكن استبدالها لاحقًا بواجهة برمجية (API) حقيقية دون تغيير مكونات الواجهة.

---

## المميزات الرئيسية

نقطة البيع (POS) تفاعلية مع دعم الباركود والماسح الضوئي، اختيار المنتجات بالبحث أو بالتصفح حسب الفئات، إدارة سلة المشتريات مع خصومات وضريبة، ودعم طرق دفع متعددة (نقدي، بطاقة، محفظة إلكترونية، إنستا باي). كذلك يمكن إصدار فاتورة حرارية (Thermal Receipt) قابلة للمشاركة والطباعة كصورة.

إدارة المنتجات الكاملة مع الفئات، الأسعار، الأكواد (SKU/Barcode)، الصور، وحدود المخزون. نظام مخزون يعرض الكميات المتاحة، المسحوبات، والمخزون المؤجل مع تنبيهات انخفاض المخزون، ودعم نقل المخزون بين الفروع عبر السحب والإفلات (Drag & Drop).

نظام الفواتير مع بناء فاتورة احترافية، فاتورة ضريبية إلكترونية، ومرتجعات المبيعات. إدارة الطلبات بنظام لوحة كانبان (Kanban Board) قابلة للسحب والإفلات بين الحالات (جديد، قيد التنفيذ، مكتمل، ملغى) مع خط زمني لكل طلب.

إدارة العملاء مع الخط الزمني للتعاملات، الموردين وأوامر الشراء، والفروع المتعددة. إدارة المصروفات بعرض تقويمي يومي/شهري مع إحصائيات. نظام تقارير ورسوم بيانية تفاعلية عبر Recharts (مبيعات، أرباح، أكثر المنتجات مبيعًا، أداء الفروع).

لوحة معلومات (Dashboard) مع بطاقات إحصائية، أهداف مبيعات تفاعلية (Sales Goal Widget)، وإجراءات سريعة. مساعد ذكي (AI Assistant) تجريبي يجيب عن أسئلة المتجر. نظام إشعارات ومركز إشعارات داخل التطبيق. لوحة أوامر (Command Palette) قابلة للبحث بالضغط على Ctrl+K / Cmd+K للوصول السريع لكل الصفحات والإجراءات.

إدارة الورديات (Shifts) مع تتبع بداية/نهاية الوردية والمبيعات. سجل الأنشطة (Activity Log) لتتبع كل العمليات. نظام إعدادات شامل بصري (لوحة ألوان، طرق دفع، معلومات المتجر، النسخ الاحتياطي). معالج تهيئة (Onboarding Wizard) للمستخدم الجديد. دعم كامل للوضع الليلي/النهاري (Dark/Light Theme). تصميم متجاوب بالكامل (Responsive) للجوال والتابلت والحاسوب مع شريط تنقل سفلي للجوال.

---

## التقنيات المستخدمة

| الفئة | التقنية | الإصدار |
|------|---------|---------|
| إطار العمل | React | 19.2 |
| اللغة | TypeScript | ~5.9 |
| أداة البناء | Vite | 7.2 |
| التنسيقات | Tailwind CSS | 3.4.19 |
| مكتبة الواجهة | shadcn/ui (Radix UI) | 40+ مكوّن |
| التوجيه | React Router DOM | 7.18 |
| الحركات | Framer Motion | 12.42 |
| الرسوم البيانية | Recharts | 2.15 |
| الإشعارات | Sonner | 2.0 |
| لوحة الأوامر | cmdk | 1.1 |
| النماذج | React Hook Form + Zod | 7.70 / 4.3 |
| الباركود | BarcodeDetector API | native |
| رموز QR | qrcode.react | 4.2 |
| التصدير | xlsx (SheetJS) | 0.18 |
| الصورة إلى نص | html-to-image | 1.11 |
| التاريخ | date-fns | 4.1 |

> **الأيقونات:** يستخدم المشروع مكتبة أيقونات SVG مخصصة في `src/components/icons/index.tsx` بدلًا من `lucide-react` (رغم وجوده في الـ dependencies) للحفاظ على اتساق بصري وتحكم كامل في الأنماط.

---

## هيكل المشروع

```
vuno-app/
├── public/                  # الأصول الثابتة (أيقونات، صور)
├── src/
│   ├── components/          # المكونات المشتركة
│   │   ├── ui/             #   مكتبة shadcn/ui (40+ مكوّن)
│   │   ├── icons/          #   مكتبة الأيقونات المخصصة (SVG)
│   │   ├── AppLayout.tsx          # التخطيط الرئيسي (Sidebar + TopBar + BottomNav)
│   │   ├── CommandPalette.tsx     # لوحة الأوامر (Ctrl+K)
│   │   ├── OnboardingWizard.tsx   # معالج التهيئة للمستخدم الجديد
│   │   ├── NotificationCenter.tsx # مركز الإشعارات
│   │   ├── ProductFormModal.tsx   # نموذج إضافة/تعديل منتج
│   │   ├── BarcodeScannerModal.tsx# نافذة مسح الباركود
│   │   ├── QRCodeButton.tsx       # زر توليد QR
│   │   ├── SalesGoalWidget.tsx    # ودجت أهداف المبيعات
│   │   ├── SearchBar.tsx          # شريط البحث
│   │   ├── ThermalReceipt.tsx     # الفاتورة الحرارية (صورة قابلة للمشاركة)
│   │   ├── SectionCard.tsx        # بطاقة قسم قابلة للطي
│   │   ├── StatsRow.tsx           # صف الإحصائيات
│   │   ├── Field.tsx              # حقل نموذج مع تسمية
│   │   ├── DataBackupSection.tsx  # قسم النسخ الاحتياطي
│   │   └── ...
│   ├── context/            # مزودات React Context (9 مزودات)
│   │   ├── ProductsContext.tsx          # حالة المنتجات والفئات
│   │   ├── AppSettingsContext.tsx       # إعدادات التطبيق العامة
│   │   ├── NotificationsContext.tsx     # الإشعارات
│   │   ├── ActivityLogContext.tsx       # سجل الأنشطة
│   │   ├── SalesGoalContext.tsx         # أهداف المبيعات
│   │   ├── ShiftContext.tsx             # الورديات
│   │   ├── HeldOrdersContext.tsx        # الطلبات المعلقة
│   │   ├── ThemeContext.tsx             # الثيم (ليلي/نهاري)
│   │   ├── BranchContext.tsx            # الفروع
│   │   └── *-context-value.ts           # ملفات الـ hooks لكل سياق
│   ├── pages/              # صفحات التطبيق (24 صفحة)
│   ├── hooks/              # الخطافات المخصصة (4 خطافات)
│   ├── lib/                # الدوال المساعدة
│   │   ├── utils.ts              # cn(), generateId(), تنسيق التواريخ والأرقام
│   │   ├── export-utils.ts       # تصدير CSV/Excel
│   │   └── payment-icons.ts      # أيقونات طرق الدفع
│   ├── services/           # طبقة البيانات
│   │   └── mock/           #   بيانات وهمية لكل كيان
│   ├── types/              # تعريفات أنواع TypeScript (15 ملف)
│   ├── constants/          # الثوابت (التنقل، إجراءات اللوحة، أقسام الإعدادات)
│   ├── App.tsx             # المكون الجذري + التوجيه + المزودات
│   ├── main.tsx            # نقطة الدخول
│   └── index.css           # نظام التصميم (متغيرات --vuno-*)
├── docs/                   # الوثائق التفصيلية (راجع قسم الوثائق)
├── index.html              # قالب HTML الجذري (dir="rtl")
├── vite.config.ts          # إعدادات Vite (الـ alias @/, التحميل المجزأ)
├── tailwind.config.js      # إعدادات Tailwind
├── tsconfig.json           # إعدادات TypeScript
├── eslint.config.js        # إعدادات ESLint (React Compiler strict)
└── package.json            # الـ dependencies والـ scripts
```

---

## التشغيل المحلي

### المتطلبات

- Node.js 20.x أو أحدث
- npm (يأتي مع Node.js)

### الخطوات

```bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل خادم التطوير
npm run dev
```

سيعمل التطبيق على المنفذ `3000` (حسب إعداد `vite.config.ts`). افتح المتصفح على العنوان الذي يظهر في الطرفية (عادةً `http://localhost:3000`).

---

## البناء والإنتاج

```bash
# بناء نسخة الإنتاج
npm run build

# معاينة نسخة الإنتاج محليًا
npm run preview
```

نظام البناء في Vite مجزأ (Code Splitting) يدويًا: React وموجّهه في `vendor-react`، مكتبة الرسوم في `vendor-charts`، ومكتبة الحركات في `vendor-motion`، لضمان تحميل سريع للصفحة الأولى وتأجيل المكتبات الثقيلة حتى الحاجة إليها.

---

## البرامج النصية (Scripts)

| الأمر | الوصف |
|------|------|
| `npm run dev` | تشغيل خادم التطوير (Vite) على المنفذ 3000 |
| `npm run build` | فحص الأنواع (`tsc -b`) ثم بناء الإنتاج (`vite build`) |
| `npm run lint` | فحص الكود بـ ESLint |
| `npm run preview` | معاينة نسخة الإنتاج بعد البناء |

---

## إعدادات ESLint و React Compiler

المشروع يستخدم إعدادات ESLint صارمة مع قواعد **React Compiler** التي تفرض نقاء الـ hooks:

- `react-hooks/purity` — يمنع استدعاء دوال غير نقية (مثل `Math.random()`, `Date.now()`) أثناء الـ render أو في `useMemo`/`useRef` بدون مُهيّئ كسول (lazy initializer).
- `react-hooks/set-state-in-effect` — يمنع استدعاء `setState` داخل `useEffect` بشكل تزامني (synchronous).
- `react-refresh/only-export-components` — يضمن أن ملفات المكوّنات لا تصدّر سوى المكوّنات (مع استثناءات موثقة عبر `// eslint-disable-next-line`).

> **النمط المتبع:** لتوليد المعرفات الفريدة أثناء الـ render أو في معالجات الأحداث، استخدم الدوال المساعدة `generateId()` و `generateNumericId()` من `src/lib/utils.ts` بدلًا من `Math.random()` / `Date.now()` مباشرةً، لأن الأخيرة تُفعّل تحذيرات النقاء. للحصول على طابع زمني ثابت عند تحميل المكوّن، استخدم النمط `const [mountTime] = useState(() => Date.now())`.

---

## إدارة الحالة (State Management)

يستخدم المشروع **React Context API** حصرًا (لا Redux). هناك 9 مزودات متداخلة في `App.tsx` بالترتيب التالي:

```
ThemeProvider
  └─ BranchProvider
      └─ AppSettingsProvider
          └─ NotificationsProvider
              └─ ActivityLogProvider
                  └─ ProductsProvider
                      └─ SalesGoalProvider
                          └─ ShiftProvider
                              └─ HeldOrdersProvider
```

**النمط المعماري للسياقات:** كل سياق منقسم إلى ملفين:

1. `Xxx-context-value.ts` — يحتوي على الـ hook `useXxx()` وواجهة القيمة `XxxContextValue`. هذا الملف يُصدّر hook فقط (لا مكوّنات)، مما يرضي قاعدة `react-refresh/only-export-components`.
2. `XxxContext.tsx` — يحتوي على المكوّن `XxxProvider` وإنشاء كائن `createContext`.

هذا الفصل يفصل منطق الاستهلاك (hook) عن منطق التزويد (provider) ويبقي ESLint راضيًا. للحصول على التفاصيل الكاملة لكل سياق، راجع [`docs/CONTEXTS.md`](docs/CONTEXTS.md).

---

## نظام التصميم (Design System)

نظام التصميم مبني على **متغيرات CSS المخصصة** المعرفة في `src/index.css` تحت البادئة `--vuno-*`. هذا يسمح بتبديل الثيم (ليلي/نهاري) بمجرد تغيير القيم على عنصر الجذر.

```css
:root {
  --vuno-primary: #...;     /* اللون الأساسي */
  --vuno-background: #...;  /* خلفية التطبيق */
  --vuno-card: #...;        /* خلفية البطاقات */
  --vuno-foreground: #...;  /* لون النص */
  /* ... المزيد */
}

.dark {
  /* تجاوز القيم للوضع الليلي */
}
```

الاستخدام في المكونات يكون عبر `var(--vuno-*)` في Tailwind classes أو CSS مباشرة، مثل:

```tsx
<div className="bg-[var(--vuno-card)] text-[var(--vuno-foreground)]" />
```

لتفاصيل كاملة عن لوحة الألوان، التباعد، الخطوط، وأنماط المكونات، راجع [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).

---

## الصفحات والمسارات

التطبيق يحتوي على **26 صفحة**، جميعها تُحمّل كسولًا (lazy) لتحسين الأداء:

| المسار | الصفحة | الوصف |
|--------|--------|------|
| `/` | LandingPage | صفحة الهبوط/الترحيب |
| `/login` | LoginPage | تسجيل الدخول |
| `/dashboard` | DashboardPage | لوحة المعلومات الرئيسية |
| `/pos` | POSPage | نقطة البيع |
| `/products` | ProductsPage | إدارة المنتجات |
| `/inventory` | InventoryPage | إدارة المخزون |
| `/invoices` | InvoicePage | الفواتير |
| `/orders` | OrdersPage | الطلبات (Kanban) |
| `/returns` | ReturnsPage | المرتجعات |
| `/profile` | ProfilePage | الملف الشخصي |
| `/clients` | ClientsPage | العملاء |
| `/categories` | CategoriesPage | الفئات |
| `/suppliers` | SuppliersPage | الموردون |
| `/purchase-orders` | PurchaseOrdersPage | أوامر الشراء |
| `/branches` | BranchesPage | الفروع |
| `/settings` | SettingsPage | الإعدادات |
| `/reports` | ReportsPage | التقارير |
| `/shortcuts` | ShortcutsPage | اختصارات لوحة المفاتيح |
| `/expenses` | ExpensesPage | المصروفات |
| `/tax-invoice` | TaxInvoiceSettingsPage | إعدادات الفاتورة الضريبية |
| `/ai-assistant` | AIAssistantPage | المساعد الذكي |
| `/shifts` | ShiftsPage | إدارة الورديات |
| `/activity` | ActivityPage | سجل الأنشطة |
| `/analytics` | AnalyticsPage | 📊 التحليلات المتقدمة (خرائط حرارية + الأفضل/الأسوأ + مقارنة الفترات + تاريخ الأسعار) — **جديد الجزء 4** |
| `/bundles` | BundlesPage | 🎁 منشئ الباقات (تجميع منتجات بسعر مخفض) — **جديد الجزء 4** |
| `/more` | (DashboardPage) | صفحة "المزيد" (تعيد استخدام الداشبورد) |

لكل صفحة ملف توثيق منفصل في `docs/pages/` يشرح الغرض، المكونات المستخدمة، البيانات المعالجة، والمنطق الأساسي.

---

## المكونات المشتركة

المكونات المشتركة (غير shadcn/ui) موجودة في `src/components/`. أهمها:

- **AppLayout** — التخطيط الرئيسي: شريط جانبي (Sidebar) على الحاسوب، شريط علوي (TopBar) مع البحث والإشعارات، وشريط سفلي (BottomNav) على الجوال.
- **CommandPalette** — لوحة أوامر قابلة للبحث (Ctrl+K / Cmd+K) للوصول السريع لكل الصفحات.
- **OnboardingWizard** — معالج تفاعلي لتهيئة المتجر عند أول استخدام.
- **NotificationCenter** — منسدلة عرض الإشعارات مع تمييز المقروء/غير المقروء.
- **ProductFormModal** — نموذج منبثق لإضافة/تعديل المنتجات مع التحقق (Zod).
- **BarcodeScannerModal** — نافذة مسح الباركود عبر BarcodeDetector API.
- **ThermalReceipt** — فاتورة حرارية قابلة للتحويل إلى صورة والمشاركة/الطباعة.
- **SalesGoalWidget** — ودجت تتبع أهداف المبيعات مع شريط تقدم.
- **SearchBar** — شريط بحث عام مع اقتراحات.
- **SectionCard / StatsRow / Field** — مكونات تخطيط مساعدة قابلة لإعادة الاستخدام.

لتفاصيل كل مكوّن، راجع الملفات في `docs/components/`.

---

## اختصارات لوحة المفاتيح

تعمل اختصارات لوحة المفاتيح على الحاسوب فقط (يتم تعطيلها على الأجهزة اللمسية):

| الاختصار | الإجراء |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | فتح لوحة الأوامر (Command Palette) |
| `Esc` | إغلاق لوحة الأوامر / النوافذ المنبثقة |
| `g` ثم `d` | الذهاب إلى لوحة المعلومات |
| `g` ثم `p` | الذهاب إلى نقطة البيع |
| `g` ثم `r` | الذهاب إلى التقارير |
| `n` | إنشاء جديد (حسب السياق) |
| `/` | تركيز شريط البحث |

> راجع صفحة `/shortcuts` داخل التطبيق لقائمة كاملة ومحدّثة، وكذلك `src/hooks/useKeyboardShortcuts.ts`.

---

## الوثائق التفصيلية

إلى جانب هذا الملف الرئيسي، يوجد مجلد `docs/` يحتوي على وثائق تفصيلية لكل جزء من المشروع:

```
docs/
├── ARCHITECTURE.md        # البنية المعمارية، أنماط التصميم، تدفق البيانات
├── CONTEXTS.md            # توثيق كل مزود Context (الحالة، الواجهة، الاستخدام)
├── DESIGN-SYSTEM.md       # نظام التصميم، الألوان، الخطوط، المتغيرات
├── FOLDERS.md             # وصف كل مجلد رئيسي في src/
├── PAGES.md               # فهرس وتعريف كل صفحة
├── COMPONENTS.md          # فهرس وتعريف كل مكوّن مشترك
├── HOOKS.md               # توثيق الخطافات المخصصة
├── SERVICES.md            # طبقة البيانات (Mock Services)
├── TYPES.md               # تعريفات الأنواع
├── LIB.md                 # الدوال المساعدة
├── pages/                 # ملف توثيق لكل صفحة على حدة
│   ├── DashboardPage.md
│   ├── POSPage.md
│   ├── ProductsPage.md
│   └── ... (24 ملف)
└── components/            # ملف توثيق لكل مكوّن مشترك
    ├── AppLayout.md
    ├── CommandPalette.md
    └── ...
```

---

## دليل المطور الجديد

مرحبًا بك في فريق فونو! إليك خريطة طريق للبدء بسرعة:

**أولًا — افهم البنية العامة:** اقرأ هذا الملف (`README.md`) بالكامل، ثم [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) لفهم الأنماط المعمارية و[`docs/CONTEXTS.md`](docs/CONTEXTS.md) لفهم كيف تدار الحالة.

**ثانيًا — شغّل المشروع محليًا:** نفّذ `npm install` ثم `npm run dev`. تصفح التطبيق، جرّب الصفحات، وافتح أدوات المطوّر لمتابعة تدفق البيانات.

**ثالثًا — افهم نظام التصميم:** راجع [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) و`src/index.css`. تعوّد على استخدام `var(--vuno-*)` بدلًا من ألوان صلبة.

**رابعًا — اختر صفحة للتعديل:** انظر إلى `docs/pages/` واختر صفحة تفهمها. اقرأ ملف توثيقها ثم افتح الكود في `src/pages/`. كل صفحة مكتفية ذاتيًا تقريبًا وتستهلك سياقات ومكتبات UI.

**خامسًا — اتبع الأنماط القائمة:**

- استخدم `@/` كـ alias لـ `src/` (مثل `import { Button } from '@/components/ui/button'`).
- استخدم الأيقونات من `@/components/icons` وليس `lucide-react`.
- استخدم مكونات `ui/` من shadcn بدلًا من بناء عناصر واجهة من الصفر.
- ولّد المعرفات عبر `generateId()` / `generateNumericId()` من `@/lib/utils`.
- لا تستدعِ `Math.random()` أو `Date.now()` أثناء الـ render.
- لا تستدعِ `setState` داخل `useEffect` بشكل تزامني — استبدله بقيمة مشتقة (derived) عبر `useMemo` إن أمكن.
- عند إضافة سياق جديد، اتبع النمط الثنائي: ملف `*-context-value.ts` للـ hook و`*Context.tsx` للمزوّد.
- عند إضافة صفحة جديدة، أضفها إلى `App.tsx` كـ lazy import، أضف مسارها، وحدّث `src/constants/navigation.ts` و`pageTitles`.
- اكتب توثيقًا (JSDoc) فوق كل دالة ومكوّن جديد.
- أضف ملف `.md` في `docs/pages/` أو `docs/components/` لأي عنصر جديد.

**سادسًا — قبل الـ commit:** شغّل `npm run lint` و`npm run build` للتأكد من عدم وجود أخطاء. يجب أن يمرّا بـ 0 أخطاء.

---

## الجزء 4 — أفكار النمو والتحليلات (#31–40)

تمت إضافة عشر ميزات جديدة في إصدار الجزء 4 (Part 4) تركّز على **التحليلات المتقدمة، الولاء، النمو، وعمليات الموردين**. جميع الميزات مبنية فوق المشروع الأصلي دون حذف أو كسر أي وظيفة قائمة، وتتبع نفس أنماط البناء (React 19، Context API، Tailwind CSS مع متغيرات `--vuno-*`، مكتبة الأيقونات المخصصة في `@/components/icons`، وطبقة البيانات الوهمية في `src/services/mock/`).

### 31 — خريطة المبيعات الحرارية (Sales Heatmap)

خريطة حرارية تفاعلية تعرض شدة المبيعات عبر أيام الأسبوع والساعات. كل خلية ملوونة حسب حجم المبيعات (أخضر فاتح = منخفض، أخضر غامق = متوسط، أحمر = ذروة). عند المرور فوق خلية تظهر تفاصيل الفترة (عدد الفواتير والمبلغ). المكون `SalesHeatmap` يستهلك بيانات من `heatmapCells` ويستخرج رؤى تلقائية (أقوى وقت، أضعف وقت) عبر `extractHeatmapInsights`. يظهر في لوحة المعلومات وصفحة التحليلات.

### 32 — الأفضل والأسوأ أداءً (Top & Bottom Performers)

قائمتان متوازيتان: أفضل 5 منتجات مبيعاً (بطاقات خضراء مع شارة "رائج") وأسوأ 5 (بطاقات حمراء مع تنبيه). كل منتج يعرض الكمية المباعة والإيراد ونسبة التغير مقابل الشهر السابق (سهم صعود/هبوط). المكون `TopPerformers` يدمج بيانات `topPerformers` و`bottomPerformers` مع `mergePerformersWithChange` لحساب الدلتا. يظهر في لوحة المعلومات وصفحة التحليلات.

### 33 — مقارنة الفترات (Compare Periods)

مقارنة شهر مقابل شهر سابق جنباً إلى جنب. قائمة منسدلة لاختيار الشهرين، ثم بطاقات مقارنة للمبيعات وعدد الفواتير وصافي الربح والخسائر مع نسب التغيير الملوّنة (أخضر للزيادة الإيجابية، أحمر للزيادة السلبية كالخسائر). رسم بياني عمودي (BarChart) يقارن اليوم بيوم للشهرين، وقسم للمنتجات التي زادت والتي قلت. المكون `PeriodComparison` يستخدم `comparePeriods` من `lib/analytics.ts`.

### 34 — تغذية الأنشطة الحية (Live Activity Feed)

شريط جانبي في لوحة المعلومات يعرض آخر الأنشطة في المتجر بشكل لحظي: مبيعات، استلام مخزون، عملاء جدد، تنبيهات نقص المخزون. كل نشاط = بطاقة صغيرة بأيقونة ونص ووقت نسبي (منذ X دقيقة) وزر "عرض" يوجّه للصفحة المعنية. المكون `ActivityFeed` يستهلك `activities` من سياق `useActivityLog` الموجود أصلاً في المشروع. زر "عرض الكل" يوجّه إلى `/activity` (صفحة موجودة).

### 35 — قيمة العميل مدى الحياة (Customer Lifetime Value)

في لوحة العميل الجانبية، بطاقة تعرض القيمة الإجمالية للعميل: إجمالي المشتريات، عدد الفواتير، متوسط الفاتورة، تاريخ أول وآخر عملية شراء، ومدة العلاقة بالأشهر. تصنيف تلقائي: VIP (أكثر من 10,000 جنيه)، ممتاز (أكثر من 5,000)، عادي (أقل)، أو خامل (لم يشتر منذ 3 أشهر) مع شارة ملوّنة. المكون `CustomerCLV` يستخدم `computeCLV` و`computeMonthsActive` و`forecastCLV` من `lib/analytics.ts`.

### 36 — نظام نقاط الولاء (Loyalty Points System)

نظام نقاط لكل عملية شراء (1 جنيه = 0.1 نقطة). في لوحة العميل: بطاقة تعرض النقاط الحالية والمستبدلة والإجمالي المكتسب، شريط تقدم نحو المستوى التالي، والمستوى الحالي (برونزي → فضي → ذهبي → بلاتيني) مع خيارات استبدال النقاط (خصم نقدي أو منتج مجاني). في نقطة البيع: عند اختيار عميل مسجل وسلة غير فارغة، يظهر توقع النقاط التي سيكسبها من الفاتورة الحالية. المكون `LoyaltySystem` و`getLoyaltySummary` و`calcInvoicePoints` من `services/mock/loyalty.ts`.

### 37 — منشئ الباقات (Bundle Builder)

صفحة جديدة `/bundles` لإنشاء وإدارة الباقات: تجميع منتجات متعددة بسعر مخفض. كل باقة = بطاقة بصورة (أو كولاج)، اسم، قائمة المنتجات، السعر الأصلي (مشطوب)، السعر المخفض، ومقدار التوفير. يمكن إنشاء باقة جديدة عبر اختيار المنتجات وتحديد السعر المخفض والاسم والوصف، وحذف أو تفعيل/تعطيل الباقات. في نقطة البيع: قسم عروض الباقات بتمرير أفقي يضيف منتجات الباقة للسلة بنقرة واحدة. المكون `BundleBuilder` في صفحة `BundlesPage`. الدوال `calcOriginalPrice` و`calcSavings` و`calcDiscountPercent` من `types/bundle.ts`.

### 38 — عروض الفلاش (Flash Sales)

عروض محدودة بوقت تنازلي (Countdown Timer) تخلق إحساساً بالإلحاح. في لوحة المعلومات: بطاقة عرض فلاش مع العد التنازلي والمنتج والسعر الأصلي (مشطوب) والمخفض ومقدار التوفير وشريط تقدم (النسبة المباعة). في نقطة البيع: لافتة صفراء في الأعلى تعرض العرض الحالي مع عد تنازلي صغير. المكون `FlashSales` يدعم variant بطاقة ولافتة. الدوال `isFlashSaleActive` و`remainingQty` و`saleProgress` و`getRemaining` من `types/flashSale.ts`. العد التنازلي عبر `setInterval` و`useState`.

### 39 — خط أنابيب أوامر الشراء (Purchase Order Pipeline)

عرض Kanban لأوامر الشراء في 5 مراحل: تم الطلب → في الطريق → وصل → قيد الفحص → تم الاستلام. كل أمر = بطاقة برقم الطلب واسم المورد والعناصر والمبلغ والتاريخ. يمكن تحريك الأمر للأمام أو الخلف عبر المراحل. صفحة `/purchase-orders` الآن تدعم التبديل بين عرض القائمة (الأصلي) وعرض الكانبان (الجديد) دون المساس بالوظائف القائمة. المكون `PurchaseOrderKanban` يستخدم `samplePurchaseKanbanOrders` من `services/mock/purchaseOrders.ts` (تمت إعادة تسميته من `sampleKanbanOrders` لتجنب التعارض مع `orders.ts`).

### 40 — مخطط تاريخ الأسعار (Price History Chart)

مخطط خطي (LineChart) لكل منتج يعرض السعر عبر التواريخ عند كل مورد بخط ملوّن مستقل. قائمة منسدلة لاختيار المنتج، وأزرار فلترة للموردين. عند المرور فوق نقطة يظهر tooltip بالتاريخ والسعر والمورد. رؤى تلقائية: أقل سعر وأعلى سعر ومتوسط السعر ونسبة التغيير عن آخر مرة. المكون `PriceHistoryChart` يستخدم `buildPriceHistory` و`filterPriceBySupplier` و`findCheapestSupplier` من `lib/analytics.ts`. يظهر في صفحة التحليلات.

### ملخص الملفات الجديدة في الجزء 4

| الفئة | الملفات |
|-------|---------|
| الأنواع (Types) | `types/analytics.ts`، `types/loyalty.ts`، `types/bundle.ts`، `types/flashSale.ts`، `types/purchaseOrder.ts` (مُحدَّث) |
| البيانات الوهمية | `services/mock/analytics.ts`، `services/mock/loyalty.ts`، `services/mock/bundles.ts`، `services/mock/flashSales.ts`، `services/mock/purchaseOrders.ts` (مُحدَّث)، `services/mock/index.ts` (مُحدَّث) |
| الدوال النقية | `lib/analytics.ts` |
| المكونات | `components/analytics/SalesHeatmap.tsx`، `components/analytics/TopPerformers.tsx`، `components/analytics/PeriodComparison.tsx`، `components/analytics/ActivityFeed.tsx`، `components/analytics/PriceHistoryChart.tsx`، `components/customers/CustomerCLV.tsx`، `components/loyalty/LoyaltySystem.tsx`، `components/bundles/BundleBuilder.tsx`، `components/flash/FlashSales.tsx`، `components/purchases/PurchaseOrderKanban.tsx` |
| الصفحات الجديدة | `pages/AnalyticsPage.tsx`، `pages/BundlesPage.tsx` |
| الصفحات المُحدَّثة | `pages/DashboardPage.tsx`، `pages/POSPage.tsx`، `pages/ClientsPage.tsx`، `pages/PurchaseOrdersPage.tsx` |
| التنقّل | `constants/navigation.ts` (مُحدَّث)، `App.tsx` (مُحدَّث) |

للاطلاع على شرح مفصّل لكل ملف جديد، راجع `FILES_EXPLANATION_PART4.md`.

---

<div align="center">

**فونو © 2024 — صُمم بحب للمتاجر العربية 🇪🇬**

</div>
