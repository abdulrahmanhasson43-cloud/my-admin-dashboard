# ThermalReceipt — الفاتورة الحرارية

> **الملف:** `src/components/ThermalReceipt.tsx` · **السطور:** ~259

## نظرة عامة

ThermalReceipt هو مكون الفاتورة الحرارية القابلة للطباعة على طابعات حرارية (58mm و80mm). يعرض الفاتورة بتنسيق حراري: اسم المتجر، التاريخ، رقم الفاتورة، قائمة المنتجات مع الكميات والأسعار، الإجمالي الفرعي، الضريبة، الخصم، الإجمالي النهائي، وطريقة الدفع. يدعم عرضين: 58mm و80mm. يتضمن ShareReceiptButton (مشاركة كصورة عبر Web Share API) وPrintReceiptButton (طباعة عبر window.print). يدعم print CSS مخصص عبر @media print. الإعدادات الافتراضية (`defaultReceiptSettings`) والنوع `ReceiptSettings` ودوال تحويل الفاتورة لصورة ومشاركتها وطباعتها انتقلت لـ`src/lib/receipt.ts`، فالملف ده بقى مكونات بس ومن غير أي `eslint-disable`.

## الصادرات (Exports)

`ThermalReceipt, ShareReceiptButton, PrintReceiptButton` (والباقي في `lib/receipt.ts`: `ReceiptSettings`, `defaultReceiptSettings`, `receiptToImage`, `shareReceiptImage`, `printReceiptImage`)

## المستهلكون (Consumers)

- `SaleCompleteView` (شاشة الفاتورة بعد البيع)
- `ReceiptPreview` (معاينة الإعدادات، من `components/settings`)

## السياقات (Contexts) المستخدمة

`— (يستخدم props)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **ملف مكونات بس:** أي دالة أو ثابت جديد خاص بالفاتورة مكانه `lib/receipt.ts` مش هنا، علشان قاعدة `react-refresh/only-export-components` تفضل متحققة من غير تعطيل.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
