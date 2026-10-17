# فهرس المكونات المشتركة (Components)

يصف هذا الملف المكونات المشتركة على مستوى التطبيق في `src/components/` (باستثناء مكتبة `ui/` و`icons/` التي لها وصف في [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md)).

---

## المكونات

### AppLayout
**الملف:** `AppLayout.tsx`
**الغرض:** التخطيط الرئيسي الذي يلف كل المسارات. يعرض شريطًا جانبيًا (Sidebar) على الحاسوب، شريطًا علويًا (TopBar) مع البحث والإشعارات وزر الثيم، وشريطًا سفليًا (BottomNav) على الجوال. يكتشف نوع الجهاز عبر `useDeviceType()` ويُبدّل التخطيط. يُستهلك في `App.tsx` كعنصر `element` للـ route الأب.

### CommandPalette
**الملف:** `CommandPalette.tsx`
**الغرض:** لوحة أوامر قابلة للبحث تُفتح بـ `Ctrl+K` / `Cmd+K`. تعرض كل الصفحات والإجراءات السريعة. مبني على `cmdk`. الفكرة #1 من ملف الأفكار. يُستهلك في `CommandPaletteOverlay` في `App.tsx`.

### OnboardingWizard
**الملف:** `OnboardingWizard.tsx`
**الغرض:** معالج تفاعلي متعدد الخطوات لتهيئة المتجر عند أول استخدام (اسم المتجر، العملة، طرق الدفع...). يُحفظ إكماله في `localStorage` (`vuno_onboarding_done`) عبر الدالة المساعدة `isOnboardingDone()`. يُعرض فوق كل المحتوى في `App.tsx`.

### NotificationCenter
**الملف:** `NotificationCenter.tsx`
**الغرض:** منسدلة تعرض الإشعارات مع تمييز المقروء/غير المقروء. تُستهلك في شريط AppLayout العلوي. تقرأ من `useNotifications()`.

### ProductFormModal
**الملف:** `ProductFormModal.tsx`
**الغرض:** نموذج منبثق لإضافة/تعديل المنتج. يستخدم React Hook Form + Zod للتحقق. يُستهلك في `ProductsPage`.

### BarcodeScannerModal
**الملف:** `BarcodeScannerModal.tsx`
**الغرض:** نافذة مسح الباركود عبر BarcodeDetector API الأصلي (مع fallback لإدخال يدوي). تطلب إذن الكاميرا. تُستهلك في `POSPage` و`ProductsPage`.

### QRCodeButton
**الملف:** `QRCodeButton.tsx`
**الغرض:** زر يولّد رمز QR للمنتج/الفاتورة عند الضغط. يستخدم `qrcode.react`. يُستهلك في `ProductsPage` و`InvoicePage`.

### LowStockAlertsWidget
**الملف:** `LowStockAlertsWidget.tsx`
**الغرض:** ودجة تنبيهات المخزون الذكية — تعرض المنتجات منخفضة المخزون مع توقّع عدد الأيام قبل النفاد وزر إنشاء أمر شراء مباشر. تحسب متوسط المبيعات اليومية من `ActivityLogContext`. الفكرة #12 من `NEW_IDEAS.md`. تُستهلك في `DashboardPage`. [التوثيق الكامل](components/LowStockAlertsWidget.md)

### SalesGoalWidget
**الملف:** `SalesGoalWidget.tsx`
**الغرض:** ودجت يعرض هدف المبيعات للشهر الحالي مع شريط تقدم ونسبة التحقيق. يقرأ من `useSalesGoal()`. الفكرة #3 من ملف الأفكار. يُستهلك في `DashboardPage`.

### SearchBar
**الملف:** `SearchBar.tsx`
**الغرض:** شريط بحث عام مع إمكانية اقتراحات. يُستهلك في `AppLayout` (شريط علوي) وبعض الصفحات.

### ThermalReceipt
**الملف:** `ThermalReceipt.tsx`
**الغرض:** مكوّن الفاتورة الحرارية، ومعاه زرارا المشاركة والطباعة (`ShareReceiptButton`, `PrintReceiptButton`). كل اللي مش مكوّن اتنقل لـ`lib/receipt.ts`: `ReceiptSettings` و`defaultReceiptSettings` و`receiptToImage()` و`shareReceiptImage()` و`printReceiptImage()` (بتستخدم `html-to-image`). يُستهلك في `SaleCompleteView` بعد الدفع وفي معاينة الإعدادات.

### SectionCard
**الملف:** `SectionCard.tsx`
**الغرض:** بطاقة قسم قابلة للطي (collapsible) بعنوان وأيقونة. مكون تخطيط مساعد يُستخدم في صفحات الإعدادات والتقارير.

### StatsRow
**الملف:** `StatsRow.tsx`
**الغرض:** صف بطاقات إحصائية (رقم + تسمية + اتجاه). يُستهلك في `DashboardPage` و`ReportsPage`.

### Field
**الملف:** `Field.tsx`
**الغرض:** حقل نموذج مع تسمية ورسالة خطأ. يلف حقل إدخال shadcn بنمط موحد. يُستهلك في النماذج.

### DataBackupSection
**الملف:** `DataBackupSection.tsx`
**الغرض:** قسم النسخ الاحتياطي/الاستعادة في صفحة الإعدادات. يُصدّر/يستورد البيانات من `localStorage`.

---

## مكونات `pos/` (شاشة الكاشير)

| المكوّن | الوظيفة |
|---|---|
| `CartLines` | سطور السلة: أزرار -/+ وكمية مكتوبة وحذف |
| `HeldOrdersPanel` | قائمة الطلبات المعلقة (استرداد/حذف) |
| `BundleOffers` | عروض الباقات؛ ضغطة تضيف كل منتجات الباقة للسلة |
| `SaleCompleteView` | شاشة ما بعد البيع: التأكيد والإيصال ومشاركة/طباعة/فاتورة جديدة |

كلها بتاخد البيانات والدوال كـ props ومفيهاش أي context.

## مكونات `expenses/`

`CalendarView` (شبكة الشهر بنقاط الفئات)، `DayPanel` (لوحة اليوم + رسم دائري)، `ExpenseFormPanel` (نموذج الإضافة)، `ExpenseViewToggle` (تقويم/قائمة)، `ExpenseCategoryFilter` (أزرار الفئات)، `ExpenseList` (القائمة مجمّعة باليوم). كلها بتاخد البيانات والدوال كـprops.

## مكونات `invoice/`

`InvoiceBuilderPanel` (لوحة فاتورة جديدة)، `InvoiceDetailModal` (تفاصيل فاتورة + QR + طباعة + واتساب)، `InvoiceListRows` (جدول الديسكتوب)، `InvoiceMobileCards` (كروت الموبايل)، `InvoiceStatusBadge`، ودالة `getMethodIcon` (`paymentMethodIcon.ts`).

## مكونات `branches/`

`ActiveBranchBanner`، `BranchFormPanel`، `BranchCard`، `RoleLegend`، `StaffRow` (صف الموظف + شبكة الصلاحيات)، `StaffFormModal`.

## مكونات `inventory/` (شاشة المخزون)

| المكوّن | الوظيفة |
|---|---|
| `InventoryStats` | البطاقات الأربعة (المنتجات، القطع، قيمة المخزون، المنخفض) |
| `LowStockAlert` | بطاقة "مخزون منخفض" (صف لكل منتج على الموبايل، شرائح على الأكبر) |
| `PendingTransfersCard` | النقلات المعلّقة بتأكيد وإلغاء |
| `InventoryToolbar` | البحث + QR + تصدير + شرائح الفئات |
| `ViewModeToggle` | قائمة / نقل بصري |
| `VisualTransferView` | يجمّع `WarehousePanel` و`StorePanel` و`TransferTimeline` |
| `InventoryCards` / `InventoryTable` | قائمة المنتجات (موبايل / ديسكتوب) |
| `TransferStockModal` | نافذة كمية النقل |
| `StockStatusBadge` | "منخفض / متوفر" |

كلها بتاخد البيانات والدوال كـprops ومفيهاش أي context. القواعد في `lib/inventory.ts`.

## `DataStatus` (شريط الخطأ والتحميل المشترك)

`components/DataStatus.tsx` — بياخد `error` و`isLoading` و`isEmpty` و`onRetry` (و`spaced` لهامش أعلى). بيعرض شريط الخطأ بزرار "إعادة المحاولة" لو في خطأ، وسطر "جارٍ التحميل…" **بس** لو بيحمّل ولسه مفيش حاجة تتعرض. كان نفس الشريط منسوخ في صفحات الطلبات والمرتجعات والفواتير، واتصوّرت الحالات الخمس (تحميل، فشل أول قراءة، إعادة محاولة فاشلة، نجاح، إعادة محاولة والخطأ لسه ظاهر) في الصفحات التلاتة قبل وبعد والنتيجة متطابقة. `ProductsPage` ليها شريط بنفس الشكل بالظبط لكن بدالة إعادة محاولة خاصة ونص تحميل تاني ("جارٍ تحميل المنتجات…")، فما اتحوّلتش في الجولة دي؛ تحويلها محتاج خاصية `loadingText` وكاميرا للصفحة في حالة الخطأ.

## مكونات `orders/` (شاشة الطلبات)

| المكوّن | الوظيفة |
|---|---|
| `OrdersToolbar` | شرايح الوقت (الكل / اليوم / الأسبوع / الشهر) وزرار "طلب جديد" |
| `OrdersBoard` | لوحة الكانبان (ديسكتوب بس): عمود لكل حالة |
| `KanbanColumn` | عمود بيستقبل البطاقات المسحوبة (حالة التظليل `isOver` جواه) |
| `OrderCard` | بطاقة طلب قابلة للسحب |
| `MobileOrdersList` | شرايح الحالة بعدّادها وقايمة مسطّحة (موبايل بس) |
| `OrderListRow` | صف الطلب في قايمة الموبايل |
| `NewOrderModal` | نموذج "طلب جديد": بياخد حالته من `hooks/useNewOrderForm` وبيبعت المدخلات الخام لـ`onCreate` |

ما عدا `NewOrderModal` (اللي بيستخدم الهوك) و`KanbanColumn` (حالة التظليل بس)، كلهم بياخدوا البيانات والدوال كـprops. أيقونات طرق الدفع في `constants/orderPaymentIcons.ts` وتسميات الوقت في `constants/orderTimeFilters.ts`.

## مكونات `settings/` (شاشة الإعدادات)

| المكوّن | الوظيفة |
|---|---|
| `SettingsMenu` | قايمة الأقسام العشرة (عنوان + زرار لكل قسم بحركة دخول متدرّجة) |
| `SectionHeader` | رأس القسم المفتوح: زرار الرجوع وأيقونة القسم وعنوانه (من `SettingsSection`) |
| `SectionPanel` | غلاف القسم وحركة دخوله: `slide` للنماذج و`rise` للوحات الأخف |
| `SettingToggle` | مفتاح التبديل (كبسولة)؛ من غير `label` بيملأ الصف فراغًا |
| `SaveBar` / `SavedNotice` | زرار "حفظ التغييرات" وفقاعة "تم الحفظ بنجاح" |
| `StoreSettingsSection` / `InvoiceSettingsSection` | نموذجا المتجر والفاتورة: بياخدوا القيم و`onChange` من الصفحة (`useDraft`) |
| `ReceiptSettingsSection` + `ReceiptPreview` | بيانات الإيصال ومفاتيح ما يظهر وحقل الشعار (يظهر لما الشعار شغّال) والمعاينة الحية؛ بيقروا `useAppSettings` |
| `StaffSettingsSection` + `StaffMemberCard` | عدّاد كل دور وبطاقة لكل موظف (props بس) |
| `PaymentMethodsSection` | صف لكل طريقة دفع بمفتاحها؛ بيقرا `useAppSettings` |
| `BranchesInventorySection` | مفتاح "أكثر من فرع" وتوابعه وحدّ المخزون المنخفض؛ بيقرا `useAppSettings` وبياخد الفروع كـprop |
| `ShiftsSettingsSection` / `AppearanceSection` | رابط الورديات (`useNavigate`) ومفتاح الوضع الليلي (`useTheme`) |

الصفحة هي اللي بتحمّل الموظفين والفروع (مرة واحدة) وبتحتفظ بالنموذجين ورسالة الحفظ؛ الأقسام بتقرا الباقي من سياقاتها. الثوابت: `constants/settingsSections.ts` و`constants/receiptFields.ts` و`constants/receiptPreview.ts`.

## مكونات `returns/` (شاشة المرتجعات)

| المكوّن | الوظيفة |
|---|---|
| `ReturnCard` | طلب المرتجع كبطاقة (ديسكتوب) |
| `ReturnListRow` | طلب المرتجع كصف مسطّح (موبايل) |
| `CreateReturnModal` | نموذج "مرتجع جديد": بياخد حالته من `hooks/useReturnForm` ويبعت المدخلات الخام لـ`onCreate` |
| `ReturnItemsPicker` | منتجات النموذج: علامة وخانة كمية لكل منتج (props بس) |

ما عدا `CreateReturnModal` (اللي بيستخدم الهوك)، كلهم بياخدوا البيانات والدوال كـprops.

## `AppToaster`

الحاوية الوحيدة اللي بتعرض رسائل `toast` (مثبّتة في `App.tsx`). **لو اتشالت، كل رسائل التنبيه في التطبيق بتختفي من غير أي خطأ.** بتستخدم ألوان `--vuno-*`، مش مكوّن `components/ui/sonner.tsx` (متغيراته HSL مجردة مش ألوان صالحة هنا).

## `RequireAuth`

حارس المسارات. بيتحط كـ`<Route element={<RequireAuth />}>` حوالين أي مسار خاص في `App.tsx` (كل المسارات ما عدا `/` و`/login` وصفحة الفاتورة العامة). اللي ما عندوش جلسة بيتحوّل لـ`/login`. **ده مش حد أمان طول ما تسجيل الدخول محاكاة** (البيانات في المتصفح).

## `ErrorBoundary` / `ErrorFallback` / `RouteErrorBoundary`

بدونهم أي خطأ رندر بيفضّي التطبيق كله لشاشة بيضا. `ErrorBoundary` (كلاس، لأن React مفيهاش hook لده) بيستبدل الجزء اللي وقع بـ`renderFallback(reset)`، وبيحاول تاني لوحده لما `resetKey` يتغيّر. `ErrorFallback` هو الشكل الموحد (رسالة + "حاول مرة أخرى" + "تحديث الصفحة"). `RouteErrorBoundary` بيربطهم ويستخدم المسار كـ`resetKey`، فالانتقال لصفحة تانية بيصلّحها. متحط في مكانين: حوالين `<Outlet />` جوه `AppLayout` (عشان القايمة تفضل شغالة لو صفحة وقعت)، وحوالين `<Suspense>` في `App.tsx` كشبكة أمان (وبتمسك فشل تحميل جزء الصفحة بعد نشر جديد).

## مكونات `login/`

`LoginForm` (نموذج واحد بـ `variant="mobile" | "desktop"`)، `LoginModeSwitcher`، `SignUpToggle`.

## إضافة مكوّن مشترك جديد

1. أنشئ `src/components/XxxComponent.tsx` بمكوّن افتراضي.
2. أضف توثيق JSDoc فوق تعريف المكوّن.
3. أضفه إلى هذا الفهرس (`docs/COMPONENTS.md`).
4. أنشئ ملف توثيق مفصل في `docs/components/XxxComponent.md` (إذا كان معقدًا).
5. استورده في الصفحات التي تحتاجه.
6. تأكد من أن المكوّن لا يُصدّر غير المكوّنات (أو أضف `// eslint-disable-next-line react-refresh/only-export-components` فوق أي تصدير غير مكوّن).
