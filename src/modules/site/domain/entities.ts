/**
 * إعدادات المنصة التي يتحكم فيها السوبر أدمن (المالك): الهوية، الألوان، الأحجام، السلايدر، أقسام الرئيسية،
 * الفوتر، طرق الدفع، وتشغيل/إخفاء أي قسم أو زرّ. لا توجد ألوان مقترحة: كل لون يختاره المالك بنفسه.
 */

export type FeatureKey =
  | 'freeRail' | 'latestLessons' | 'promoCard' | 'top10' | 'collections' | 'teacherSection'
  | 'howTo' | 'faq' | 'guestBanner' | 'codes' | 'googleLogin' | 'search' | 'saveButton'
  | 'inProgress' | 'freshRail' | 'subjectRails'
  | 'heroCards' | 'heroDots' | 'heroPlayPause' | 'heroPromoSlide' | 'heroBadge' | 'heroDescription' | 'heroSave' | 'heroMeta' | 'heroAutoplay' | 'heroScrollHint'
  | 'footer' | 'footerColumns' | 'footerSocial' | 'footerCta' | 'footerPayments' | 'footerContact' | 'footerBrand' | 'footerLegal'
  | 'topbarAuth' | 'walletLink' | 'requestEdit';

export type HomeSectionKey = 'inProgress' | 'free' | 'fresh' | 'latest' | 'promo' | 'top10' | 'collections' | 'subjects' | 'teacher' | 'howTo' | 'faq';
export type Audience = 'all' | 'guest' | 'student';
export type SocialKind = 'facebook' | 'instagram' | 'whatsapp' | 'tiktok' | 'youtube' | 'telegram' | 'x';

export interface HeroCard { id: string; on: boolean; title: string; line: string; button: string; href: string }
export interface FooterLink { id: string; label: string; href: string; on: boolean; who: Audience }
export interface FooterColumn { id: string; title: string; on: boolean; links: FooterLink[] }
export interface FooterSocial { id: string; kind: SocialKind; url: string; on: boolean }
export interface SitePage { id: string; slug: string; title: string; body: string; on: boolean }
export interface PaymentMethod {
  id: string; name: string; kind: 'demo' | 'manual'; enabled: boolean;
  account: string; holder: string; min: number; max: number; feePct: number;
  instructions: string; logo: string; showInFooter: boolean;
}

export interface SiteSettings {
  brand: { name: string; tagline: string; accent: string };
  teacher: { name: string; title: string; bio: string; photo: string };
  texts: {
    heroPromo: string; footerNote: string; contactPhone: string; contactWhatsapp: string; contactEmail: string;
    guestBannerText: string; guestBannerButton: string; promoButton: string; promoNote: string;
    topbarLogin: string; topbarSignup: string; teacherButton: string;
  };
  features: Record<FeatureKey, boolean>;
  /** مظهر المنصة: لون الخلفية، استدارة الملصقات والبطاقات، وشكل الأزرار. */
  appearance: { background: string; posterRadius: number; buttonShape: 'pill' | 'rounded' | 'sharp'; sharpAll: boolean };
  colors: {
    surface: string; surface2: string; text: string; muted: string;
    buttonBg: string; buttonText: string; heroOverlay: string; cardBg: string; cardText: string;
    footerBg: string; footerText: string; footerMuted: string; ctaFrom: string; ctaTo: string; ctaText: string;
  };
  sizes: {
    heroHeight: number; heroMinHeight: number; heroTitle: number; heroTitleWide: number; heroDesc: number; heroShade: number;
    cardOpacity: number; cardRadius: number; buttonHeight: number; gutter: number; gutterWide: number;
    topbar: number; topbarWide: number; sectionTitle: number; footerHeading: number; footerLink: number; socialSize: number;
  };
  hero: {
    slides: number; intervalSec: number; cards: HeroCard[];
    labels: { guest: string; subscribe: string; start: string; resume: string; view: string; badgeNew: string; badgePopular: string; promoGuest: string; promoStudent: string };
  };
  home: { order: HomeSectionKey[]; titles: Partial<Record<HomeSectionKey, string>> };
  footer: {
    columns: FooterColumn[]; socials: FooterSocial[]; legal: string;
    cta: { label: string; href: string; sub: string; who: Audience };
  };
  payments: { enabled: boolean; presets: number[]; methods: PaymentMethod[]; note: string };
  /** صفحات المعلومات (الخصوصية، الشروط...) تُعرض على /page/<slug> ويحرّر نصوصها المالك. */
  pages: SitePage[];
}

/* ---------- تسجيلات تستخدمها لوحة التحكم لبناء الأدوات تلقائياً ---------- */

export const FEATURE_GROUPS: { title: string; items: { key: FeatureKey; label: string; help: string }[] }[] = [
  { title: 'السلايدر العلوي', items: [
    { key: 'heroBadge', label: 'الشارة الصغيرة فوق العنوان', help: 'مثل «جديد» أو «الأكثر طلباً»' },
    { key: 'heroDescription', label: 'سطرا الوصف', help: 'وصف الكورس تحت العنوان' },
    { key: 'heroSave', label: 'زرّ «+» بجانب الزر الرئيسي', help: 'إضافة الكورس لقائمتي' },
    { key: 'heroMeta', label: 'سطر المعلومات (ساعات، دروس، تقييم)', help: 'تحت الوصف مباشرة' },
    { key: 'heroDots', label: 'نقاط الترقيم', help: 'أسفل السلايدر' },
    { key: 'heroPlayPause', label: 'زرّ إيقاف/تشغيل التمرير', help: 'بجانب النقاط' },
    { key: 'heroAutoplay', label: 'التمرير التلقائي', help: 'تنتقل الشرائح وحدها' },
    { key: 'heroPromoSlide', label: 'شريحة المدرّس والمنصة الأخيرة', help: 'آخر شريحة بصورة المدرّس' },
    { key: 'heroCards', label: 'الكروت الزجاجية أسفل السلايدر', help: 'تُعدَّل نصوصها من تبويب السلايدر' },
    { key: 'heroScrollHint', label: 'سهم النزول لأسفل', help: 'تحت الكروت' },
  ] },
  { title: 'أقسام الرئيسية', items: [
    { key: 'inProgress', label: 'صف «أكمل من حيث توقّفت»', help: 'للطالب الذي بدأ كورساً' },
    { key: 'freeRail', label: 'صف «شاهد أول درس مجاناً»', help: 'للزائر والطالب غير المشترك' },
    { key: 'freshRail', label: 'صف «كورسات جديدة»', help: 'الكورسات المعلَّمة جديدة' },
    { key: 'latestLessons', label: 'صف «أحدث الدروس»', help: 'بطاقات أفقية بمدة الدرس' },
    { key: 'promoCard', label: 'البطاقة الترويجية للزائر', help: 'بطاقة «اشترك للمشاهدة»' },
    { key: 'top10', label: 'قائمة «أفضل 10»', help: 'الأكثر مشاهدة' },
    { key: 'collections', label: 'قوائم مجمّعة', help: 'قوائم بملصقات متراصّة' },
    { key: 'subjectRails', label: 'صفوف المواد', help: 'صف لكل مادة' },
    { key: 'teacherSection', label: 'قسم «تعرّف على المدرّس»', help: 'صورة المدرّس ونبذة' },
    { key: 'howTo', label: 'قسم «كيفية الاشتراك»', help: 'اشتراك، شحن، كود' },
    { key: 'faq', label: 'الأسئلة الشائعة', help: 'للزائر في آخر الرئيسية' },
    { key: 'guestBanner', label: 'الشريط الثابت للزائر', help: 'أعلى شريط التبويب على الجوال' },
  ] },
  { title: 'الفوتر', items: [
    { key: 'footer', label: 'الفوتر بالكامل', help: 'إخفاء كل ما أسفل الصفحة' },
    { key: 'footerBrand', label: 'اسم المنصة ووصفها واسم المدرّس', help: 'أول الفوتر' },
    { key: 'footerColumns', label: 'أعمدة الروابط', help: 'المنصة، الحساب، أخرى...' },
    { key: 'footerContact', label: 'عمود «تواصل معنا»', help: 'الهاتف وواتساب والبريد' },
    { key: 'footerSocial', label: 'أيقونات التواصل الاجتماعي', help: 'فيسبوك، واتساب، إنستجرام...' },
    { key: 'footerCta', label: 'زرّ الدعوة في الفوتر', help: 'الزرّ الكبير والسطر تحته' },
    { key: 'footerPayments', label: 'شعارات طرق الدفع', help: 'الطرق المفعّلة والمعلَّمة «تظهر في الفوتر»' },
    { key: 'footerLegal', label: 'سطر الحقوق', help: 'آخر سطر في الصفحة' },
  ] },
  { title: 'الأزرار والأيقونات العامة', items: [
    { key: 'search', label: 'أيقونة البحث', help: 'في الشريط العلوي' },
    { key: 'topbarAuth', label: 'أزرار «دخول» و«ابدأ» في الشريط العلوي', help: 'للزائر على الشاشات الكبيرة' },
    { key: 'walletLink', label: 'رابط المحفظة في القوائم', help: 'قائمة الجوال وحسابي' },
    { key: 'requestEdit', label: 'رابط «طلب تعديل السنة أو الترم»', help: 'في القوائم والفوتر' },
    { key: 'saveButton', label: 'زرّ «+» وإضافة للقائمة', help: 'في صفحة الكورس' },
    { key: 'codes', label: 'أكواد الاشتراك', help: 'زرّ «عندي كود» وصفحة التفعيل' },
    { key: 'googleLogin', label: 'زرّ الدخول بجوجل', help: 'في صفحة الدخول والتسجيل' },
  ] },
];
export const FEATURES = FEATURE_GROUPS.flatMap((g) => g.items);

export const HOME_SECTIONS: { key: HomeSectionKey; label: string; feature?: FeatureKey; defaultTitle: string }[] = [
  { key: 'inProgress', label: 'أكمل من حيث توقّفت', feature: 'inProgress', defaultTitle: 'أكمل من حيث توقّفت' },
  { key: 'free', label: 'شاهد أول درس مجاناً', feature: 'freeRail', defaultTitle: 'شاهد أول درس مجاناً' },
  { key: 'fresh', label: 'كورسات جديدة', feature: 'freshRail', defaultTitle: '' },
  { key: 'latest', label: 'أحدث الدروس', feature: 'latestLessons', defaultTitle: '' },
  { key: 'promo', label: 'البطاقة الترويجية', feature: 'promoCard', defaultTitle: '' },
  { key: 'top10', label: 'أفضل 10', feature: 'top10', defaultTitle: '' },
  { key: 'collections', label: 'قوائم مجمّعة', feature: 'collections', defaultTitle: 'قوائم شائعة' },
  { key: 'subjects', label: 'صفوف المواد', feature: 'subjectRails', defaultTitle: '' },
  { key: 'teacher', label: 'تعرّف على المدرّس', feature: 'teacherSection', defaultTitle: 'تعرّف على المدرّس' },
  { key: 'howTo', label: 'كيفية الاشتراك', feature: 'howTo', defaultTitle: 'كيفية الاشتراك' },
  { key: 'faq', label: 'الأسئلة الشائعة', feature: 'faq', defaultTitle: 'هل لديك أي أسئلة؟' },
];

type ColorDef = { id: string; group: string; label: string; help: string; get: (s: SiteSettings) => string; set: (s: SiteSettings, v: string) => SiteSettings };
const col = (key: keyof SiteSettings['colors']) => ({ get: (s: SiteSettings) => s.colors[key], set: (s: SiteSettings, v: string): SiteSettings => ({ ...s, colors: { ...s.colors, [key]: v } }) });

export const COLOR_DEFS: ColorDef[] = [
  { id: 'accent', group: 'عام', label: 'اللون الرئيسي', help: 'الروابط والتحديد والشريط الثابت', get: (s) => s.brand.accent, set: (s, v) => ({ ...s, brand: { ...s.brand, accent: v } }) },
  { id: 'background', group: 'عام', label: 'خلفية المنصة', help: 'خلف كل الصفحات', get: (s) => s.appearance.background, set: (s, v) => ({ ...s, appearance: { ...s.appearance, background: v } }) },
  { id: 'surface', group: 'عام', label: 'لون الكتل والبطاقات', help: 'الأسئلة الشائعة وكتل الصفحات', ...col('surface') },
  { id: 'surface2', group: 'عام', label: 'لون الكتل الثانوي', help: 'عند المرور أو التحديد', ...col('surface2') },
  { id: 'text', group: 'عام', label: 'لون النص الأساسي', help: 'العناوين والنصوص', ...col('text') },
  { id: 'muted', group: 'عام', label: 'لون النص الخافت', help: 'الأوصاف والأسطر الفرعية', ...col('muted') },
  { id: 'buttonBg', group: 'الأزرار', label: 'خلفية الزرّ الرئيسي', help: 'كل الأزرار الأساسية', ...col('buttonBg') },
  { id: 'buttonText', group: 'الأزرار', label: 'نص الزرّ الرئيسي', help: 'لون الكتابة داخل الزرّ', ...col('buttonText') },
  { id: 'heroOverlay', group: 'السلايدر', label: 'لون التظليل على صور السلايدر', help: 'يتدرّج من أسفل الصورة', ...col('heroOverlay') },
  { id: 'cardBg', group: 'السلايدر', label: 'خلفية الكروت الزجاجية', help: 'شفافيتها من تبويب الأحجام', ...col('cardBg') },
  { id: 'cardText', group: 'السلايدر', label: 'نص الكروت الزجاجية', help: 'العناوين والأسطر داخل الكروت', ...col('cardText') },
  { id: 'footerBg', group: 'الفوتر', label: 'خلفية الفوتر', help: '', ...col('footerBg') },
  { id: 'footerText', group: 'الفوتر', label: 'عناوين الفوتر', help: '', ...col('footerText') },
  { id: 'footerMuted', group: 'الفوتر', label: 'روابط وأيقونات الفوتر', help: 'اللون الخافت', ...col('footerMuted') },
  { id: 'ctaFrom', group: 'زرّ الفوتر', label: 'بداية التدرّج', help: 'لو أردت لوناً واحداً اجعل البداية والنهاية متطابقتين', ...col('ctaFrom') },
  { id: 'ctaTo', group: 'زرّ الفوتر', label: 'نهاية التدرّج', help: '', ...col('ctaTo') },
  { id: 'ctaText', group: 'زرّ الفوتر', label: 'نص الزرّ', help: '', ...col('ctaText') },
];

export interface SizeDef { key: keyof SiteSettings['sizes']; group: string; label: string; help: string; min: number; max: number; step: number; unit: string }
export const SIZE_DEFS: SizeDef[] = [
  { key: 'heroHeight', group: 'السلايدر', label: 'ارتفاع السلايدر', help: 'نسبة من ارتفاع الشاشة', min: 40, max: 100, step: 1, unit: '٪' },
  { key: 'heroMinHeight', group: 'السلايدر', label: 'أقل ارتفاع للسلايدر', help: 'لا ينزل عنه مهما صغرت الشاشة', min: 300, max: 900, step: 10, unit: 'px' },
  { key: 'heroTitle', group: 'السلايدر', label: 'حجم عنوان الشريحة (جوال)', help: '', min: 22, max: 90, step: 1, unit: 'px' },
  { key: 'heroTitleWide', group: 'السلايدر', label: 'حجم عنوان الشريحة (شاشة كبيرة)', help: '', min: 30, max: 120, step: 1, unit: 'px' },
  { key: 'heroDesc', group: 'السلايدر', label: 'حجم الوصف', help: '', min: 12, max: 24, step: 1, unit: 'px' },
  { key: 'heroShade', group: 'السلايدر', label: 'قوة التظليل أسفل الصورة', help: '٠ بلا تظليل', min: 0, max: 100, step: 1, unit: '٪' },
  { key: 'cardOpacity', group: 'الكروت الزجاجية', label: 'شفافية خلفية الكروت', help: '٠ شفاف تماماً، ١٠٠ مصمت', min: 0, max: 100, step: 1, unit: '٪' },
  { key: 'cardRadius', group: 'الكروت الزجاجية', label: 'استدارة الكروت', help: '', min: 0, max: 48, step: 1, unit: 'px' },
  { key: 'buttonHeight', group: 'الأزرار', label: 'ارتفاع الأزرار', help: 'الزرّ الكبير يزيد عنه ٤ بكسل', min: 36, max: 68, step: 1, unit: 'px' },
  { key: 'gutter', group: 'الصفحة', label: 'الهامش الجانبي (جوال)', help: '', min: 6, max: 48, step: 1, unit: 'px' },
  { key: 'gutterWide', group: 'الصفحة', label: 'الهامش الجانبي (شاشة كبيرة)', help: '', min: 12, max: 120, step: 2, unit: 'px' },
  { key: 'topbar', group: 'الصفحة', label: 'ارتفاع الشريط العلوي (جوال)', help: '', min: 40, max: 80, step: 1, unit: 'px' },
  { key: 'topbarWide', group: 'الصفحة', label: 'ارتفاع الشريط العلوي (شاشة كبيرة)', help: '', min: 44, max: 100, step: 1, unit: 'px' },
  { key: 'sectionTitle', group: 'الصفحة', label: 'حجم عناوين الأقسام', help: '', min: 16, max: 40, step: 1, unit: 'px' },
  { key: 'footerHeading', group: 'الفوتر', label: 'حجم عناوين الفوتر', help: '', min: 13, max: 28, step: 1, unit: 'px' },
  { key: 'footerLink', group: 'الفوتر', label: 'حجم روابط الفوتر', help: '', min: 12, max: 24, step: 1, unit: 'px' },
  { key: 'socialSize', group: 'الفوتر', label: 'حجم أيقونات التواصل', help: '', min: 16, max: 48, step: 1, unit: 'px' },
];

export const RADII = [{ name: 'حادّة', value: 4 }, { name: 'ناعمة', value: 16 }, { name: 'دائرية', value: 26 }];
export const SOCIAL_KINDS: { kind: SocialKind; label: string }[] = [
  { kind: 'facebook', label: 'فيسبوك' }, { kind: 'whatsapp', label: 'واتساب' }, { kind: 'instagram', label: 'إنستجرام' },
  { kind: 'tiktok', label: 'تيك توك' }, { kind: 'youtube', label: 'يوتيوب' }, { kind: 'telegram', label: 'تيليجرام' }, { kind: 'x', label: 'إكس' },
];
export const AUDIENCES: { value: Audience; label: string }[] = [{ value: 'all', label: 'الجميع' }, { value: 'guest', label: 'الزائر فقط' }, { value: 'student', label: 'الطالب فقط' }];

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

export const isSiteSettings = (x: unknown): x is SiteSettings => {
  const s = x as SiteSettings;
  return !!s && typeof s.brand?.name === 'string' && typeof s.teacher?.name === 'string' && typeof s.texts === 'object' && typeof s.features === 'object';
};
