import { HOME_SECTIONS, type FooterColumn, type HomeSectionKey, type PaymentMethod, type SitePage, type SiteSettings } from './entities';

const link = (id: string, label: string, href: string, who: 'all' | 'guest' | 'student' = 'all') => ({ id, label, href, on: true, who });
const method = (id: string, name: string, over: Partial<PaymentMethod> = {}): PaymentMethod => ({
  id, name, kind: 'manual', enabled: false, account: '', holder: '', min: 10, max: 5000, feePct: 0,
  instructions: 'حوّل المبلغ على الرقم الموضّح، ثم اكتب رقم العملية أو آخر ٤ أرقام من رقم المحوِّل وأرسل الطلب. يُضاف الرصيد بعد مراجعته.',
  logo: '', showInFooter: true, ...over,
});

const COLUMNS_FN = (info: FooterColumn): FooterColumn[] => [
  { id: 'platform', title: 'المنصة', on: true, links: [link('courses', 'الكورسات', '/courses'), link('learning', 'مساراتي', '/my-learning'), link('wallet', 'المحفظة', '/wallet'), link('redeem', 'عندي كود', '/redeem')] },
  { id: 'account', title: 'الحساب', on: true, links: [link('login', 'تسجيل الدخول', '/login', 'guest'), link('signup', 'إنشاء حساب', '/login?mode=signup', 'guest'), link('faq', 'الأسئلة الشائعة', '/#faq')] },
  info,
  { id: 'other', title: 'أخرى', on: true, links: [link('request', 'طلب تعديل السنة أو الترم', '/support-request', 'student')] },
];


/** نصوص افتراضية عامة تصلح كبداية. راجعها وعدّلها بما يناسب نشاطك وقوانين بلدك قبل التشغيل الفعلي. */
export const DEFAULT_PAGES: SitePage[] = [
  { id: 'about', slug: 'about', title: 'من نحن', on: true, body: `## عن {name}
{name} منصة تعليمية تقدّم شرحاً مصوّراً لمنهجك الدراسي بالعربية، مع متابعة تقدّمك درساً بعد درس.

## ماذا نقدّم
- كورسات مصوّرة مرتّبة حسب الصف والمادة والترم.
- أول درس في كل كورس مجاني للتجربة.
- متابعة تقدّمك ومساراتك من حسابك.

## تواصل معنا
يسعدنا تواصلك في أي وقت عبر البيانات الموجودة أسفل الصفحة.` },
  { id: 'privacy', slug: 'privacy', title: 'سياسة الخصوصية', on: true, body: `## مقدمة
نحترم خصوصيتك. توضّح هذه الصفحة ما نجمعه من بيانات على {name} ولماذا نجمعه وكيف نحميه.

## البيانات التي نجمعها
- بيانات الحساب: الاسم والبريد الإلكتروني والصف الدراسي.
- بيانات الاستخدام: الدروس التي شاهدتها وتقدّمك فيها والكورسات التي حفظتها.
- بيانات المحفظة: العمليات التي تمت على رصيدك وطلبات الشحن، دون أي بيانات بطاقات.

## كيف نستخدم بياناتك
- لإنشاء حسابك وتفعيل اشتراكاتك وإظهار تقدّمك.
- للرد على طلباتك ومشكلاتك.
- لتحسين المنصة ومحتواها.

## مشاركة البيانات
لا نبيع بياناتك. قد نشاركها فقط مع مزوّدي الخدمات الضروريين لتشغيل المنصة (مثل الاستضافة والدفع)، أو عند طلب جهة قانونية مختصة.

## حفظ البيانات وحمايتها
نتخذ إجراءات معقولة لحماية بياناتك، ونحتفظ بها طالما حسابك قائم أو لازمة لتقديم الخدمة.

## حقوقك
يمكنك طلب تعديل بياناتك أو حذف حسابك بالتواصل معنا.

## التواصل
لأي استفسار عن الخصوصية راسلنا على {email}.` },
  { id: 'terms', slug: 'terms', title: 'الشروط والأحكام', on: true, body: `## القبول بالشروط
باستخدامك {name} فأنت توافق على هذه الشروط.

## الحساب
- أنت مسؤول عن سرية بيانات دخولك وعن كل نشاط يتم من حسابك.
- الحساب شخصي ولا يجوز مشاركته مع الآخرين.

## الاشتراك والمحتوى
- يمنحك الاشتراك حق مشاهدة الكورس طوال مدته المحددة وقت الاشتراك.
- المحتوى مملوك للمنصة والمدرّس، ولا يجوز نسخه أو تسجيله أو إعادة نشره أو بيعه.

## المحفظة والدفع
- يُضاف رصيد المحفظة بعد إتمام عملية الشحن ومراجعتها.
- أسعار الاشتراكات قابلة للتغيير، والسعر المعروض وقت الاشتراك هو المعتمد.

## إيقاف الحساب
يحق لنا إيقاف أي حساب يخالف هذه الشروط أو يسيء استخدام المنصة.

## التعديلات
قد نحدّث هذه الشروط من وقت لآخر، واستمرارك في الاستخدام يعني موافقتك على النسخة المحدّثة.` },
  { id: 'refund', slug: 'refund', title: 'سياسة الاسترداد', on: true, body: `## الاشتراكات
اكتب هنا سياسة الاسترداد التي تحددها أنت، مثل المدة المسموحة لطلب الاسترداد وشروطه.

## رصيد المحفظة
اذكر هنا هل يمكن استرداد الرصيد غير المستخدم، وكيف يطلب الطالب ذلك.

## طريقة الطلب
اشرح هنا كيف يتواصل الطالب معك لطلب الاسترداد والمدة التي تستغرقها المراجعة.` },
];

const INFO_COLUMN: FooterColumn = { id: 'info', title: 'معلومات', on: true, links: [
  link('about', 'من نحن', '/page/about'), link('privacy', 'سياسة الخصوصية', '/page/privacy'), link('terms', 'الشروط والأحكام', '/page/terms'), link('refund', 'سياسة الاسترداد', '/page/refund'),
] };

const COLUMNS = COLUMNS_FN(INFO_COLUMN);

export const DEFAULT_SITE: SiteSettings = {
  brand: { name: 'مدار', tagline: 'شرح مصوّر لمنهجك الدراسي بالعربية، وتتابع تقدّمك درساً بعد درس.', accent: '#2997ff' },
  teacher: {
    name: 'محمود الشريف',
    title: 'مدرّس الرياضيات للمرحلتين الإعدادية والثانوية',
    bio: 'أشرح الرياضيات بطريقة مبسّطة وبالأمثلة، وأتابع معك كل وحدة بتدريبات ومراجعات قبل الامتحان.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=75',
  },
  texts: {
    heroPromo: 'شاهد آلاف الدقائق من شرح منهجك الدراسي.', footerNote: '', contactPhone: '', contactWhatsapp: '', contactEmail: '',
    guestBannerText: 'ابدأ التعلّم على {name}.', guestBannerButton: 'أنشئ حسابك', promoButton: 'اشترك للمشاهدة',
    promoNote: 'تبدأ الأسعار من {price} للترم، وأول درس في كل كورس مجاني.',
    topbarLogin: 'دخول', topbarSignup: 'ابدأ مجاناً', teacherButton: 'استعرض الكورسات',
  },
  features: {
    freeRail: true, latestLessons: true, promoCard: true, top10: true, collections: true, teacherSection: true,
    howTo: true, faq: true, guestBanner: true, codes: true, googleLogin: true, search: true, saveButton: true,
    inProgress: true, freshRail: true, subjectRails: true,
    heroCards: true, heroDots: true, heroPlayPause: true, heroPromoSlide: true, heroBadge: true, heroDescription: true, heroSave: false, heroMeta: false, heroAutoplay: true, heroScrollHint: true,
    footer: true, footerColumns: true, footerSocial: true, footerCta: true, footerPayments: true, footerContact: true, footerBrand: true, footerLegal: true,
    topbarAuth: true, walletLink: true, requestEdit: true,
  },
  appearance: { background: '#000000', posterRadius: 18, buttonShape: 'pill', sharpAll: false },
  colors: {
    surface: '#272729', surface2: '#2a2a2c', text: '#f5f5f7', muted: '#cccccc',
    buttonBg: '#0066cc', buttonText: '#ffffff', heroOverlay: '#000000', cardBg: '#272729', cardText: '#ffffff',
    footerBg: '#f5f5f7', footerText: '#1d1d1f', footerMuted: '#333333', ctaFrom: '#0066cc', ctaTo: '#0066cc', ctaText: '#ffffff',
  },
  sizes: {
    heroHeight: 100, heroMinHeight: 560, heroTitle: 40, heroTitleWide: 56, heroDesc: 17, heroShade: 100,
    cardOpacity: 80, cardRadius: 18, buttonHeight: 44, gutter: 16, gutterWide: 32,
    topbar: 48, topbarWide: 52, sectionTitle: 28, footerHeading: 15, footerLink: 14, socialSize: 24,
  },
  hero: {
    slides: 3, intervalSec: 7,
    cards: [
      { id: 'c1', on: true, title: 'أول درس مجاناً', line: 'جرّب أي كورس مجاناً، ثم تبدأ الأسعار من {price} للترم.', button: 'ابدأ مجاناً', href: '/courses' },
      { id: 'c2', on: true, title: 'محفظتك وأكوادك', line: 'اشحن رصيدك أو فعّل كود الاشتراك من المدرّس.', button: 'اشحن رصيدك', href: '/wallet' },
    ],
    labels: {
      guest: 'شاهد أول درس مجاناً', subscribe: 'اشترك للمشاهدة', start: 'ابدأ التعلّم', resume: 'أكمل التعلّم', view: 'عرض الكورس',
      badgeNew: 'جديد على مدار', badgePopular: 'الأكثر طلباً', promoGuest: 'ابدأ الاشتراك', promoStudent: 'اشحن رصيدك',
    },
  },
  home: { order: HOME_SECTIONS.map((s) => s.key), titles: {} },
  footer: {
    columns: COLUMNS,
    socials: [
      { id: 'facebook', kind: 'facebook', url: '', on: true },
      { id: 'whatsapp', kind: 'whatsapp', url: '', on: true },
      { id: 'instagram', kind: 'instagram', url: '', on: true },
    ],
    legal: 'جميع الحقوق محفوظة © {year} لمنصة {name}',
    cta: { label: 'ابدأ بأول درس مجاني', href: '/login?mode=signup', sub: 'أول درس في كل كورس مجاني، وبعدها اشترك بالترم.', who: 'guest' },
  },
  payments: {
    enabled: true, presets: [50, 100, 200, 500, 1000], note: '',
    methods: [
      method('demo', 'شحن تجريبي (فوري)', { kind: 'demo', enabled: true, showInFooter: false, instructions: 'شحن تجريبي لا يخصم أموالاً حقيقية. أوقفه عند تشغيل المنصة فعلياً.' }),
      method('vodafone', 'فودافون كاش'),
      method('etisalat', 'اتصالات كاش'),
      method('orange', 'أورنج كاش'),
      method('instapay', 'إنستاباي'),
      method('card', 'بطاقة بنكية', { instructions: 'الدفع بالبطاقة يحتاج ربط بوابة دفع (Paymob) على الخادم. إلى ذلك الحين أضف تعليمات بديلة أو أبقه متوقفاً.' }),
    ],
  },
  pages: DEFAULT_PAGES,
};

const mergeById = <T extends { id: string }>(base: T[], saved: T[] | undefined): T[] => (saved && Array.isArray(saved) ? saved : base);

const normalizeOrder = (saved: HomeSectionKey[] | undefined): HomeSectionKey[] => {
  const all = HOME_SECTIONS.map((s) => s.key);
  const kept = (saved ?? []).filter((k, i, a) => all.includes(k) && a.indexOf(k) === i);
  return [...kept, ...all.filter((k) => !kept.includes(k))];
};

/** إعدادات محفوظة قبل ظهور صفحات المعلومات لا تحوي عمود «معلومات»: نضيفه مرة واحدة قبل عمود «أخرى». */
const migrateColumns = (s: Partial<SiteSettings>): FooterColumn[] => {
  const saved = s.footer?.columns;
  if (!saved || !Array.isArray(saved)) return DEFAULT_SITE.footer.columns;
  if (s.pages !== undefined || saved.some((c) => c.id === 'info')) return saved;
  const at = saved.findIndex((c) => c.id === 'other');
  return at < 0 ? [...saved, INFO_COLUMN] : [...saved.slice(0, at), INFO_COLUMN, ...saved.slice(at)];
};

type Saved = { [K in keyof SiteSettings]?: Partial<SiteSettings[K]> };

/** يدمج إعداداً محفوظاً مع الافتراضي حتى تظهر الحقول الجديدة بعد أي تحديث للنظام. */
export const withDefaults = (saved: Saved): SiteSettings => {
  const d = DEFAULT_SITE;
  const s = saved as Partial<SiteSettings>;
  return {
    brand: { ...d.brand, ...s.brand },
    teacher: { ...d.teacher, ...s.teacher },
    texts: { ...d.texts, ...s.texts },
    features: { ...d.features, ...s.features },
    appearance: { ...d.appearance, ...s.appearance },
    colors: { ...d.colors, ...s.colors },
    sizes: { ...d.sizes, ...s.sizes },
    hero: { ...d.hero, ...s.hero, labels: { ...d.hero.labels, ...s.hero?.labels }, cards: mergeById(d.hero.cards, s.hero?.cards) },
    home: { order: normalizeOrder(s.home?.order), titles: { ...d.home.titles, ...s.home?.titles } },
    footer: { ...d.footer, ...s.footer, cta: { ...d.footer.cta, ...s.footer?.cta }, columns: migrateColumns(s), socials: mergeById(d.footer.socials, s.footer?.socials) },
    pages: s.pages && Array.isArray(s.pages) ? s.pages : d.pages,
    payments: { ...d.payments, ...s.payments, methods: mergeById(d.payments.methods, s.payments?.methods), presets: s.payments?.presets ?? d.payments.presets },
  };
};
