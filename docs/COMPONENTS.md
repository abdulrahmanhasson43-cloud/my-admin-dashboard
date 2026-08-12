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
**الغرض:** مكوّن الفاتورة الحرارية القابلة للتحويل إلى صورة. يُصدّر أيضًا:
- `defaultReceiptSettings` — الإعدادات الافتراضية
- `receiptToImage()` — تحويل الفاتورة لصورة (Png)
- `shareReceiptImage()` — مشاركة الصورة
- `printReceiptImage()` — طباعة الصورة

يستخدم `html-to-image`. يُستهلك في `POSPage` بعد الدفع.

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

## إضافة مكوّن مشترك جديد

1. أنشئ `src/components/XxxComponent.tsx` بمكوّن افتراضي.
2. أضف توثيق JSDoc فوق تعريف المكوّن.
3. أضفه إلى هذا الفهرس (`docs/COMPONENTS.md`).
4. أنشئ ملف توثيق مفصل في `docs/components/XxxComponent.md` (إذا كان معقدًا).
5. استورده في الصفحات التي تحتاجه.
6. تأكد من أن المكوّن لا يُصدّر غير المكوّنات (أو أضف `// eslint-disable-next-line react-refresh/only-export-components` فوق أي تصدير غير مكوّن).
