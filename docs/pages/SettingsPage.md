# الإعدادات العامة

> **الملف:** `src/pages/SettingsPage.tsx` · **السطور:** ~583 · **المسار:** `/settings`

## نظرة عامة

صفحة الإعدادات هي لوحة التحكم المرئية (Settings Visual Panel) لإعدادات النظام. ت organized في أقسام (settingsSections) تشمل: إعدادات المتجر، طرق الدفع (مع getPaymentIcon)، إعدادات الطباعة الحرارية (مع معاينة ThermalReceipt)، إدارة الموظفين والصلاحيات (roleMeta)، النسخ الاحتياطي والاستعادة (DataBackupSection)، والمظهر (الثيم عبر useTheme). تستخدم Field وSectionCard كمكونات مساعدة موحدة للحقول والأقسام. تتيح تبديل الوضع الليلي/النهاري، تخصيص ألوان العلامة التجارية، وإدارة أدوار الموظفين.

## السياقات (Contexts) المستخدمة

- `useAppSettings`
- `useTheme`

## المكونات المشتركة المستخدمة

- `ThermalReceipt`
- `DataBackupSection`
- `Field`
- `SectionCard`
- `Framer Motion`
- `مكونات أيقونات مخصصة`

## خدمات البيانات (Services)

- `staffMembers`
- `sampleBranches (from @/services/mock)`

## الثوابت (Constants)

- `settingsSections (from @/constants/settingsSections)`

## ملاحظات للمطور

- **النمط المتبع:** هذه الصفحة تتبع نمط الصفحات في Vuno — مكون افتراضي (default export)، استيراد من `@/` alias، استخدام متغيرات CSS `--vuno-*` للألوان، وFramer Motion لحركات الدخول.
- **التوافق مع React Compiler:** تم التأكد من عدم استخدام `Math.random()` أو `Date.now()` أثناء الـ render (تستخدم `generateId` / `generateNumericId` بدلاً منها)، وعدم استخدام `useEffect` + `setState` للقيم المشتقة (تستخدم `useMemo` بدلاً من ذلك).
- **دعم RTL:** الواجهة بالكامل بالعربية مع `dir="rtl"`، باستثناء الأرقام والهواتف التي تستخدم `dir="ltr"` و`tabular-nums`.
- **الاستجابة (Responsiveness):** بعض الصفحات تستخدم `useDeviceType` للتكيف مع أحجام الشاشات المختلفة (موبايل/تابلت/ديسكتوب).

## الارتباطات

- [الفهرس الرئيسي للصفحات](../PAGES.md)
- [وثيقة المكونات المشتركة](../COMPONENTS.md)
- [وثيقة السياقات (Contexts)](../CONTEXTS.md)
- [العودة للـ README](../../README.md)
