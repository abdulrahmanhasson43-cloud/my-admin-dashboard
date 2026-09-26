# 📁 شرح ملفات الجزء 4 — أفكار النمو والتحليلات (#31–40)

> **المشروع:** Vuno — نظام إدارة المتاجر ونقاط البيع  
> **الجزء:** 4 (Part 4) — Growth & Analytics  
> **عدد الأفكار:** 10 (من #31 إلى #40)

هذا المستند يشرح كل ملف جديد أو مُحدَّث في الجزء 4، مع توضيح الغرض، الصادرات (exports)، والاستخدام. جميع الملفات مبنية فوق المشروع الأصلي دون حذف أو كسر أي وظيفة قائمة.

---

## 📐 أولاً: ملفات الأنواع (Types)

### `src/types/analytics.ts`

يحتوي على الأنواع الخاصة بالميزات التحليلية (#31، #32، #33، #40).

**الصادرات:**

- `IconComponent` — نوع مرجع لأيقونات المشروع (`React.FC<{ className?: string; size?: number }>`)، متوافق مع نظام الأيقونات في `@/components/icons`.
- `HeatmapCell` — خلية واحدة في الخريطة الحرارية: `{ day, hour, invoiceCount, totalSales, isPeak }`.
- `HeatmapInsights` — رؤى مستخرجة: `{ peakSlot, weakSlot, peakDay, weakDay }` (كل منها `{ label, value, icon }`).
- `HeatmapData` — الحزمة الكاملة: `{ cells: HeatmapCell[][], insights: HeatmapInsights }`.
- `DAYS_AR` — مصفوفة أيام الأسبوع بالعربية: `['السبت', 'الأحد', ...]`.
- `HOURS_RANGE` — نطاق الساعات من 8 صباحاً إلى 10 مساءً (`Array.from({ length: 15 }, (_, i) => i + 8)`).
- `PerformerProduct` — منتج في قائمة الأفضل/الأسوأ: `{ id, name, image, quantitySold, revenue, category }`.
- `PerformersData` — `{ top: PerformerProduct[], bottom: PerformerProduct[] }`.
- `PeriodMetrics` — مقاييس فترة: `{ revenue, invoices, profit, expenses, products: PerformerProduct[] }`.
- `ProductDelta` — تغير منتج بين فترتين: `{ id, name, currentQty, previousQty, changePercent, trend }`.
- `CompareResult` — نتيجة المقارنة: `{ current, previous, deltas: ProductDelta[] }`.
- `PriceHistoryPoint` — نقطة سعر: `{ date, supplier, price }`.
- `PriceInsight` — رؤية سعر: `{ cheapest, mostExpensive, average, changePercent }`.
- `PriceHistoryData` — `{ chartData, insight, cheapestSupplier }`.

### `src/types/loyalty.ts`

يحتوي على أنواع نظام الولاء (#36) وقيمة العميل (#35).

**الصادرات:**

- `CustomerTier` — `'vip' | 'excellent' | 'regular' | 'dormant'`.
- `CustomerCLV` — بيانات قيمة العميل: `{ totalSpent, invoiceCount, avgInvoice, firstPurchase, lastPurchase, monthsActive, tier }`.
- `TierMeta` — بيانات الفئة: `{ label, color, bgColor, icon }`.
- `tierMeta` — سجل بيانات الفئات الأربع.
- `getTierMeta(clv, lastPurchaseDate)` — دالة تحدد الفئة بناءً على القيمة وتاريخ آخر شراء.
- `LoyaltyLevel` — `'bronze' | 'silver' | 'gold' | 'platinum'`.
- `LoyaltyLevelMeta` — `{ level, label, minPoints, color, icon }`.
- `loyaltyLevels` — مصفوفة المستويات الأربعة بحدودها.
- `getLoyaltyLevel(points)` — تُرجع المستوى الحالي.
- `getNextLoyaltyLevel(points)` — تُرجع المستوى التالي أو `null` إذا كان في الأعلى.
- `PointsEarnTransaction` — `{ id, invoiceId, points, date }`.
- `PointsRedeemTransaction` — `{ id, reward, pointsSpent, date }`.
- `RewardType` — `'discount_50' | 'discount_120' | 'free_product'`.
- `RewardOption` — `{ type, label, pointsCost, value, icon }`.
- `rewardOptions` — مصفوفة خيارات الاستبدال الثلاثة.
- `LoyaltySummary` — `{ currentPoints, redeemedPoints, totalEarned, level, nextLevel, progress }`.

### `src/types/bundle.ts`

يحتوي على أنواع الباقات (#37).

**الصادرات:**

- `BundleItem` — `{ productId, name, price, quantity }`.
- `Bundle` — `{ id, name, description, items: BundleItem[], originalPrice, discountedPrice, active, createdAt }`.
- `calcOriginalPrice(items: BundleItem[])` — مجموع أسعار عناصر الباقة (تأخذ مصفوفة عناصر، وليس كائن Bundle).
- `calcSavings(bundle: Bundle)` — الفرق بين `originalPrice` و`discountedPrice`.
- `calcDiscountPercent(bundle: Bundle)` — نسبة الخصم المحسوبة.

> **ملاحظة:** كائن `Bundle` لا يحتوي على خاصية `discountPercent` — استخدم `calcDiscountPercent(bundle)` لحسابها.

### `src/types/flashSale.ts`

يحتوي على أنواع عروض الفلاش (#38).

**الصادرات:**

- `FlashSale` — `{ id, productName, originalPrice, discountedPrice, totalQty, soldQty, endsAt, active }`.
- `isFlashSaleActive(sale)` — تحقق إذا كان العرض نشطاً (ضمن الوقت والكمية).
- `remainingQty(sale)` — الكمية المتبقية.
- `saleProgress(sale)` — نسبة التقدم (0–100).
- `Countdown` — `{ hours, minutes, seconds, isExpired }`.
- `getRemaining(endIso)` — حساب الوقت المتبقي حتى تاريخ انتهاء ISO.

### `src/types/purchaseOrder.ts` (مُحدَّث)

أُضيفت أنواع جديدة فوق الأنواع الأصلية دون تعديلها.

**الصادرات الجديدة:**

- `PurchaseOrderStatus` — `'ordered' | 'in_transit' | 'arrived' | 'inspecting' | 'received'`.
- `PurchaseOrderItem` — `{ productId, name, quantity, unitPrice }`.
- `PurchaseOrderKanban` — `{ id, supplier, date, expectedDelivery, items, total, status }`.
- `PurchaseOrderStatusMeta` — `{ label, color, bgColor, borderColor, icon, emoji }`.
- `purchaseOrderStatuses` — مصفوفة المراحل الخمس بترتيبها.

> **الأصل محفوظ:** واجهة `PurchaseOrder` الأصلية لم تُمسَّ.

---

## 🗃️ ثانياً: ملفات البيانات الوهمية (Mock Data)

### `src/services/mock/analytics.ts`

يولّد بيانات وهمية للتحليلات.

**الصادرات:**

- `heatmapCells` — مصفوفة ثنائية الأبعاد من `HeatmapCell` (7 أيام × 15 ساعة) مولّدة عبر `generateHeatmapCells()`.
- `topPerformers` — أفضل 5 منتجات مبيعاً.
- `bottomPerformers` — أسوأ 5 منتجات.
- `periodData` — سجل مقاييس لعدة فترات (شهور) بمفتاح رمز الشهر.
- `availablePeriods` — مفاتيح الفترات مرتبة تنازلياً.
- `priceSuppliers` — قائمة الموردين الثلاثة: مؤسسة الإكسسوارات، شركة التقنية الحديثة، مصر للكمبيوتر.
- `mockPriceHistory` — سجل نقاط سعر لكل منتج بمفتاح معرف المنتج.

### `src/services/mock/loyalty.ts`

بيانات نظام نقاط الولاء.

**الصادرات:**

- `pointsEarned` — سجل عمليات كسب النقاط.
- `pointsRedeemed` — سجل عمليات الاستبدال.
- `getClientPoints(clientId)` — النقاط الحالية للعميل (المكتسب ناقص المستبدل).
- `getLoyaltySummary(clientId)` — ملخص كامل: نقاط حالية، مستبدلة، إجمالي، مستوى، مستوى تالٍ، تقدم.
- `calcInvoicePoints(amount)` — حساب نقاط فاتورة (1 جنيه = 0.1 نقطة، أي `Math.round(amount * 0.1)`).

### `src/services/mock/bundles.ts`

بيانات الباقات الوهمية.

**الصادرات:**

- `sampleBundles` — 3 باقات جاهزة (مثل "الباقة الذكية" و"باقة الإكسسوارات").

### `src/services/mock/flashSales.ts`

بيانات عروض الفلاش.

**الصادرات:**

- `sampleFlashSales` — عرضان وهميان.
- `activeFlashSale` — العرض النشط حالياً (أول عرض نشط في القائمة).

### `src/services/mock/purchaseOrders.ts` (مُحدَّث)

أُضيفت بيانات الكانبان فوق البيانات الأصلية.

**الصادرات الجديدة:**

- `samplePurchaseKanbanOrders` — أوامر شراء بتنسيق كانبان (`PurchaseOrderKanban[]`) موزعة على المراحل الخمس.

> **ملاحظة:** سُمّيت `samplePurchaseKanbanOrders` (وليس `sampleKanbanOrders`) لتجنب التعارض مع `sampleKanbanOrders` الموجودة في `orders.ts` (نوع `Order[]`).

### `src/services/mock/index.ts` (مُحدَّث)

أُضيفت تصديرات للملفات الأربعة الجديدة: `analytics`، `loyalty`، `bundles`، `flashSales`.

---

## 🔢 ثالثاً: الدوال النقية

### `src/lib/analytics.ts`

مكتبة دوال نقية (pure functions) للحسابات التحليلية. لا تعتمد على أي حالة (state) ويمكن اختبارها بمعزل.

**الصادرات:**

- `buildHeatmap(invoices: Invoice[])` — يبني `HeatmapData` من قائمة فواتير حقيقية.
- `extractHeatmapInsights(cells)` — يستخرج أقوى/أضعف وقت ويوم من الخلايا.
- `buildPerformers(sales, topN=5)` — يبني `PerformersData` من مبيعات مكتملة.
- `mergePerformersWithChange(current, previous)` — يدمج قائمتين ويحسب نسبة التغير.
- `comparePeriods(current, previous)` — يقارن فترتين ويُرجع `CompareResult`.
- `computeCLV(activities, client)` — يحسب `CustomerCLV` من أنشطة العميل.
- `computeMonthsActive(startDate, endDate)` — عدد الأشهر بين تاريخين.
- `forecastCLV(clv, futureMonths=12)` — تنبؤ بالقيمة المستقبلية.
- `buildPriceHistory(points)` — يبني `PriceHistoryData` من نقاط السعر.
- `filterPriceBySupplier(points, suppliers)` — يفلتر النقاط حسب الموردين المحددين.
- `findCheapestSupplier(points)` — يجد المورد الأرخص ومتوسط السعر.

---

## 🧩 رابعاً: المكونات (Components)

### `src/components/analytics/SalesHeatmap.tsx` — #31

خريطة حرارية CSS Grid. الأعمدة = الساعات، الصفوف = أيام الأسبوع. كل خلية ملوّنة حسب شدة المبيعات. Hover يعرض تفاصيل الخلية. رؤى تلقائية أسفل الشبكة.

**الخصائص (Props):** `{ data: HeatmapData; title?: string }`

### `src/components/analytics/TopPerformers.tsx` — #32

قائمتان: أفضل 5 (بطاقات خضراء بشارة "رائج") وأسوأ 5 (بطاقات حمراء بتنبيه). كل بطاقة تعرض الاسم والكمية والإيراد ونسبة التغيير.

**الخصائص:** `{ data: PerformersData; title?: string }`

### `src/components/analytics/PeriodComparison.tsx` — #33

مقارنة فترتين. قائمتان منسدلتان للاختيار، بطاقات مقارنة (مبيعات، فواتير، ربح، خسائر) بنسب ملوّنة، رسم عمودي (BarChart) للمقارنة اليومية، وقسم للمنتجات التي زادت/قلت.

**الخصائص:** `{ availablePeriods: string[]; periodData: Record<string, PeriodMetrics>; productsByPeriod?: Record<string, PerformerProduct[]>; title?: string }`

### `src/components/analytics/ActivityFeed.tsx` — #34

تغذية أنشطة حية. قائمة قابلة للتمرير، كل نشاط = بطاقة بأيقونة ونص ووقت نسبي وزر "عرض". إذا لم تُمرَّر `activities`، يستخدم `ActivityLogContext` تلقائياً.

**الخصائص:** `{ activities?: ActivityEntry[]; maxItems?: number; title?: string; compact?: boolean }`

### `src/components/analytics/PriceHistoryChart.tsx` — #40

مخطط خطي (LineChart) لأسعار منتج عبر الموردين. أزرار فلترة للموردين، tooltip تفاعلي، رؤى تلقائية (أرخص/أغلى/متوسط/نسبة التغيير).

**الخصائص:** `{ points: PriceHistoryPoint[]; suppliers: string[]; productName?: string; title?: string }`

### `src/components/customers/CustomerCLV.tsx` — #35

بطاقة قيمة العميل مدى الحياة. تعرض الإجمالي، عدد الفواتير، المتوسط، تواريخ أول/آخر شراء، مدة العلاقة، وشارة الفئة (VIP/ممتاز/عادي/خامل). يدعم وضع `compact` للصف المختصر.

**الخصائص:** `{ client: Client; activities?: { type: string; amount?: number; date: string }[]; variant?: 'full' | 'compact' }`

### `src/components/loyalty/LoyaltySystem.tsx` — #36

نظام نقاط الولاء. يعرض النقاط الحالية والمستبدلة والإجمالي، شريط تقدم نحو المستوى التالي، المستوى الحالي، خيارات الاستبدال، وسجل الكسب والاستبدال.

**الخصائص:** `{ summary: LoyaltySummary; clientId?: string; earnedHistory?: ...[]; redeemedHistory?: ...[]; onRedeem?: (reward: RewardOption) => void; title?: string }`

### `src/components/bundles/BundleBuilder.tsx` — #37

منشئ ومدير الباقات. عرض شبكي للباقات الحالية، نموذج إنشاء باقة (اختيار منتجات، سعر مخفض، اسم، وصف)، حذف وتفعيل/تعطيل.

**الخصائص:** `{ bundles: Bundle[]; products: Product[]; onCreate?: (b: Bundle) => void; onDelete?: (id: string) => void; onToggle?: (id: string) => void; title?: string }`

### `src/components/flash/FlashSales.tsx` — #38

عروض الفلاش. يدعم وضعين: `full` (قائمة كاملة ببطاقات) و`banner` (شريط علوي واحد). عد تنازلي حي، شريط تقدم، السعر الأصلي والمخفض والتوفير.

**الخصائص:** `{ sales: FlashSale[]; variant?: 'full' | 'banner'; onSelect?: (s: FlashSale) => void; title?: string }`

### `src/components/purchases/PurchaseOrderKanban.tsx` — #39

لوحة كانبان لأوامر الشراء. 5 أعمدة (المراحل)، بطاقات قابلة للنقل للأمام/الخلف، عرض العناصر والمورد والمبلغ. يستخدم `AnimatePresence` من framer-motion للحركات.

**الخصائص:** `{ orders: PurchaseOrderKanban[]; onAdvance?: (id: string) => void; onMoveBack?: (id: string) => void; onSelect?: (o: PurchaseOrderKanban) => void; title?: string }`

---

## 📄 خامساً: الصفحات

### `src/pages/AnalyticsPage.tsx` (جديد)

صفحة جديدة تستضيف 5 مكونات تحليلية: `SalesHeatmap`، `TopPerformers`، `PeriodComparison`، `PriceHistoryChart`، `ActivityFeed`. تستخدم `useMemo` لبناء البيانات المشتقة (خلايا الخريطة + الرؤى، بيانات الأداء، تاريخ السعر للمنتج المحدد). تتضمن محدد منتج لقسم تاريخ الأسعار. إحصائيات ملخصة عبر `StatsRow`. المسار: `/analytics`.

### `src/pages/BundlesPage.tsx` (جديد)

صفحة جديدة تستضيف `BundleBuilder`. تستخدم سياق `useProducts` مع `sampleProducts` كبديل. حالة محلية للباقات مع `handleCreate`/`handleDelete`/`handleToggle`. إحصائيات ملخصة (عدد الباقات النشطة، إجمالي التوفير، متوسط الخصم). المسار: `/bundles`.

### `src/pages/DashboardPage.tsx` (مُحدَّث)

أُضيفت 4 أقسام جديدة بعد `AIInsightsWidget`:
1. لافتة `FlashSales` (#38).
2. `SalesHeatmap` (#31).
3. `TopPerformers` (#32).
4. `ActivityFeed` (#34) — يستهلك `activities` من `useActivityLog`.

> جميع الأقسام الأصلية محفوظة كما هي.

### `src/pages/POSPage.tsx` (مُحدَّث)

أُضيفت:
- لافتة `FlashSales` (variant="banner") قبل قسم المنتجات.
- قسم عروض الباقات بتمرير أفقي يضيف منتجات الباقة للسلة بنقرة (#37).
- توقيع نقاط الولاء في منطقة إجماليات السلة — يظهر عند اختيار عميل مسجل وسلة غير فارغة، يعرض `calcInvoicePoints(total)` نقطة (#36).

> جميع وظائف نقطة البيع الأصلية محفوظة.

### `src/pages/ClientsPage.tsx` (مُحدَّث)

أُضيفت للوحة العميل الجانبية:
- تبويب `loyalty` جديد في `SidePanelTab`.
- يعرض `CustomerCLV` (مع `activities={purchaseActivities}`) و`LoyaltySystem` (مع `summary={getLoyaltySummary(client.id)}`).

> التبويبات الأصلية (المشتريات، النشاط، إلخ) محفوظة.

### `src/pages/PurchaseOrdersPage.tsx` (مُحدَّث)

أُضيفت:
- حالة `view` للتبديل بين `'list'` و`'kanban'`.
- أزرار تبديل العرض (قائمة/كانبان).
- عرض الكانبان يُصرِّح `PurchaseOrderKanban` مع `samplePurchaseKanbanOrders`.
- معالجات `advance`/`moveBack` باستخدام `statusOrder`.

> عرض القائمة الأصلي (سطح المكتب + بطاقات الجوال) محفوظ تماماً.

---

## 🧭 سادساً: التنقّل والتوجيه

### `src/constants/navigation.ts` (مُحدَّث)

- أُضيفت `PackageIcon` لاستيراد الأيقونات.
- عنصر تنقّل **التحليلات** (`/analytics`، أيقونة `TrendingUpIcon`) قبل التقارير.
- عنصر تنقّل **الباقات** (`/bundles`، أيقونة `PackageIcon`) بعد أوامر الشراء.
- عناوين الصفحات لـ `/analytics` و`/bundles` في `pageTitles`.

### `src/App.tsx` (مُحدَّث)

- استيراد كسول (lazy) لـ `AnalyticsPage` و`BundlesPage`.
- مساران جديدان `/analytics` و`/bundles` قبل مسار `/more`.

---

## ✅ سابعاً: التحقق

- `npm run build` يمر بـ **0 أخطاء** (TypeScript strict + Vite).
- جميع الميزات العشر مُدمجة في الصفحات الموجودة والجديدة.
- لا توجد وظيفة أصلية محذوفة أو مكسورة.
- البيانات الوهمية قابلة للاستبدال بواجهة برمجية حقيقية لاحقاً دون تغيير المكونات.

---

*تم إعداد هذا المستند كجزء من توثيق الجزء 4 (Part 4) لمشروع Vuno.*
