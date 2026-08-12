# ProductFormModal — نموذج إضافة/تعديل المنتج

> **الملف:** `src/components/ProductFormModal.tsx` · **السطور:** ~244

## نظرة عامة

ProductFormModal هو نموذج منبثق (Modal) لإضافة منتج جديد أو تعديل منتج موجود. يعرض حقولاً لـ: اسم المنتج، الباركود، الفئة، السعر، التكلفة، الكمية، وحدة القياس، الحد الأدنى للمخزون، والصورة. يدعم الوضعين: إضافة (حقول فارغة) وتعديل (حقول مملوءة ببيانات المنتج الموجود). عند الحفظ، يستدعي callback onSubmit الذي يمرره ProductsPage لتحديث ProductsContext. يتضمن التحقق من صحة المدخلات (required fields, numeric validation). تصميم أنيق مع Framer Motion وحركات الدخول/الخروج.

## الصادرات (Exports)

`ProductFormModal (default)`

## المستهلكون (Consumers)

- `ProductsPage`

## السياقات (Contexts) المستخدمة

`useProducts (عبر props callback)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
