# مدار

منصة دورات مصوّرة بالعربية. React + TypeScript + Vite + Tailwind 4.

## التشغيل

```bash
npm install
npm run dev        # تطوير على المنفذ 3000
npm run typecheck  # فحص الأنواع
npm run build      # بناء الإنتاج في dist/
```

## هيكل المشروع (Clean Architecture حسب الميزة)

```
src/
  app/        تجميع التطبيق والمسارات (App.tsx)
  core/       كيانات النطاق: أنواع خالصة بلا React ولا بيانات
  data/       مصدر البيانات (catalog.ts) ودوال الاستعلام — يُستبدل بالـ API لاحقاً
  features/   كل ميزة في مجلدها: home, auth, catalog, learning, admin
  shared/
    ui/       مكوّنات مشتركة: Poster, Rail, Logo, primitives
    layout/   TopBar, BottomTabs, Footer
    lib/      router
    styles/   tokens.css (الألوان والمقاسات) / base.css / components.css
```

قاعدة الاعتماد: `features` تعتمد على `shared` و`core` و`data`، ولا تعتمد على بعضها (إلا `auth`).

## قواعد التصميم

- **لون تفاعلي واحد** أزرق (`--color-accent`) على خلفية داكنة `#0b0c0f`، والزرار الأساسي كبسولة بيضاء بنص داكن. كل القيم في `tokens.css`. التخطيط مستوحى من Yango Play و Shahid.
- **مقاسات ثابتة:** زرار 48px (52px للأساسي في الجوال)، مساحة لمس 44px، جسم الخط 16px، سطر 1.75.
- **الخط:** Readex Pro (محلي عبر fontsource). لا `letter-spacing` في العربية.
- **نقاط التوقف:** جوال أقل من 768 (شريط تبويب سفلي)، تابلت 768–1023، لابتوب 1024 فأكثر (تنقّل علوي).
- بلا إطارات وبطاقات في الصفحات العامة. ملصقات 2:3 بزوايا شبه حادّة وعنوانها تحتها، وصفوف بعنوان يمين و«الكل» يسار، وصف «أفضل 10» ببطاقات كبيرة ولسان ملوّن برقم الترتيب (`Top10Rail`)، وهيرو متحرك بتلاشي بين الدورات المميّزة (`HeroCarousel`).
- زرّان متجاوران = نصف/نصف عرض (`.btn-pair` / `.btn-row`).

## ملاحظات

- الدخول التجريبي: `student@madar.app` أو `teacher@madar.app` أو `admin@madar.app` وكلمة المرور `123456`.
- إنشاء الحساب وزرار جوجل واجهة فقط حتى ربط خادم.
- لوحة التحكم والمشغّل يستخدمان نفس الـ tokens لكن لم يُعاد تصميمهما بالكامل.
