# QRCodeButton — زر وعرض رمز QR

> **الملف:** `src/components/QRCodeButton.tsx` · **السطور:** ~154

## نظرة عامة

QRCodeButton يولِّد ويعرض رمز QR للبيانات الممررة. يتوفر بنسختين: QRCodeButton (زر يفتح نافذة منبثقة تعرض الرمز بحجم كبير مع إمكانية التحميل) وQRCodeInline (يعرض الرمز مضمناً داخل الصفحة). يستخدم مكتبة qrcode لتوليد الرمز كـ data URL. يدعم تمرير أي نص أو بيانات (معرف المنتج، معرف العميل، معرف الفرع، إلخ). يعمل كأداة مساعدة مشتركة بين صفحات متعددة لتوفير رموز QR قابلة للمسح.

## الصادرات (Exports)

`QRCodeButton (default), QRCodeInline (named)`

## المستهلكون (Consumers)

- `ProductsPage`
- `ClientsPage`
- `BranchesPage`
- `SuppliersPage`
- `CategoriesPage`
- `InventoryPage`
- `InvoicePage`
- `PurchaseOrdersPage`

## السياقات (Contexts) المستخدمة

لا يستخدم سياقات مباشرة (مكون عرضي/controlled).

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
