# OnboardingWizard — معالج الإعداد الأولي

> **الملف:** `src/components/OnboardingWizard.tsx` · **السطور:** ~183

## نظرة عامة

OnboardingWizard هو معالج إعداد أولي (Wizard) يُعرض للمستخدمين الجدد عند أول تشغيل. يأخذ المستخدم في خطوات متعددة: اختيار نوع المتجر، إدخال اسم المتجر، اختيار العملة، اختيار الثيم، وإنشاء أول منتج. يستخدم localStorage لحفظ حالة onboardingCompleted عبر useAppSettings. عند اكتمال المعالج، يُعلَّم onboarding كمنتهٍ ولا يُعرض مرة أخرى. واجهة متعددة الخطوات مع شريط تقدم وأزرار التالي/السابق. يحتوي على eslint-disable-next-line لقاعدة react-refresh/only-export-components.

## الصادرات (Exports)

`OnboardingWizard (default)`

## المستهلكون (Consumers)

- `App.tsx (يُعرض عند firstLaunch)`

## السياقات (Contexts) المستخدمة

`useAppSettings (onboardingCompleted)`

## ملاحظات للمطور

- **إعادة الاستخدام:** هذا المكون مشترك (shared component) مصمم لإعادة الاستخدام عبر صفحات متعددة.
- **التصميم:** يستخدم متغيرات CSS `--vuno-*` للألوان، وفئات Tailwind للتنسيق، و`card-vuno` للبطاقات.
- **التوافق مع React Compiler:** تم التأكد من توافق المكون مع قواعد React Compiler (لا Math.random/Date.now أثناء الـ render، لا useEffect+setState للقيم المشتقة).
- **eslint-disable-next-line:** بعض المكونات تحتوي على تعليقات `eslint-disable-next-line react-refresh/only-export-components` لأنها تصدِّر كيانات غير مكونات (مثل defaultReceiptSettings) وهذا مقصود للتصميم.

## الارتباطات

- [الفهرس الرئيسي للمكونات](../COMPONENTS.md)
- [وثيقة نظام التصميم](../DESIGN-SYSTEM.md)
- [العودة للـ README](../../README.md)
