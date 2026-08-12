# توثيق سياقات React (Context Providers)

يستخدم مشروع فونو **React Context API** حصرًا لإدارة الحالة (لا Redux ولا Zustand). هناك **9 مزودات** متداخلة في `src/App.tsx`. كل سياق منقسم إلى ملفين ليفصل منطق الاستهلاك (hook) عن منطق التزويد (provider)، مما يرضي قاعدة ESLint `react-refresh/only-export-components`.

## جدول المزودات

| المزوّد | الـ Hook | الملفات | الغرض |
|--------|---------|---------|------|
| ThemeProvider | `useTheme()` | `ThemeContext.tsx` / `theme-context-value.ts` | الثيم الليلي/النهاري |
| BranchProvider | `useBranch()` | `BranchContext.tsx` / `branch-context-value.ts` | الفروع والفرع النشط |
| AppSettingsProvider | `useAppSettings()` | `AppSettingsContext.tsx` / `app-settings-context-value.ts` | إعدادات التطبيق العامة |
| NotificationsProvider | `useNotifications()` | `NotificationsContext.tsx` / `notifications-context-value.ts` | الإشعارات |
| ActivityLogProvider | `useActivityLog()` | `ActivityLogContext.tsx` / `activity-log-context-value.ts` | سجل الأنشطة |
| ProductsProvider | `useProducts()` | `ProductsContext.tsx` / `products-context-value.ts` | المنتجات والمخزون والنقل |
| SalesGoalProvider | `useSalesGoal()` | `SalesGoalContext.tsx` / `sales-goal-context-value.ts` | أهداف المبيعات |
| ShiftProvider | `useShift()` | `ShiftContext.tsx` / `shift-context-value.ts` | الورديات |
| HeldOrdersProvider | `useHeldOrders()` | `HeldOrdersContext.tsx` / `held-orders-context-value.ts` | الطلبات المعلقة |

## ترتيب التداخل

يُلف المزودون في `App.tsx` بالترتيب التالي (من الخارج للداخل):

```
ThemeProvider → BranchProvider → AppSettingsProvider → NotificationsProvider
  → ActivityLogProvider → ProductsProvider → SalesGoalProvider
  → ShiftProvider → HeldOrdersProvider → (التطبيق)
```

هذا الترتيب مدروس: المزودات الأكثر عمومية (الثيم، الفروع) في الخارج لأنها نادرًا ما تتغير وتُستهلك على نطاق واسع. المزودات الأكثر تخصصًا (الطلبات المعلقة) في الداخل لأنها تُستهلك فقط في نقطة البيع.

---

## 1. ThemeContext — الثيم

**الـ Hook:** `useTheme()`
**القيمة:**

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
}
```

**الغرض:** يدير تبديل الوضع الليلي/النهاري. عند تغيير الثيم، يُضاف/يُزال الصنف `dark` من عنصر `<html>`، مما يفعّل متغيرات CSS المعرفة تحت `.dark` في `src/index.css`. يُحفظ الاختيار في `localStorage` تحت المفتاح `vuno-theme`.

**الاستهلاك النموذجي:** زر التبديل في الشريط العلوي، صفحة الإعدادات.

---

## 2. BranchContext — الفروع

**الـ Hook:** `useBranch()`
**القيمة:**

```typescript
interface BranchContextValue {
  branches: Branch[];
  activeBranchId: string;
  activeBranch: Branch | null;
  setActiveBranchId: (id: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, patch: Partial<Branch>) => void;
  toggleBranchStatus: (id: string) => void;
}
```

**الغرض:** يدير قائمة الفروع والفرع النشط حاليًا. معرّف الفرع النشط يُحفظ في `localStorage` (`vuno-active-branch-id`) ليبقى محددًا بعد تحديث الصفحة. تُحمّل البيانات الأولية من `sampleBranches` في `src/services/mock/branches.ts`. يُستخدم في تقييد عرض المنتجات والمخزون حسب الفرع.

---

## 3. AppSettingsContext — إعدادات التطبيق

**الـ Hook:** `useAppSettings()`
**القيمة:**

```typescript
interface AppSettingsValue {
  multiBranchEnabled: boolean;
  setMultiBranchEnabled: (value: boolean) => void;
  transferRequiresConfirmation: boolean;
  setTransferRequiresConfirmation: (value: boolean) => void;
  defaultBranchId: string;
  setDefaultBranchId: (value: string) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (value: number) => void;
  receiptSettings: ReceiptSettings;
  setReceiptSettings: (value: ReceiptSettings) => void;
  updateReceiptField: <K extends keyof ReceiptSettings>(key: K, value: ReceiptSettings[K]) => void;
  paymentMethods: PaymentMethodConfig[];
  togglePaymentMethod: (id: string) => void;
  setPaymentMethodEnabled: (id: string, enabled: boolean) => void;
}
```

**الغرض:** المصدر الموحد لإعدادات المتجر: تفعيل تعدد الفروع، تأكيد نقل المخزون، حد انخفاض المخزون، إعدادات الفاتورة الحرارية، وطرق الدفع المتاحة. طرق الدفع هنا هي المصدر الواحد للحقيقة (Single Source of Truth) لما يظهر في نقطة البيع — صفحة الإعدادات تكتُب هنا، ونقطة البيع تقرأ منها.

> **ملاحظة (TODO):** الحالة حاليًا في الذاكرة (in-memory). الخطة المستقبلية (phase-3) هي إيداعها في Firestore/Supabase مرتبطة بحساب التاجر لتبقى بعد تحديث الصفحة.

---

## 4. NotificationsContext — الإشعارات

**الـ Hook:** `useNotifications()`
**القيمة:**

```typescript
interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearRead: () => void;
  removeNotification: (id: string) => void;
  notifyLowStock: (productNames: string[]) => void;
}
```

**الغرض:** يدير قائمة الإشعارات داخل التطبيق: الإضافة، تعليم كمقروء/غير مقروء، المسح، العد. يوفر الدالة المساعدة `notifyLowStock()` التي تُستدعى تلقائيًا عند انخفاض مخزون منتج. يُصدّر الملف أيضًا الدالة المساعدة `createNotification()` لإنشاء تنبيه بنوع محدد من خارج المكونات، و`notificationTypeLabel` لترجمة أنواع الإشعارات للعربية.

---

## 5. ActivityLogContext — سجل الأنشطة

**الـ Hook:** `useActivityLog()`
**القيمة:**

```typescript
interface ActivityLogContextValue {
  activities: ActivityEntry[];
  logActivity: (type: ActivityEntry['type'], description: string, amount?: number) => void;
  clearActivities: () => void;
}
```

**الغرض:** يسجّل كل الأنشطة المهمة (بيع، إضافة منتج، تعديل مخزون، إلخ) مع الطابع الزمني. يُحفظ في `localStorage` (`vuno_activity_log`) بحد أقصى 200 سجل. يُستهلك في صفحة `/activity`. عند بدء التشغيل لأول مرة، يُزرع ببعض السجلات التجريبية.

---

## 6. ProductsContext — المنتجات والمخزون

**الـ Hook:** `useProducts()`
**القيمة:**

```typescript
interface ProductsContextValue {
  products: Product[];
  sellProducts: (items: CartItem[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  transferToStore: (productId: string, quantity: number) => void;
  pendingTransfers: PendingTransfer[];
  requestTransfer: (productId: string, quantity: number) => void;
  confirmTransfer: (transferId: string) => void;
  cancelTransfer: (transferId: string) => void;
  transferHistory: TransferHistoryEntry[];
}
```

**الغرض:** أكبر مزود وأكثرها استخدامًا. يدير قائمة المنتجات بالكامل: الإضافة، التعديل، الحذف، البيع (خصم الكمية)، ونقل المخزون بين المستودع والمتجر. نظام النقل (Transfer) يدعم دورة كاملة: طلب نقل (`requestTransfer`)، تأكيد (`confirmTransfer`)، إلغاء (`cancelTransfer`)، مع سجل تاريخي (`transferHistory`).

---

## 7. SalesGoalContext — أهداف المبيعات

**الـ Hook:** `useSalesGoal()`
**القيمة:**

```typescript
interface SalesGoalContextValue {
  currentGoal: SalesGoal | null;
  setTarget: (target: number) => void;
  addAchieved: (amount: number) => void;
  progressPercent: number;
  isGoalReached: boolean;
}
```

**الغرض:** يدير هدف المبيعات للشهر الحالي. عند كل بيع في نقطة البيع، تُستدعى `addAchieved(amount)` لتحديث المبلغ المحقق. يُحسب `progressPercent` و`isGoalReached` اشتقاقيًا. يُستهلك في `SalesGoalWidget` على لوحة المعلومات.

---

## 8. ShiftContext — الورديات

**الـ Hook:** `useShift()`
**القيمة:**

```typescript
interface ShiftContextValue {
  shifts: Shift[];
  currentShift: Shift | null;
  openShift: (cashierName: string, openingAmount: number) => Shift;
  closeShift: (closingAmount: number) => void;
  recordSale: (amount: number) => void;
}
```

**الغرض:** يدير ورديات الكاشير: فتح وردية بمبلغ افتتاحي، تسجيل المبيعات أثناء الوردية، إغلاق الوردية بمبلغ ختامي. `currentShift` هو الوردية المفتوحة حاليًا أو `null`. يُستهلك في صفحة `/shifts` وفي نقطة البيع (عند الدفع تُستدعى `recordSale`).

---

## 9. HeldOrdersContext — الطلبات المعلقة

**الـ Hook:** `useHeldOrders()`
**القيمة:**

```typescript
interface HeldOrdersContextValue {
  heldOrders: HeldOrder[];
  holdOrder: (label: string, items: CartItem[], subtotal: number, tax: number, total: number) => void;
  resumeOrder: (id: string) => HeldOrder | null;
  deleteHeldOrder: (id: string) => void;
  heldCount: number;
}
```

**الغرض:** يدير الطلبات المعلقة في نقطة البيع: تعليق طلب (حفظ محتوى السلة الحالية)، استرجاعه لاحقًا، أو حذفه. يُحفظ في `localStorage` (`vuno_held_orders`) ليبقى بعد التحديث. `heldCount` يُعرض كشارة على زر الطلبات المعلقة.

---

## النمط المعماري — لماذا ملفان لكل سياق؟

قاعدة ESLint `react-refresh/only-export-components` تطلب أن ملفات المكوّنات لا تصدّر سوى مكوّنات React (لكي يعمل Fast Refresh بشكل صحيح). لكن الـ hooks (`useXxx`) ليست مكوّنات. الحل هو فصل الـ hook وكائن `createContext` في ملف منفصل (`*-context-value.ts`) لا يحتوي على أي مكوّن، بينما يبقى المزوّد (وهو مكوّن) في `*Context.tsx`.

عند إضافة سياق جديد، اتبع هذا النمط بالضبط:

1. أنشئ `src/context/xxx-context-value.ts` يحتوي على: الواجهة `XxxContextValue`، كائن `XxxContext = createContext<...>(null)`، والدالة `useXxx()` مع التحقق من القيمة `null` ورمي خطأ واضح.
2. أنشئ `src/context/XxxContext.tsx` يحتوي على مكوّن `XxxProvider` فقط، يستورد `XxxContext` من الملف الأول.
3. أضف المزوّد في الترتيب المناسب في `src/App.tsx`.
