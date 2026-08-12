# تقرير التغييرات — الجزء الثاني (10 أفكار جديدة)
## مشروع Vuno — نظام إدارة المتاجر

**التاريخ:** أغسطس 2025  
**الإصدار:** Part 2 — 10 Features Enhancement  
**الحالة:** مكتمل ✅ (tsc --noEmit + vite build ناجح)

---

## ملخص تنفيذي

تمت إضافة 10 ميزات/تحسينات جديدة إلى مشروع Vuno وفقاً لتقرير التطوير الجزء الثاني. تشمل الميزات: 4 صفحات جديدة بالكامل، 6 تحسينات لصفحات موجودة، وسياق جديد (BranchContext) مع تكامل في شريط التطبيق العلوي. جميع التعديلات متوافقة 100% مع الكود الموجود، واجتازت فحص TypeScript (`tsc --noEmit`) بدون أخطاء، والبناء الإنتاجي (`vite build`) بنجاح.

---

## قائمة التغييرات التفصيلية

### 1. صفحة الطلبات — OrdersPage (Kanban Board) [جديد]
**الملفات:**
- `src/pages/OrdersPage.tsx` (جديد — 19,309 bytes)
- `src/types/order.ts` (جديد)
- `src/services/mock/orders.ts` (جديد — تمت إعادة تسمية export إلى `sampleKanbanOrders` لتجنب تعارض الأسماء)

**الميزات:**
- لوحة Kanban بـ 4 أعمدة (جديد → قيد التنفيذ → جاهز → مكتمل)
- نظام Drag & Drop باستخدام HTML5 API الأصلي (بدون مكتبات خارجية)
- بطاقات طلبات تفاعلية مع: رقم الطلب، اسم العميل، المبلغ، عدد العناصر
- فلترة حسب الحالة (الكل / اليوم / هذا الأسبوع)
- إحصائيات سريعة (إجمالي الطلبات، قيد التنفيذ، مكتملة، الإيرادات)
- بحث فوري في الطلبات
- تأثيرات حركية مع Framer Motion (animate على البطاقات)

---

### 2. صفحة المخزون — InventoryPage (Visual Two-Panel) [تحسين]
**الملفات:**
- `src/pages/InventoryPage.tsx` (مُعدَّل)
- `src/context/ProductsContext.tsx` (مُعدَّل — إضافة `transferHistory` + `TransferHistoryEntry`)
- `src/context/products-context-value.ts` (مُعدَّل — إضافة `transferHistory` و `TransferHistoryEntry` interface)

**الميزات المضافة:**
- **زر تبديل العرض:** قائمة المنتجات ↔ نقل بصري
- **لوحة المستودع (يسار):** بطاقات منتجات قابلة للسحب (HTML5 draggable) مع شارات مخزون ملونة وأزرار نقل سريع
- **لوحة المتجر (يمين):** منطقة إفلات (drop target) تضيء عند السحب، تعرض المخزون الحالي مع تلوين انخفاض المخزون
- **سجل عمليات النقل (Timeline):** عرض زمني لآخر 30 عملية نقل مع نقاط متصلة، اسم المنتج، الكمية، والتوقيت
- **نقل سريع:** زر سهم ينقل قطعة واحدة فوراً مع إشعار toast
- **احترام إعداد التأكيد:** إذا كان "النقل بين الفروع تحتاج تأكيد" مفعّل، يُرسل الطلب للقائمة المعلقة بدلاً من التنفيذ الفوري
- تتبع تاريخ النقل في `ProductsContext` (يُحفظ في state مع حد أقصى 30 إدخال)

---

### 3. صفحة العملاء — ClientsPage (Cards + Side Panel + Timeline) [تحسين]
**الملفات:**
- `src/pages/ClientsPage.tsx` (إعادة كتابة كاملة — 28,031 bytes)
- `src/services/mock/clients.ts` (مُعدَّل — إضافة `ClientActivity` interface و `clientActivities` array بـ 27 إدخال)

**الميزات المضافة:**
- **شبكة بطاقات موحدة** على جميع الأجهزة (كانت: جدول على الديسكتوب، بطاقات على الموبايل — الآن: شبكة بطاقات `sm:grid-cols-2 lg:grid-cols-3`)
- **لوحة جانبية منزلقة** (Side Panel) بـ 3 تبويبات:
  - **تبويب الملف:** إحصائيات سريعة، معلومات الاتصال، خط زمني للنشاط (activity timeline) مع نقاط ملونة حسب نوع النشاط
  - **تبويب المشتريات:** صافي الإنفاق، قائمة عمليات الشراء/الاسترجاع مع المبالغ
  - **تبويب التواصل:** روابط واتساب، اتصال هاتفي، بريد إلكتروني، شارة VIP للعملاء فوق 20,000 ج.م، سجل المكالمات الأخيرة
- **شارة VIP** (نجمة ذهبية) على بطاقات العملاء الذين تجاوزت مشترياتهم 20,000 ج.م
- **إحصائية رابعة:** عدد عملاء VIP
- النقر على البطاقة يفتح اللوحة الجانبية، أزرار الإجراءات تستخدم `stopPropagation`

---

### 4. صفحة الفواتير — InvoicePage (Invoice Builder) [تحسين]
**الملفات:**
- `src/pages/InvoicePage.tsx` (إعادة كتابة — 15,022 bytes)

**الميزات المضافة:**
- **منشئ الفواتير التفاعلي** (Side Panel منزلق من اليمين):
  - اختيار العميل من قائمة (مع عرض البريد الإلكتروني وإجمالي المشتريات)
  - بحث عن المنتجات بالاسم أو الباركود + إضافة بنقرة واحدة
  - عناصر الفاتورة مع تحكم في الكمية (+/-) وحذف كل عنصر
  - اختيار نسبة الخصم (0% / 5% / 10% / 15% / 20%)
  - اختيار طريقة الدفع (كاش / بطاقة / محفظة / إنستاباي / Apple Pay) مع أيقونات
  - **ملخص حي:** المجموع الفرعي، الخصم، ضريبة القيمة المضافة (14%)، الإجمالي — يتحدث فورياً
  - أزرار: حفظ الفاتورة، طباعة (window.print)، مسح
  - إشعارات toast عند إضافة منتج/حفظ الفاتورة
- جميع الوظائف الموجودة محفوظة: القائمة، الفلترة، التصدير، نافذة التفاصيل، QR Code

---

### 5. صفحة المصروفات — ExpensesPage (Calendar View + Pie Chart) [تحسين]
**الملفات:**
- `src/pages/ExpensesPage.tsx` (إعادة كتابة كاملة — 33,136 bytes)

**الميزات المضافة:**
- **زر تبديل العرض:** تقويم ↔ قائمة (الافتراضي: تقويم)
- **عرض التقويم:**
  - شبكة شهرية مع أيام الأسبوع
  - التنقل بين الأشهر (سابق / تالي)
  - نقاط ملونة لكل فئة مصروف في اليوم (حد أقصى 4 نقاط)
  - إجمالي مصاريف اليوم معروض أسفل كل خلية
  - تمييز اليوم الحالي
  - مفتاح ألوان الفئات
- **لوحة اليوم الجانبية** (Side Panel):
  - ملخص إجمالي اليوم
  - **مخطط دائري (Pie Chart)** باستخدام Recharts يعرض توزيع المصروفات حسب الفئة
  - قائمة مصروفات اليوم بالتفصيل
- جميع الوظائف الموجودة محفوظة: النموذج، الفلاتر، التصدير، الإحصائيات، عرض القائمة

---

### 6. صفحة الإعدادات — SettingsPage (Users Tab Enhancement) [تحسين]
**الملفات:**
- `src/pages/SettingsPage.tsx` (مُعدَّل — تبويب الموظفين)

**الميزات المضافة لتبويب الموظفين:**
- **إحصائيات الأدوار:** 3 بطاقات تعرض عدد كل دور (المالك/مدير/موظف) مع أيقونات ملوّنة حسب دور
- **زر "إضافة موظف جديد"** بحدود متقطعة (dashed border)
- **بطاقات المستخدمين** (بدلاً من قائمة مسطحة):
  - صورة رمزية (avatar) ملوّنة حسب الدور مع الحرف الأول من الاسم
  - اسم الموظف + شارة الدور ملوّنة
  - رقم الهاتف مع أيقونة
  - اسم الفرع مع أيقونة
  - شارة الحالة (نشط/غير نشط)
  - وقت آخر نشاط
  - زر تعديل

---

### 7. صفحة الملف الشخصي — ProfilePage (Store Branding) [جديد]
**الملفات:**
- `src/pages/ProfilePage.tsx` (جديد — 23,616 bytes)
- `src/types/profile.ts` (جديد — UserProfile, StoreBranding, UsageStat, SubscriptionInfo, ColorPreset)
- `src/services/mock/profile.ts` (جديد — defaultUserProfile, defaultStoreBranding, defaultSubscription)

**الميزات:**
- **بطاقة هوية المتجر (Store Branding):**
  - رفع شعار (FileReader → base64)
  - اسم المتجر ووصف مختصر
  - منتقي ألوان الهوية (8 إعدادات مسبقة من `brandColorPresets`)
  - معاينة حية (Brand Preview) ببطاقة متدرجة الألوان تعرض الشعار أو الحروف الأولى
- **بطاقة البيانات الشخصية:**
  - رفع صورة شخصية
  - حقول: الاسم، البريد، الهاتف
  - عرض الدور
  - قسم تغيير كلمة المرور مع إظهار/إخفاء
- **بطاقة الاشتراك:**
  - شارة الخطة الحالية
  - تاريخ التجديد
  - أشرطة استخدام متحركة (UsageBar) — أخضر < 80%، أصفر ≥ 80%
  - زر ترقية
- أزرار حفظ وتسجيل خروج في الأسفل

---

### 8. صفحة المرتجعات — ReturnsPage (Returns Manager) [جديد]
**الملفات:**
- `src/pages/ReturnsPage.tsx` (جديد — 17,083 bytes)
- `src/types/return.ts` (جديد — ReturnRequest, ReturnItem, ReturnStatus, ReturnReason, ReturnType)
- `src/services/mock/returns.ts` (جديد)

**الميزات:**
- تبويبان: مرتجعات العملاء / مرتجعات الموردين
- بطاقات المرتجعات مع: رقم المرتجع، اسم العميل/المورد، المبلغ، السبب، الحالة
- فلترة حسب الحالة (الكل / قيد المراجعة / تمت الموافقة / مرفوض / مكتمل)
- **نافذة إنشاء مرتجع** (modal): اختيار المنتج، الكمية، السبب، النوع (استبدال/استرجاع نقدي)
- إحصائيات: إجمالي المرتجعات، قيد المراجعة، مكتملة، إجمالي القيمة
- بحث فوري

---

### 9. سياق الفروع — BranchContext + Branch Switcher [جديد]
**الملفات:**
- `src/context/BranchContext.tsx` (جديد)
- `src/context/branch-context-value.ts` (جديد — BranchContextValue interface + `useBranch` hook)
- `src/services/mock/branches.ts` (جديد — sampleBranches)
- `src/types/branch.ts` (جديد — Branch interface)
- `src/App.tsx` (مُعدَّل — إضافة BranchProvider)

**الميزات:**
- إدارة حالة الفرع النشط عبر Context API
- **حفظ في localStorage** — الفرع النشط يُستعاد بعد تحديث الصفحة
- واجهات: `branches`, `activeBranchId`, `activeBranch`, `setActiveBranchId`, `addBranch`, `updateBranch`, `toggleBranchStatus`
- ترتيب الـ Providers: ThemeProvider > **BranchProvider** > AppSettingsProvider > ...

---

### 10. صفحة الفروع — BranchesPage (Branch Switcher) + شريط التطبيق [تحسين]
**الملفات:**
- `src/pages/BranchesPage.tsx` (مُعدَّل — تكامل مع BranchContext)
- `src/components/AppLayout.tsx` (مُعدَّل — إضافة Branch Switcher إلى Topbar)

**الميزات المضافة في BranchesPage:**
- **لافتة الفرع النشط** أعلى تبويب الفروع تعرض الفرع الحالي مع العنوان وشارة "نشط"
- **تمييز بطاقة الفرع النشط** بإطار وحلقة باللون الأساسي
- **شارة "الفرع النشط"** على البطاقة النشطة
- **زر "تعيين كفرع نشط"** على الفروع غير النشطة للتبديل
- إشعار toast عند التبديل

**الميزات المضافة في AppLayout (Topbar):**
- **مبدّل الفروع** (Branch Switcher) في شريط التطبيق العلوي:
  - زر يعرض اسم الفرع النشط مع أيقونة وسهم
  - قائمة منسدلة بكل الفروع
  - الفرع النشط مميّز بنقطة خضراء وخلفية ملوّنة
  - إشعار toast عند التبديل
  - يختفي على الموبايل للحفاظ على نظافة الشريط

---

## البنية التحتية والأنواع

### ملفات الأنواع الجديدة (Types)
| الملف | المحتوى |
|------|---------|
| `src/types/order.ts` | `Order`, `OrderItem`, `OrderStatus`, `OrderTimelineEntry` |
| `src/types/return.ts` | `ReturnRequest`, `ReturnItem`, `ReturnStatus`, `ReturnReason`, `ReturnType` |
| `src/types/profile.ts` | `UserProfile`, `StoreBranding`, `UsageStat`, `SubscriptionInfo`, `ColorPreset`, `brandColorPresets` |
| `src/types/branch.ts` | `Branch` |

### ملفات البيانات الوهمية الجديدة (Mock Data)
| الملف | المحتوى |
|------|---------|
| `src/services/mock/orders.ts` | `sampleKanbanOrders` (طلبات Kanban) |
| `src/services/mock/returns.ts` | بيانات المرتجعات |
| `src/services/mock/profile.ts` | `defaultUserProfile`, `defaultStoreBranding`, `defaultSubscription` |
| `src/services/mock/branches.ts` | `sampleBranches` |
| `src/services/mock/clients.ts` | `ClientActivity` + `clientActivities` (27 إدخال) — **مُعدَّل** |

### الأيقونات الجديدة
`OrdersIcon`, `ReturnsIcon`, `ProfileIcon`, `KanbanIcon`, `TruckIcon`, `RefundIcon`, `PaletteIcon`, `DragHandleIcon`, `WhatsAppIcon`, `PrintIcon`, `TagIcon`, `StarIcon` — في `src/components/icons/index.tsx`

### سياق جديد
`BranchContext` + `BranchProvider` — مع حفظ في localStorage

### التوجيه (Routing)
- `src/App.tsx`: مسارات جديدة `/orders`, `/returns`, `/profile` مع lazy loading
- `src/constants/navigation.ts`: عناصر التنقل للطلبات، المرتجعات، الملف الشخصي في `moreSections` و `pageTitles`

---

## إصلاح تعارض الأسماء (Conflict Fix)

**المشكلة:** ملف `orders.ts` (الجديد للـ Kanban) وملف `purchaseOrders.ts` (الموجود للـ PurchaseOrdersPage) كلاهما يُصدّر `sampleOrders`، مما سبب تعارض في barrel export (`src/services/mock/index.ts`).

**الحل:** إعادة تسمية الـ export في `orders.ts` من `sampleOrders` إلى `sampleKanbanOrders`، وتحديث الاستيراد في `OrdersPage.tsx`. هذا حافظ على توافق `DashboardPage.tsx` و `PurchaseOrdersPage.tsx` التي تستخدم `sampleOrders` من `purchaseOrders.ts`.

---

## التحقق من الجودة

| الفحص | النتيجة |
|-------|---------|
| `tsc --noEmit` (TypeScript) | ✅ بدون أخطاء |
| `vite build` (Production Build) | ✅ ناجح — 1228 module، 9.24s |
| توافق الكود الموجود | ✅ جميع الصفحات الموجودة تعمل دون تغيير |
| Lazy Loading | ✅ كل صفحة جديدة في chunk منفصل |
| RTL Layout | ✅ جميع الصفحات تدعم الاتجاه من اليمين لليسار |

### أحجام الـ Chunks (بعد البناء)
| Chunk | الحجم | gzip |
|-------|-------|------|
| InvoicePage | 29.19 kB | 5.90 kB |
| InventoryPage | 29.40 kB | 5.84 kB |
| BranchesPage | 26.77 kB | 5.52 kB |
| SettingsPage | 34.81 kB | 7.53 kB |
| ClientsPage | 25.16 kB | 5.23 kB |
| ExpensesPage | 26.28 kB | 5.98 kB |
| ProfilePage | (lazy chunk) | — |
| OrdersPage | (lazy chunk) | — |
| ReturnsPage | (lazy chunk) | — |

---

## ملخص الملفات المُعدَّلة/الجديدة

### ملفات جديدة (14 ملف)
1. `src/pages/OrdersPage.tsx`
2. `src/pages/ReturnsPage.tsx`
3. `src/pages/ProfilePage.tsx`
4. `src/types/order.ts`
5. `src/types/return.ts`
6. `src/types/profile.ts`
7. `src/types/branch.ts`
8. `src/services/mock/orders.ts`
9. `src/services/mock/returns.ts`
10. `src/services/mock/profile.ts`
11. `src/services/mock/branches.ts`
12. `src/context/BranchContext.tsx`
13. `src/context/branch-context-value.ts`
14. `CHANGES_REPORT_PART2.md` (هذا الملف)

### ملفات مُعدَّلة (10 ملفات)
1. `src/pages/InventoryPage.tsx` — إضافة Visual Two-Panel + Timeline
2. `src/pages/ClientsPage.tsx` — إعادة كتابة (Cards Grid + Side Panel + Timeline)
3. `src/pages/ExpensesPage.tsx` — إعادة كتابة (Calendar View + Pie Chart)
4. `src/pages/InvoicePage.tsx` — إعادة كتابة (Invoice Builder Side Panel)
5. `src/pages/BranchesPage.tsx` — تكامل BranchContext + Branch Switcher
6. `src/pages/SettingsPage.tsx` — تحسين تبويب الموظفين (User Cards)
7. `src/components/AppLayout.tsx` — إضافة Branch Switcher للـ Topbar
8. `src/components/icons/index.tsx` — أيقونات جديدة (تم في جلسة سابقة)
9. `src/context/ProductsContext.tsx` — إضافة `transferHistory`
10. `src/context/products-context-value.ts` — إضافة `TransferHistoryEntry` + `transferHistory`
11. `src/services/mock/clients.ts` — إضافة `clientActivities`
12. `src/App.tsx` — مسارات + BranchProvider (تم في جلسة سابقة)
13. `src/constants/navigation.ts` — عناصر تنقل جديدة (تم في جلسة سابقة)

---

## التقنيات المستخدمة
- **React 19** + **TypeScript** + **Vite 7** + **Tailwind CSS v3.4**
- **Framer Motion** للحركات (motion, AnimatePresence)
- **Recharts** للمخططات (PieChart في ExpensesPage)
- **React Router 7** مع lazy loading
- **Context API** للحالة (BranchContext جديد)
- **HTML5 Drag & Drop API** للوحة Kanban ونقل المخزون
- **sonner** للإشعارات (toast)
- **localStorage** لحفظ الفرع النشط
- تصميم Apple-inspired، بطاقات (no tables)، RTL للعربية
