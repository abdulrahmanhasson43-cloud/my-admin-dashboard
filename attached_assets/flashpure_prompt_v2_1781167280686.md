# SYSTEM PROMPT - فلاش بيور ⚡ Flash Pure
# نظام إدارة ومتابعة معاملات متاجر المستلزمات الطبية

> ✨ **نسخة محدّثة** — تم استبدال الهوية البصرية الحمراء بثيم **كريمي + دارك مود نوشن-ستايل**. لون أساسي واحد، تصميم موحّد، بدون ألوان متعددة مشتتة.

---

## 🎨 نظام التصميم الكامل (Design System) — النسخة الجديدة

### الفلسفة:
تصميم **موحّد بلون واحد** على طريقة Notion / Linear / Vercel.
- كريمي ناعم في الـ Light Mode.
- فحمي عميق في الـ Dark Mode.
- بدون ألوان متعددة مشتتة — التركيز على المسافات والـ typography والتباين.
- زوايا أنعم (12-14px) بدل الدائرية الكاملة.
- ظلال خفيفة جداً.

---

### الألوان — Light Mode (كريمي):
```css
:root {
  --background:         #FAF7F2;  /* كريمي ناعم - خلفية الصفحة */
  --surface:            #FFFFFF;  /* أبيض نقي - البطاقات */
  --foreground:         #1A1A1A;  /* فحمي - النص الرئيسي */
  --muted-foreground:   #6B6B6B;  /* رمادي - نص ثانوي */
  --border:             #E8E2D8;  /* حدود كريمية خفيفة */
  --primary:            #1A1A1A;  /* فحمي - اللون الأساسي (الأزرار) */
  --primary-foreground: #FAF7F2;  /* كريمي على الفحمي */
  --accent:             #F0EBE0;  /* كريمي أغمق قليلاً */
  --destructive:        #C1331F;  /* أحمر للتنبيهات فقط (حذف/خطأ) */
}
```

### الألوان — Dark Mode (Notion-style):
```css
.dark {
  --background:         #191919;  /* فحمي عميق - خلفية الصفحة */
  --surface:            #252525;  /* أغمق قليلاً - البطاقات */
  --foreground:         #E8E8E8;  /* أبيض مكسور - النص الرئيسي */
  --muted-foreground:   #9B9B9B;  /* رمادي - نص ثانوي */
  --border:             #2F2F2F;  /* حدود خفيفة جداً */
  --primary:            #FAF7F2;  /* كريمي - اللون الأساسي يصبح فاتح */
  --primary-foreground: #1A1A1A;  /* فحمي على الكريمي */
  --accent:             #2F2F2F;  /* رمادي غامق */
  --destructive:        #E55039;  /* أحمر أفتح للدارك */
}
```

> ⚠️ **قاعدة مطلقة:** ممنوع استخدام الأحمر القديم (`#E63946`) في أي مكان كلون رئيسي. الأحمر يُستخدم **فقط** للتنبيهات والحذف والأخطاء (variant `destructive`).

---

### الخطوط:
```html
<!-- في __root.tsx head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
```

```css
font-family: 'Cairo', system-ui, sans-serif;

/* الأوزان:
   300 = نصوص خفيفة (نادراً)
   400 = نص عادي (body)
   600 = شبه عريض (labels, sub-headings)
   700 = عريض (الأزرار والعناوين العادية)
   900 = سميك جداً (Hero headings والأرقام الكبيرة)
*/
```

---

### الأشكال والحدود — أنعم وأكثر تحفظاً:
```css
/* البطاقات */
border-radius: 14px;                       /* مش 24 - أنعم وأكثر احترافاً */
border: 1px solid var(--border);
box-shadow: 0 1px 2px rgba(0,0,0,0.04);    /* ظل خفيف جداً */

/* الأزرار */
border-radius: 12px;                       /* مش دائري بالكامل - مربعات ناعمة */

/* الـ Inputs */
border-radius: 10px;
border: 1px solid var(--border);

/* الأيقونات داخل خلفية */
border-radius: 10px;
background: var(--accent);                 /* للأيقونات المميزة فقط */
```

---

### الأزرار:
```css
/* زر أساسي */
.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 14px;
  height: 40px;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.9; }       /* بدون transform - أكثر هدوءاً */

/* زر شفاف (Outline) */
.btn-outline {
  background: transparent;
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 700;
}
.btn-outline:hover { background: var(--accent); }

/* زر شبح (Ghost) */
.btn-ghost {
  background: transparent;
  color: var(--muted-foreground);
  border: none;
  font-weight: 600;
}
.btn-ghost:hover {
  color: var(--foreground);
  background: var(--accent);
}
```

---

### البطاقات:
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
}

/* بطاقة CTA مميزة */
.card-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border: none;
  border-radius: 16px;
}
```

---

### الـ Inputs:
```css
.input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  height: 40px;
  font-size: 14px;
  font-family: 'Cairo', sans-serif;
}
.input:focus {
  outline: none;
  border-color: var(--foreground);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}
```

---

### الـ Navigation:
```css
.navbar {
  position: sticky;
  top: 0;
  height: 64px;
  background: rgba(250, 247, 242, 0.85);   /* Light */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.dark .navbar {
  background: rgba(25, 25, 25, 0.85);
}

.nav-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted-foreground);
  padding: 8px 12px;
  border-radius: 8px;
}
.nav-link:hover,
.nav-link.active {
  color: var(--foreground);
}
```

---

### تبديل Light/Dark:
- زر `Moon/Sun` في الـ Navbar (أيقونات Lucide).
- الاختيار محفوظ في `localStorage` تحت مفتاح `fp-theme`.
- يتم تطبيق الكلاس `.dark` على `<html>` **قبل** الـ render (سكريبت inline في الـ head) لمنع وميض الثيم.
- الافتراضي = **Light (كريمي)**.

---

### دعم العربية و RTL:
- `<html lang="ar" dir="rtl">` على مستوى التطبيق.
- استخدام Tailwind logical properties:
  - `ms-*` بدل `ml-*` ، `me-*` بدل `mr-*`
  - `ps-*` بدل `pl-*` ، `pe-*` بدل `pr-*`
  - `start-*` بدل `left-*` ، `end-*` بدل `right-*`
- الأرقام في الجداول والـ Dashboard: استخدم `tabular-nums`.
- الإيميل / رقم التليفون: `dir="ltr"` على العنصر فقط للحفاظ على ترتيب الأرقام.

---

### قواعد التصميم العامة:
1. **لون أساسي واحد فقط** — لا تخلط ألوان متعددة في واجهة واحدة.
2. **التباين قبل الزخرفة** — اعتمد على المسافات والـ typography بدل الـ gradients.
3. **زوايا متسقة** — 10px للـ inputs، 12px للأزرار، 14px للبطاقات، 16px للـ CTA cards.
4. **ظلال شبه معدومة** — Notion-style. الظلال الثقيلة ممنوعة.
5. **بدون transform على الـ hover** — استخدم opacity أو background change.
6. **الأيقونات من Lucide React فقط** — مقاس 16-20px في معظم الحالات.
7. **عرض المحتوى** — `max-width: 1200px` للصفحات العامة، `container-x` utility.
8. **المسافات بالـ scale الافتراضي** — تجنب القيم العشوائية.

---

### Responsive Breakpoints:
```css
/* Tailwind v4 الافتراضي */
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px

/* قواعد:
   - Mobile-first دائماً
   - Sidebar يتحول لـ Drawer تحت md
   - الـ Navbar links تتحول لـ hamburger menu تحت md
   - شبكة المميزات: 1 col mobile → 2 cols md → 4 cols lg
*/
```

---

### مكتبة المكونات:
- **shadcn/ui** كاملة (موجودة بالفعل في `src/components/ui/`).
- لا تكتب أي `text-white` / `bg-black` / `bg-[#xxx]` في الكومبوننتات — استخدم semantic tokens فقط (`bg-primary`, `text-foreground`, `border-border`, إلخ).
- المكونات المخصصة في `src/components/site/` (مثل `Navbar`, `Footer`).

---

<!-- باقي المواصفات (المشروع، التقنيات، المستخدمون، قاعدة البيانات، إلخ) لم تتغير -->

## 🎯 عن المشروع

أنت مطور متخصص في بناء منصة "فلاش بيور" ⚡
منصة متكاملة لإدارة متاجر المستلزمات الطبية (ليست أدوية)
تتابع كل المعاملات المالية والتجارية بشكل كامل ودقيق

الاسم: Flash Pure | فلاش بيور
الشعار: ⚡
الألوان: أحمر #E63946 + أبيض #FFFFFF
الخط: Cairo Bold
الشعار التسويقي: "طبي. سريع. موثوق"

---

## 🔧 التقنيات المستخدمة

### Frontend:
- React.js + Next.js
- Tailwind CSS
- PWA (يشتغل بدون نت - Service Workers)
- Mobile First Design (الموبايل أولاً)
- Bottom Navigation على الموبايل
- Sidebar على الديسكتوب
- Responsive على كل الأجهزة
- Dark Mode اختياري
- Micro-animations خفيفة

### Backend & Database:
- Supabase (بدل Firebase - مجاني بدون فيزا)
- PostgreSQL
- Row Level Security (RLS)
- Realtime Subscriptions

### المعلومات الحساسة في Environment Variables فقط:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GEMINI_API_KEY
- GROQ_API_KEY

### Authentication:
- Supabase Auth
- تسجيل دخول بالإيميل وكلمة المرور
- تسجيل دخول بـ Google OAuth
- كود خاص لكل عميل (بدل التسجيل)

### Integrations:
- WhatsApp API (التواصل والفواتير)
- Google Maps (التوصيل)
- Paymob (معالج الدفع - مش بنمسك فلوس)
- Gemini API (AI أساسي)
- Groq API (AI بديل)
- Canvas/Sharp (توليد صور الفواتير PNG)

### Hosting:
- Vercel (Frontend - مجاني)
- Supabase (Backend - مجاني)
- GitHub (الكود - مجاني)

---

## 👥 المستخدمون الثلاثة

### 1️⃣ السوبر أدمن (فلاش بيور):
- يتحكم في كل المتاجر المشتركة
- يفعّل ويوقف أي متجر
- يدير الباقات والاشتراكات
- يضيف مفاتيح API للذكاء الاصطناعي يومياً
- يدير المواسم والعروض العامة
- يشوف تقارير إيرادات المنصة كاملة
- يتحكم في حدود استخدام AI
- تسجيل دخول: إيميل + Google

### 2️⃣ صاحب المتجر:
- يدير منتجاته ومخزونه
- يدير عملاءه وموردينه
- POS (نقطة البيع)
- يتابع كل المعاملات
- يرسل فواتير حرارية (صور PNG) على واتساب
- يحدد أسعار متعددة لكل منتج
- ينشئ أكواد دخول للعملاء
- تسجيل دخول: إيميل + Google

### 3️⃣ العميل (زبون صاحب المتجر):
- يدخل بكود خاص فقط (بدون إيميل)
- يشوف سعر فئته فقط (سعر واحد بس)
- يطلب المنتجات
- يتابع طلباته وديونه
- يستقبل فواتير حرارية على واتساب
- يعمل جرد سنوي لمشترياته
- يسأل AI (حسب باقة صاحب المتجر)

---

## 💰 نظام الأسعار المتعدد

### لكل منتج:
- سعر الشراء (من المورد) - لصاحب المتجر فقط
- سعر الجمهور (Public Price) - السعر الظاهر للكل
- سعر التجزئة (Retail)
- سعر الجملة 1 (Wholesale 1)
- سعر الجملة 2 (Wholesale 2)
- سعر الجملة 3 (Wholesale 3)
- سعر VIP
- سعر سري (Secret) - بكود خاص

### قاعدة العرض:
- كل عميل له فئة سعر واحدة فقط
- يشوف سعر فئته فقط (مش قائمة اختيار)
- لا يرى أي سعر آخر أبداً
- الفئة محفوظة في Backend آمنة
- حتى لو حاول يغير السعر = النظام يرفض

### أنواع الفئات:
- فئة عامة: كل العملاء يشوفوها
- فئة مقيدة بكود: بس من عنده الكود
- فئة VIP: بموافقة صاحب المتجر
- فئة مؤقتة: تتفعل في وقت معين
- فئة بحد أدنى للطلب

---

## 🗄️ هيكل قاعدة البيانات (Supabase)

```sql
-- المتاجر
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  commercial_register TEXT,
  tax_number TEXT,
  has_commercial_register BOOLEAN DEFAULT false,
  has_tax_number BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  invoice_settings JSONB,
  delivery_settings JSONB,
  payment_methods JSONB,
  working_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- المنتجات
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  cost_price DECIMAL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  expiry_date DATE,
  batch_number TEXT,
  unit TEXT DEFAULT 'piece',
  barcode TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- الأسعار
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  price_type TEXT,
  amount DECIMAL NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- الفئات
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'public',
  access_code TEXT,
  price_category TEXT,
  min_order_amount DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- العملاء
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  access_code TEXT UNIQUE,
  price_category TEXT,
  credit_limit DECIMAL DEFAULT 0,
  total_debt DECIMAL DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'active',
  last_order_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- الموردين
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  total_debt DECIMAL DEFAULT 0,
  rating INTEGER DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- الطلبات
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  customer_id UUID REFERENCES customers(id),
  order_number TEXT UNIQUE,
  items JSONB NOT NULL,
  subtotal DECIMAL NOT NULL,
  discount DECIMAL DEFAULT 0,
  delivery_cost DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL,
  paid_amount DECIMAL DEFAULT 0,
  remaining_amount DECIMAL DEFAULT 0,
  payment_method TEXT,
  status TEXT DEFAULT 'new',
  delivery_address TEXT,
  delivery_notes TEXT,
  invoice_image TEXT,
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- المشتريات من الموردين
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  supplier_id UUID REFERENCES suppliers(id),
  items JSONB NOT NULL,
  total DECIMAL NOT NULL,
  paid_amount DECIMAL DEFAULT 0,
  invoice_image TEXT,
  invoice_scan_image TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- كل المعاملات (سجل كامل)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  customer_id UUID,
  supplier_id UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- الموظفين
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  permissions JSONB,
  salary DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- مفاتيح API (للسوبر أدمن)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  daily_limit INTEGER DEFAULT 0,
  current_usage INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  last_reset TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- المواسم والعروض
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  discount_percentage DECIMAL DEFAULT 0,
  applicable_merchants JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- كوبونات الخصم
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT,
  discount_value DECIMAL,
  min_order_amount DECIMAL DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expiry_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- نقاط الولاء
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  merchant_id UUID REFERENCES merchants(id),
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0
);

-- سجل استخدام AI
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  customer_id UUID REFERENCES customers(id),
  question TEXT,
  answer TEXT,
  api_used TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📱 الصفحات الكاملة (50+ صفحة)

### السوبر أدمن (10 صفحات):
1. Dashboard - إيرادات + إحصائيات + رسوم بيانية
2. إدارة المتاجر - تفعيل/إيقاف/تعديل
3. إدارة الباقات - Starter/Pro/Elite/Enterprise
4. إدارة API Keys - إضافة يومية + Auto-Failover
5. إدارة المواسم والعروض العامة
6. التقارير الشاملة - كل المتاجر
7. إعدادات المنصة العامة
8. لوحة الأمان والمراقبة
9. إدارة المستخدمين
10. الدعم الفني والتذاكر

### صاحب المتجر (25 صفحة):
1. Dashboard - مبيعات + مخزون + ديون + تنبيهات
2. POS - نقطة البيع الكاملة
3. المنتجات - إضافة + تعديل + حذف
4. مسح فاتورة المورد بالكاميرا (AI)
5. المخزون والفئات
6. الفئات السرية (بكود خاص)
7. العملاء - إضافة + أكواد دخول
8. الموردين - إضافة + تقييم
9. الطلبات الواردة
10. إدارة التوصيل وحالاته
11. الفواتير السابقة
12. الديون (من العملاء وللموردين)
13. التقارير والإحصائيات المتقدمة
14. الموظفين والصلاحيات
15. العروض والكوبونات
16. نظام الولاء والنقاط
17. إعدادات المتجر الكاملة
18. إعدادات الفاتورة
19. إعدادات التوصيل والدفع
20. إعدادات الإشعارات
21. إعدادات الأمان
22. الكتالوج الرقمي المشارك
23. نظام المرتجعات
24. تقارير الموظفين
25. الدعم الفني

### العميل (15 صفحة):
1. الصفحة الرئيسية - كتالوج بسيط
2. تصفح الفئات (بأيقونات)
3. تفاصيل المنتج
4. سلة الشراء
5. تأكيد الطلب (عبر واتساب)
6. طلباتي وتتبعها
7. تتبع التوصيل Live
8. حسابي - ديون + مدفوعات
9. الفواتير السابقة
10. الجرد السنوي
11. المنتجات المفضلة
12. AI Chat (حسب الباقة)
13. تقييم المنتجات
14. الشكاوى والمراجعات
15. بياناتي الشخصية

---

## ⚙️ إعدادات صاحب المتجر (كاملة)

### القسم 1 - معلومات المتجر:
- اسم المتجر
- العنوان الكامل
- رقم الهاتف
- رقم واتساب
- البريد الإلكتروني
- نوع المكان (متجر/صيدلية/عيادة/آخر)

### القسم 2 - المعلومات الرسمية:
- هل لديك سجل تجاري؟ (نعم/لا)
- رقم السجل التجاري
- تاريخ انتهاء السجل
- هل لديك رقم ضريبي؟ (نعم/لا)
- الرقم الضريبي
- صورة السجل (رابط خارجي)

### القسم 3 - إعدادات الفاتورة:
- شعار المتجر (رابط خارجي)
- رسالة شكر مخصصة
- نمط الفاتورة (بسيط/قياسي/فاخر)
- إظهار رقم واتساب في الفاتورة
- إظهار العنوان في الفاتورة
- ترقيم الفواتير (تلقائي)

### القسم 4 - التوصيل والدفع:
- وقت التوصيل المتوقع
- تكلفة التوصيل
- حد التوصيل المجاني
- مناطق التوصيل وأسعارها
- طرق الدفع المسموحة:
  ✅ كاش عند الاستلام
  ✅ تحويل بنكي
  ✅ واتساب Pay
  ✅ Paymob
  ✅ دفع آجل
  ✅ دفع جزئي

### القسم 5 - الإشعارات:
- استقبال إشعارات الطلبات
- إرسال تحديثات واتساب
- أوقات استقبال الرسائل
- تنبيه المخزون المنخفض
- تنبيه الديون القديمة

### القسم 6 - الأمان:
- تغيير كلمة المرور
- الجلسات النشطة
- سجل العمليات (Audit Log)

### القسم 7 - البيانات:
- تحميل نسخة احتياطية (Excel)
- حذف الحساب نهائياً

---

## 👑 إعدادات السوبر أدمن

### إدارة المواسم:
- إضافة موسم جديد
- اسم + وصف + تواريخ
- نسبة خصم عام
- المتاجر المشاركة
- صورة ترويجية

### إدارة العروض:
- عروض أسبوعية
- فلاش سيل (ساعة/يوم)
- عروض موسمية
- كوبونات عامة

### إدارة API Keys:
- إضافة Gemini API يومياً
- إضافة Groq API
- ترتيب الأولوية
- Auto-Failover تلقائي
- مراقبة الاستخدام

### إعدادات الباقات:
- Starter: 50 جنيه/شهر
- Pro: 150 جنيه/شهر
- Elite: 500 جنيه/شهر
- Enterprise: حسب الطلب

---

## 🧾 الفواتير الحرارية (صور PNG)

### المواصفات:
- صورة PNG فقط (ليست PDF أبداً)
- عرض: 380 بكسل
- خلفية بيضاء + نص أسود
- شكل حراري حقيقي

### المحتوى:
- شعار المتجر (لو موجود)
- اسم المتجر والعنوان
- رقم الفاتورة التسلسلي
- التاريخ والوقت
- اسم وبيانات العميل
- جدول المنتجات والكميات والأسعار
- الخصم (لو موجود)
- تكلفة التوصيل
- الإجمالي النهائي
- طريقة الدفع
- المبلغ المدفوع والمتبقي
- رسالة شكر مخصصة
- رقم واتساب المتجر

### الإرسال:
- عبر واتساب كصورة مباشرة
- يقدر العميل يحفظها
- يقدر صاحب المتجر يطبعها
- تتحفظ في سجل الطلبات

---

## 💬 تكامل واتساب الكامل

### للعميل:
- تأكيد الطلب بالرسالة
- استقبال الفاتورة الحرارية (صورة)
- تحديثات حالة التوصيل
- تذكير الديون

### لصاحب المتجر:
- استقبال إشعار كل طلب جديد
- إرسال الفاتورة بضغطة واحدة
- تذكير الديون للعملاء
- رسائل templates جاهزة

### Templates جاهزة:
- تأكيد استقبال الطلب
- الطلب خرج للتوصيل
- تم التسليم بنجاح
- تذكير بالدين

---

## 🤖 نظام الذكاء الاصطناعي

### من يستخدمه:
- عملاء صاحب المتجر فقط
- حسب باقة صاحب المتجر

### الباقة الأساسية (Starter):
- AI: غير متاح ❌

### الباقة المتوسطة (Pro):
- AI: متاح ✅
- الحد: 10 أسئلة يومياً
- Rate Limit: سؤال كل 10 دقائق
- يُعاد الحد: كل 12:00 AM

### الباقة العالية (Elite):
- AI: متاح ✅
- الحد: 50 سؤال يومياً
- Rate Limit: سؤال كل 3 دقائق
- يُعاد الحد: كل 12:00 AM

### Auto-Degradation:
- ضغط 30-60%: عادي ✅
- ضغط 60%+: تقليل تلقائي
  - Pro: من 10 لـ 5 أسئلة
  - Elite: من 50 لـ 30 سؤال
- ضغط 90%+: إيقاف مؤقت

### APIs المدعومة:
- Gemini API (الأساسي)
- Groq API (البديل الأول)
- Auto-Failover: يتحول تلقائياً

### قواعد AI:
- يرد بالعربية العامية
- يساعد في المنتجات فقط
- لا يقدم نصائح طبية
- يحول للمتخصص عند الحاجة
- يفلتر الأسئلة غير المناسبة

---

## 📊 المعاملات التي يتابعها النظام (كاملة)

### معاملات البيع:
- كل فاتورة بيع (تاريخ + وقت + مبلغ)
- اسم العميل وفئته
- المنتجات والكميات والأسعار
- طريقة الدفع
- حالة الدفع (مدفوع/جزئي/آجل)
- حالة التوصيل
- الفاتورة الحرارية المرسلة
- اسم الموظف الذي أجرى البيع

### معاملات الشراء:
- كل فاتورة شراء من مورد
- مسح الفاتورة بالكاميرا (AI يقرأها)
- مقارنة سعر الشراء بالسابق
- تحديث المخزون تلقائياً
- تسجيل دين المتجر للمورد

### معاملات المخزون:
- الكمية الحالية لكل منتج
- حركة الدخول والخروج
- تنبيه الكميات المنخفضة
- تاريخ انتهاء الصلاحية
- نظام FIFO التلقائي
- رقم الدفعة (Batch Number)

### معاملات الديون:
- ديون العملاء (لصالح المتجر)
- ديون المتجر (للموردين)
- تواريخ الاستحقاق
- سجل كل دفعة
- تنبيهات التأخير (+30 يوم)

---

## 🖼️ نظام الصور والأيقونات

### المنتجات:
- أيقونات بسيطة مجانية (Heroicons)
- روابط خارجية فقط (لا تخزين)
- لا صور مرفوعة على السيرفر

### الأيقونات المتوفرة:
- 💉 حقن وإبر
- 🩹 جروح وضمادات
- 🌡️ قياس درجة الحرارة
- 🩺 أدوات فحص
- 🧴 سوائل تطهير
- 🧤 قفازات واقية
- 🦴 دعامات ومشدات
- 🩼 عصا العكازة
- 🔬 أدوات معقمة
- 📏 أدوات قياس
- 🧼 معقمات
- 🏥 أجهزة صحية
- + 88 أيقونة أخرى

---

## 📋 نظام الفئات والأسعار السرية

### الفئة العامة:
- كل العملاء يشوفوها
- لا يحتاج كود

### الفئة السرية:
- يشوفها فقط من عنده الكود
- صاحب المتجر يحدد الكود
- للمنتجات الحساسة
- لا تظهر في الكتالوج العام

### الفئة المشروطة:
- عميل جديد → فئة "جديد"
- بعد شهر → يترقى تلقائياً
- بعد شراء X جنيه → يترقى
- العملاء المميزين → فئة VIP

---

## 🚚 نظام التوصيل

### الإعدادات:
- مناطق التوصيل وأسعارها
- وقت التوصيل المتوقع
- حد التوصيل المجاني
- فترات التوصيل المتاحة

### حالات الطلب:
- جديد 🆕
- قيد التجهيز ⚙️
- خرج للتوصيل 🚚
- تم التسليم ✅
- مرتجع 🔄
- ملغي ❌

### تطبيق السواق:
- يستقبل الطلبات على موبايله
- يأكد الاستلام بتوقيع رقمي
- GPS للتتبع الحي
- تقرير التوصيلات اليومية

---

## 💳 طرق الدفع

### المتاحة:
- كاش عند الاستلام
- تحويل بنكي
- واتساب Pay (InstaPay)
- Paymob (معالج دفع - مش بنمسك فلوس)
- دفع آجل (يُسجل كدين)
- دفع جزئي (مقدم + باقي)

### ملاحظة مهمة:
- فلاش بيور لا تمسك فلوس مباشرة
- Paymob هو المسؤول عن الدفع الإلكتروني
- الدفع الآجل = دين في النظام فقط

---

## 🔐 نظام الأمان

### Supabase RLS:
- كل مستخدم يشوف بياناته فقط
- صاحب المتجر = متجره فقط
- العميل = بياناته فقط
- السوبر أدمن = كل شيء

### الكود:
- API Keys في Environment Variables فقط
- لا API Keys في الكود أبداً
- HTTPS دايماً
- Rate Limiting للحماية

### سجل العمليات:
- كل عملية بتُسجل
- من + ماذا + متى
- لا يمكن حذفه
- للمحاسبة والمراقبة

---

## 📈 نظام الباقات والإيرادات

### Starter (50 جنيه/شهر):
- 100 منتج
- موظف واحد
- بدون AI
- POS أساسي
- تقارير بسيطة

### Pro (150 جنيه/شهر):
- 1000 منتج
- 5 موظفين
- AI بحد 10 أسئلة/يوم
- تقارير متقدمة
- مسح فواتير الموردين
- كتالوج رقمي

### Elite (500 جنيه/شهر):
- منتجات غير محدودة
- 20 موظف
- AI بحد 50 سؤال/يوم
- كل المميزات
- فروع متعددة
- أولوية دعم فني
- API مخصص

### Enterprise (حسب الطلب):
- كل شيء غير محدود
- مدير حساب خاص
- تطويرات مخصصة
- تدريب الموظفين

---

## 🎯 أفكار متقدمة في النظام (110+ فكرة)

1. مسح فاتورة المورد بالكاميرا (AI يقرأها)
2. مقارنة سعر الشراء بالسابق
3. توقع المبيعات (Demand Forecasting)
4. FIFO تلقائي للمنتجات الطبية
5. تنبيه انتهاء الصلاحية
6. QR Code لكل منتج وكتالوج
7. فلاش سيل مع countdown timer
8. خصم عيد الميلاد التلقائي
9. نظام نقاط الولاء
10. برنامج إحالة الأصدقاء
11. جرد سنوي للعميل
12. إعادة طلب سريعة (نفس الأوردر)
13. المنتجات المفضلة
14. AI بالعامية المصرية
15. تحليل صوتي (اسأل بالصوت)
16. استبدال API تلقائي (Auto-Failover)
17. خصم حسب الكمية (Tiered Pricing)
18. أسعار موسمية
19. سعر مؤقت (Flash Price)
20. تنبيه انخفاض السعر
21. تقارير الربحية لكل منتج
22. تقارير أفضل العملاء
23. تقارير أفضل المنتجات
24. تقارير مقارنة شهر بشهر
25. ملخص يومي ذكي (AI)
26. نظام الشكاوى والمراجعات
27. تقييم المنتجات
28. نظام المرتجعات الذكي
29. تقييم الموردين
30. مقارنة موردين لنفس المنتج
31. نظام الفروع المتعددة
32. نقل مخزون بين الفروع
33. اشتراكات شهرية للعملاء
34. طلبات متكررة آلية
35. كتالوج رقمي مشارك (QR)
36. بوت واتساب للرد التلقائي
37. إرسال جماعي للعملاء
38. تتبع التوصيل بـ GPS
39. توقيع رقمي عند الاستلام
40. تطبيق السواق المستقل
41. شحنات مجمعة لنفس المنطقة
42. حماية من الاحتيال (AI)
43. سجل العمليات الكامل
44. صلاحيات متعددة للموظفين
45. تقارير أداء الموظفين
46. حساب الرواتب والعمولات
47. PWA يشتغل بدون نت
48. مزامنة تلقائية عند عودة النت
49. Push Notifications
50. Dark Mode
51. Multi-Language (عربي/إنجليزي)
52. نظام 2FA للأمان
53. نسخ احتياطية تلقائية
54. استرجاع البيانات (Rollback)
55. تشفير البيانات الحساسة
56. حد ائتماني للعملاء
57. تنبيه تجاوز الحد الائتماني
58. تنبيه العملاء النائمين (+30 يوم)
59. ملاحظات خاصة على العملاء
60. تصنيف العملاء (عادي/VIP/مشكل)
61. كشف حساب كامل للعميل
62. فاتورة ضريبية رسمية
63. تقرير ضريبي شهري
64. تسوية نهاية اليوم
65. صندوق النقدية الرقمي
66. دفع مسبق مع خصم
67. ضمان موسع للمنتجات
68. تنبيه المنتجات الراكدة
69. اقتراح إعادة الطلب من المورد
70. تقرير الخسائر (صلاحيات منتهية)
71. نظام التسعير الديناميكي
72. AI يقترح سعر البيع المثالي
73. تنبيه السعر أقل من التكلفة
74. سجل تاريخ تغييرات السعر
75. منتجات مرتبطة بالسعر
76. خصم تلقائي حسب المبلغ
77. كوبونات ذكية (محدودة العدد/الوقت)
78. White Label جزئي للمتاجر
79. API مخصص للمتاجر الكبيرة
80. تقارير السوبر أدمن الشاملة
81. مؤشر صحة المتجر (AI)
82. توصيات AI لتحسين المبيعات
83. اكتشاف الأنماط (AI)
84. Chatbot للعميل (أسئلة متكررة)
85. ترجمة فورية (عربي/إنجليزي)
86. مسح باركود بالكاميرا (POS)
87. شاشة ثانية للعميل (POS)
88. فاتورة مقسمة (طرق دفع متعددة)
89. وضع فواتير معلقة (Hold)
90. اختصارات لوحة مفاتيح (POS)
91. وحدات قياس مرنة (حبة/علبة/كرتون)
92. تحويل الوحدات تلقائياً
93. بيع كسور (وزن تقريبي)
94. استيراد منتجات بـ Excel
95. تصدير المخزون لـ Excel/PDF
96. أرشفة الطلبات القديمة
97. تقارير مخصصة (فترة/منتج/عميل)
98. مؤشرات KPI للمتجر
99. Countdown Timer للعروض
100. نظام التنبؤ بالطلب الموسمي
101. فئات موسمية تلقائية
102. نظام الأسئلة المتشابهة (AI)
103. تحليل الشكاوى (AI)
104. تقرير استخدام AI بالتفصيل
105. Auto-Degradation عند الضغط
106. تكلفة استخدام AI لكل متجر
107. مفاتيح API متعددة + أولويات
108. نظام التحقق من جودة API
109. إحصائيات AI الشاملة
110. سجل أخطاء AI للتحسين

---

## 🚫 القواعد المطلقة

### ممنوع تماماً:
- ❌ الأدوية بأي شكل
- ❌ وصفات طبية
- ❌ إرشادات علاجية
- ❌ صور مخزنة على السيرفر
- ❌ API Keys في الكود
- ❌ PDF للفواتير (صور PNG فقط)
- ❌ فلاش بيور تمسك فلوس مباشرة

### مسموح فقط:
- ✅ مستلزمات طبية عامة
- ✅ أدوات الفحص والقياس
- ✅ معدات التمريض
- ✅ مستلزمات الإسعافات الأولية
- ✅ أجهزة قياس طبية
- ✅ معدات المستشفيات

---

## 🚀 خطة التطوير (Phases)

### Phase 1 (أسابيع 1-4):
- Supabase Setup + Auth
- Dashboard السوبر أدمن
- Dashboard صاحب المتجر
- إدارة المنتجات والأسعار

### Phase 2 (أسابيع 5-8):
- POS كامل مع باركود
- إدارة العملاء والأكواد
- نظام الطلبات
- الفواتير الحرارية (PNG)

### Phase 3 (أسابيع 9-12):
- WhatsApp Integration
- إرسال الفواتير كصور
- بوابة العميل البسيطة
- نظام الديون

### Phase 4 (أسابيع 13-16):
- AI Integration (Gemini + Groq)
- مسح فواتير الموردين بالكاميرا
- PWA Offline Mode
- التقارير المتقدمة

### Phase 5 (الإطلاق):
- Supabase RLS كامل
- Performance Optimization
- Testing شامل
- Launch 🚀

---

## 💡 تذكر دائماً

⚡ فلاش بيور = سرعة البرق + نقاء المستلزمات الطبية
🔴 كل عملية تُسجل
⚪ كل معاملة تُتابع
🏥 مستلزمات طبية فقط (ليست أدوية)
📱 الموبايل أولاً دائماً
🔒 الأمان دائماً في Backend
💰 مجاني في البداية (Supabase + Vercel)
🤖 AI للمساعدة مش للقرار النهائي
📸 الفاتورة = صورة PNG على واتساب دائماً

