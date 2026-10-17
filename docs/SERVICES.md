# طبقة البيانات — الخدمات النظيفة (Clean Services)

> **مرجع معماري:** `docs/ARCHITECTURE.md` + قاعدة الاعتمادية في Clean Architecture (Dependency Rule — ch. 22)

يعتمد المشروع على **طبقة خدمات نظيفة** تفصل مصدر البيانات عن مستهلكيه. الواجهة (الصفحات والمكوّنات) لا تعرف شيئًا عن `fetch` أو `axios` أو البيانات الوهمية — بل تتعامل مع **واجهات (Interfaces)** فقط. عند الانتقال إلى API حقيقي، يكفي تبديل الـ Adapter (تطبيق الواجهة) دون لمس أي مكوّن في الواجهة.

---

## الفكرة المعمارية

الفصل بين مصدر البيانات ومستهلكيه هو مبدأ أساسي. **قاعدة الاعتمادية** تنص على أن اعتماديات الشيفرة تشير **للداخل** دائمًا:

```
[UI: Pages / Components / Hooks]
        ↓ تعتمد على
[Composition Root: DataServicesProvider + useX() hooks]
        ↓ تعتمد على
[Services: XService (منطق الاستخدام)]
        ↓ تعتمد على
[Repository Interface: IXRepository (منفذ/Port)]
        ↑ يُطبّقه
[MockXRepository (Adapter)]   ← يُستبدل لاحقًا بـ ApiXRepository
```

عند الانتقال إلى API حقيقي:

1. تُنشأ فئة `ApiXRepository` تُطبّق نفس `IXRepository`.
2. يُبدَّل التطبيق في نقطة التركيب (Composition Root) فقط.
3. **لا تُلمس مكوّنات الواجهة** — فهي تستهلك البيانات عبر الـ hooks التي تبقى بنفس التوقيع.

---

## النمط الرباعي لكل كيان

كل كيان نظيف يتكوّن من **أربعة ملفات** داخل `src/services/<entity>/`:

| الملف | الدور | الطبقة |
|-------|-------|--------|
| `IXRepository.ts` | واجهة الوصول للبيانات (Port) | Domain |
| `MockXRepository.ts` | تطبيق وهمي للواجهة (Adapter) | Adapters |
| `XService.ts` | منطق الاستخدام (Use Cases) | Application |
| `index.ts` | إعادة تصدير مركزية | — |

مثال (خدمة العملاء):

```typescript
// src/services/client/IClientRepository.ts
export interface IClientRepository {
  getAll(): Promise<Client[]>;
  create(input: CreateClientInput): Promise<Client>;
  update(id: string, patch: Partial<Client>): Promise<Client>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

// src/services/client/ClientService.ts
export class ClientService {
  private readonly repository: IClientRepository;
  constructor(repository: IClientRepository) {
    this.repository = repository;
  }
  getClients(): Promise<Client[]> {
    return this.repository.getAll();
  }
  // ... باقي منطق الاستخدام
}

// src/services/client/index.ts
export * from './IClientRepository';
export * from './ClientService';
export { MockClientRepository } from './MockClientRepository';
```

---

## نقطة التركيب (Composition Root)

تُجمَّع كل الخدمات في مزوّد واحد `DataServicesProvider` (`src/context/data-services-context.tsx`)، ويُغلَّف به التطبيق في `App.tsx`. توفّر الواجهة `useDataServices()` التي تُعيد كائنًا يجمع كل الخدمات:

```typescript
export interface DataServices {
  client: ClientService;
  loyalty: LoyaltyService;
  expense: ExpenseService;
  staff: StaffService;
  profile: ProfileService;
  purchaseOrder: PurchaseOrderService;
  bundle: BundleService;
  settings: SettingsService;
  reporting: ReportingService;
  flashSale: FlashSaleService;
  shift: ShiftService;
  pricingPlan: PricingPlanService;
  product: ProductService;
  order: OrderService;
  return: ReturnService;
  invoice: InvoiceService;
  branch: BranchService;
  category: CategoryService;
  supplier: SupplierService;
  notification: NotificationService;
  activityLog: ActivityLogService;
  heldOrder: HeldOrderService;
  salesGoal: SalesGoalService;
  auth: AuthService;
}
```

ثم يستهلك المكوّن الخدمة عبر hook مخصّص، مثال:

```typescript
// src/hooks/useClients.ts
export function useClients() {
  const { client } = useDataServices();
  const [clients, setClients] = useState<Client[]>([]);
  // ... تحميل + عمليات إنشاء/تعديل/حذف
  return { clients, isLoading, refetch, createClient, updateClient, deleteClient, restoreClient, getClientActivities };
}
```

---

## الكيانات النظيفة

| الكيان | المجلد | الـ Hook |
|--------|--------|---------|
| المنتجات | `src/services/product/` | `useProducts` (context) |
| الطلبات | `src/services/order/` | `useOrders` |
| الفواتير | `src/services/invoice/` | `useInvoices` |
| المرتجعات | `src/services/return/` | `useReturns` |
| الفئات | `src/services/category/` | `useCategories` |
| الموردون | `src/services/supplier/` | `useSuppliers` |
| الفروع | `src/services/branch/` | `useBranches` |
| العملاء | `src/services/client/` | `useClients` |
| نقاط الولاء | `src/services/loyalty/` | `useLoyalty` |
| المصروفات | `src/services/expense/` | `useExpenses` |
| الموظفون | `src/services/staff/` | `useStaff` |
| الملف الشخصي | `src/services/profile/` | `useProfile` |
| أوامر الشراء | `src/services/purchaseOrder/` | `usePurchaseOrders` |
| الباقات | `src/services/bundle/` | `useBundles` |
| الإعدادات | `src/services/settings/` | `useSettings` |
| التقارير | `src/services/reporting/` | `useReporting` |
| العروض السريعة | `src/services/flashSale/` | `useFlashSales` |
| الورديات | `src/services/shift/` | `useShift` / `useShifts` |
| الإشعارات | `src/services/notification/` | `useNotifications` (context) |
| سجل الأنشطة | `src/services/activityLog/` | `useActivityLog` (context) |
| الطلبات المعلقة | `src/services/heldOrder/` | `useHeldOrders` (context) |
| هدف المبيعات | `src/services/salesGoal/` | `useSalesGoal` (context) |
| جلسة الدخول | `src/services/auth/` | `useAuth` (context) / `useSignOut` |

> **ملاحظة:** مجلد `src/services/mock/` ما زال موجودًا كـ Adapter خلف الواجهات (تُستدعى بياناته من داخل `MockXRepository` فقط). لا يُستورد مباشرةً من الصفحات أو المكوّنات.

---

### ملاحظة: كل الـ providers في مكان واحد

لم يعد هناك `ProductServiceProvider` أو `OrderServiceProvider` أو غيرهم. كل الخدمات تُبنى في `DataServicesProvider` فقط، وكل `useXService()` (مثل `useOrderService`) بيقرأ منه. ده معناه إن تبديل مصدر البيانات لأي كيان = سطر واحد في ملف واحد.

### ملاحظة: الكيانات المخزّنة محليًا (Notification / ActivityLog / HeldOrder / SalesGoal / Auth)

دي قوائم صغيرة خاصة بالجهاز، فالـ port بتاعها **متزامن** (`load()` / `save()`) بدل `Promise`. القواعد في الـ Service: كل دالة بتاخد القائمة الحالية وترجّع التالية وتحفظها عن طريق الـ repository. الـ provider في `context/` بيحتفظ بالقائمة في state عن طريق `hooks/useServiceState.ts` ولا يقرر أي قاعدة.

عند الانتقال لـ backend حقيقي، الـ port ده لازم يتحول لـ `async` ويتضاف loading state في الـ provider. ده تغيير مقصود وظاهر، مش مخفي وراء الواجهة.

### ملاحظة: الجلسة (Auth)

`services/auth/` بيحدد قاعدة "مين يدخل التطبيق": `AuthService.isSignedIn()` بتتأكد إن الجلسة المحفوظة سليمة الشكل (التخزين مش موثوق: ممكن يتعدّل بالإيد أو يفضل فيه شكل قديم)، و`signIn()` و`signOut()`. الـ port متزامن زي الأربعة اللي قبله، والمفتاح `STORAGE_KEYS.authSession` **مش داخل في النسخة الاحتياطية** عن قصد. `AuthProvider` بيحتفظ بالحالة، و`RequireAuth` بيحمي المسارات، و`useSignOut` هو الطريق الوحيد للخروج.

**تسجيل الدخول لسه محاكاة** (أي إدخال بيدخل ومفيش سيرفر)، فالحماية دي بتحمي تدفق التطبيق مش البيانات، لأن البيانات في المتصفح. لما يجي الباك إند (مرحلة 3) بيتغيّر `AuthService` و`LocalStorageAuthSessionRepository` بس، والحارس والشاشات زي ما هما.

### ملاحظة: use case إتمام البيع

`services/sale/CompleteSale.ts` هو أول "use case" مستقل: دالة `completeSale(ports, { cart, paymentMethod })` بتبيع أولًا، ولو نجح البيع فقط بتسجل في الوردية والهدف وسجل الأنشطة، وبترجّع الإيصال (أو `null` لو فشل، فيفضل الكارت كما هو). الـ ports هي واجهات صغيرة (`sellProducts` و`recordSale` و`addAchieved` و`logActivity`)، فالاختبار بيتم بـ fakes من غير React. الـ hook `useCompleteSale` هو التوصيل الوحيد بالـ contexts.

### ملاحظة: use case المرتجعات

`services/return/ProcessReturn.ts` هو التاني بعد البيع: `processReturn(ports, id)` بتحرّك المرتجع خطوة، وعلى الخطوة الأخيرة بس (`refunded`) بتأثر في المخزون: **مرتجع عميل** بيرجّع القطع لرف المتجر (`restockProducts`) **إلا** لو السبب في `NON_RESELLABLE_REASONS` (دلوقتي `defective` و`expired`، وبيتغيّروا من ملف واحد)، و**مرتجع مورد** بيخصمها (`withdrawProducts`: من المتجر الأول وبعدين المخزن ومش بينزل عن صفر). في كل الحالات بتكتب سطر في سجل الأنشطة. الحالة بتتحفظ **الأول**، فلو فشل حفظها ما بيتلمسش حاجة. وعشان الأثر على المخزون بيحصل مرة واحدة بس، معالجة مرتجع مسدّد بالفعل مش بتعمل حاجة.

النتيجة (`stock`): `none` و`restocked` و`withdrawn` و`not-resellable`، و`incomplete` (بعض منتجات المرتجع مش موجودة في قايمة المخزون، والسجل بيقول "تم تحديث 1 من 2 منتج…" بدل ما يدّعي إنه اتنفّذ كله)، و`failed` (الحالة اتغيّرت والمخزون ما اتحدّثش). **مفيش تراجع تلقائي للحالة** في الحالتين الأخيرتين، فالتنبيه والسجل هما اللي بيقولوا.

**نموذج المرتجع بيشتغل على منتجات حقيقية:** `InvoiceService` بيحفظ مع الفاتورة أسطرها (`lines`: رقم المنتج واسمه وكميته وسعره)، و`useInvoiceBuilder` بيبعتها، فمرتجع عميل لفاتورة جديدة بيعرض منتجاتها هي بس وبأقصى كمية اتشرت. الفواتير اللي اتعملت قبل كده (ومنها الفواتير التجريبية) مفيهاش أسطر، فالنموذج بيعرض منتجات المحل الحقيقية. القواعد دي في `lib/returns.ts`. **حدّ معروف:** السعر على السطر قبل الخصم والضريبة، فالاسترداد مش بيخصم نسبة الخصم ولا بيضيف الضريبة.

`OrderService.createOrder` بيرفض (بـ`InvalidOrderError`) طلب من غير اسم عميل أو رقم هاتف أو أسطر، **وكمان سطر من غير اسم أو بسعر أو كمية مش أكبر من صفر** (سالب أو صفر أو مش رقم أو لانهائي) — قبل كده كان بيقبل سعر وكمية بالسالب. الكمية الكسرية (نص كيلو) مقبولة. والرفض قبل أي تخزين.

الطلبات (`OrderService`) **ما اتعملهاش use case**: مراحلها (جديد ← تحضير ← شحن ← تسليم) بتتحرك من غير أي أثر على المخزون، فمفيش خطوات تتجمّع. لو عايز الطلب يخصم من المخزون، لازم تحدد إمتى (عند الإنشاء ولا الشحن ولا التسليم) وبعدين يتعمل.

### ملاحظة: الاختبارات

كل دومين له `*Service.test.ts` جنبه. القالب: `new XService(new MockXRepository(seed))` بـseed صغير واضح، مش بيانات الـmock الافتراضية، فكل اختبار مستقل. الخدمات اللي بتخزّن في المتصفح (`Shift` والخمسة المحلية) بتتجرّب على repository وهمي في الذاكرة، ما بتلمسش `localStorage`.

### ملاحظة: الأرقام (ids)

أي رقم قصير (زي `INV-2050`) لازم يتحقق منه الـ repository عن طريق `pickUniqueId` (`lib/utils.ts`)، لأن رقمين متطابقين معناه إن `findById`/`update` يمسّوا سجل غلط. الأرقام الطويلة (`generateId`) فيها وقت + عشوائي فمش محتاجة.

**رقم إيصال الكاشير** (`generateInvoiceId` في `services/sale/CompleteSale.ts`): `INV-` + التاريخ المحلي `YYMMDD` + `-` + 6 حروف للوقت من منتصف الليل (ملّي ثانية بالـbase 36) + حرفين عشوائيين، مثال `INV-261008-0V2XQB7K`. فريد لكل ملّي ثانية، وبيترتّب زمنيًا جوه اليوم، والحرفين العشوائيين بس للجهازين اللي يبيعوا في نفس الملّي ثانية. الشكل القديم (`INV-` + آخر 6 أرقام من الساعة) كان بيتكرر كل 1,000,000 ملّي ثانية، يعني كل ~16.7 دقيقة. **فريد مش متسلسل بدون فجوات**: لو الضريبة أو المحاسب محتاجين تسلسل، لازم يطلع من الباك إند لما يتوصّل.

### ملاحظة: بيانات التقارير

`ReportingService` بقى بيقدّم كمان: `getWeekSales` و`getYearSales` و`getLastSevenDaysSales` و`getCategorySales` و`getCategoryRevenue` و`getPaymentMethodShare` و`getTotalLosses` و`getTodayRevenue`. الصفحات (`DashboardPage`, `ReportsPage`) مبقاش فيها أي مصفوفة أرقام ثابتة، والألوان بتتحط في الصفحة حسب ترتيب الشريحة.

## الحماية الآلية (ESLint)

لمنع أي تسريب مستقبلي، يفرض `eslint.config.js` قاعدة `no-restricted-imports` على مجلدات `src/pages/**` و`src/components/**` و`src/context/**` و`src/hooks/**`، فترفض أي استيراد مباشر من `@/services/mock`:

```javascript
{
  files: ['src/pages/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}',
          'src/context/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/services/mock', '@/services/mock/*', '**/services/mock', '**/services/mock/*'],
        message: 'ممنوع الاستيراد المباشر من طبقة البيانات الوهمية. استخدم الخدمة النظيفة عبر الـ hooks (راجع docs/ARCHITECTURE.md).',
      }],
    }],
  },
}
```

---

## إضافة كيان جديد

1. أنشئ `src/types/xxx.ts` بتعريفات الأنواع، وأضفه إلى `src/types/index.ts`.
2. أنشئ `src/services/xxx/IXRepository.ts` (الواجهة).
3. أنشئ `src/services/xxx/MockXRepository.ts` (التطبيق الوهمي الذي يقرأ من `src/services/mock/xxx.ts`).
4. أنشئ `src/services/xxx/XService.ts` (منطق الاستخدام).
5. أنشئ `src/services/xxx/index.ts` (إعادة التصدير).
6. سجّل الخدمة في `DataServicesProvider` (`src/context/data-services-context.tsx`).
7. أنشئ hook `src/hooks/useXxx.ts` يستهلك الخدمة عبر `useDataServices()`.
8. أنشئ الصفحة في `src/pages/XxxPage.tsx` واستهلك البيانات عبر الـ hook.
9. أضف المسار في `App.tsx` والتنقل في `src/constants/navigation.ts`.
10. أضف ملف توثيق في `docs/pages/XxxPage.md`.
