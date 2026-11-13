import type { Result } from '../../../core/result';
import { COLOR_DEFS, SIZE_DEFS, SLUG_RE, isHex, type FeatureKey, type SiteSettings, type HomeSectionKey } from '../domain/entities';
import { DEFAULT_SITE } from '../domain/defaults';

const clean = (s: string) => s.trim().replace(/\s+/g, ' ');
const ok = (value: SiteSettings): Result<SiteSettings> => ({ ok: true, value });
const fail = (error: string): Result<SiteSettings> => ({ ok: false, error });
const phone = /^[+\d\s-]{6,20}$/;
const href = (v: string) => v === '' || v.startsWith('/') || v.startsWith('#') || /^https?:\/\//.test(v) || /^(tel|mailto):/.test(v);

/** فحص شامل لأي إعداد قبل حفظه، حتى لا تنكسر الواجهة بقيمة خاطئة. */
export const validateSite = (s: SiteSettings): string | null => {
  if (!s.brand.name) return 'اسم المنصة لا يمكن أن يكون فارغاً.';
  if (s.brand.name.length > 30) return 'اسم المنصة طويل (٣٠ حرفاً كحد أقصى).';
  if (!s.teacher.name) return 'اسم المدرّس لا يمكن أن يكون فارغاً.';
  if (s.teacher.photo && !/^https?:\/\//.test(s.teacher.photo)) return 'رابط الصورة يجب أن يبدأ بـ https://';
  if (s.texts.contactEmail && !/^\S+@\S+\.\S+$/.test(s.texts.contactEmail.trim())) return 'البريد الإلكتروني غير صحيح.';
  if (s.texts.contactPhone && !phone.test(s.texts.contactPhone)) return 'رقم الهاتف غير صحيح.';
  if (s.texts.contactWhatsapp && !phone.test(s.texts.contactWhatsapp)) return 'رقم واتساب غير صحيح.';
  for (const c of COLOR_DEFS) if (!isHex(c.get(s))) return `«${c.label}»: اللون يجب أن يكون بصيغة #RRGGBB.`;
  for (const z of SIZE_DEFS) { const v = s.sizes[z.key]; if (!Number.isFinite(v) || v < z.min || v > z.max) return `«${z.label}»: القيمة من ${z.min} إلى ${z.max}.`; }
  if (!(s.appearance.posterRadius >= 0 && s.appearance.posterRadius <= 32)) return 'استدارة الملصقات من ٠ إلى ٣٢.';
  if (!['pill', 'rounded', 'sharp'].includes(s.appearance.buttonShape)) return 'شكل الأزرار غير صحيح.';
  if (!(s.hero.slides >= 1 && s.hero.slides <= 8)) return 'عدد شرائح السلايدر من ١ إلى ٨.';
  if (!(s.hero.intervalSec >= 2 && s.hero.intervalSec <= 30)) return 'مدة الشريحة من ٢ إلى ٣٠ ثانية.';
  for (const c of s.hero.cards) if (!href(c.href)) return `رابط الكرت «${c.title}» غير صحيح.`;
  for (const col of s.footer.columns) for (const l of col.links) if (!href(l.href)) return `رابط «${l.label}» غير صحيح (يبدأ بـ / أو https://).`;
  for (const so of s.footer.socials) if (so.url && !/^https?:\/\//.test(so.url)) return 'روابط التواصل الاجتماعي يجب أن تبدأ بـ https://';
  if (!href(s.footer.cta.href)) return 'رابط زرّ الفوتر غير صحيح.';
  for (const m of s.payments.methods) {
    if (!m.name.trim()) return 'اسم طريقة الدفع لا يمكن أن يكون فارغاً.';
    if (!(m.min >= 1) || !(m.max >= m.min)) return `«${m.name}»: الحد الأقصى يجب أن يساوي الأدنى أو يزيد عليه (والأدنى ١ على الأقل).`;
    if (!(m.feePct >= 0 && m.feePct <= 50)) return `«${m.name}»: الرسوم من ٠ إلى ٥٠٪.`;
    if (m.logo && !/^https?:\/\//.test(m.logo)) return `«${m.name}»: رابط الشعار يجب أن يبدأ بـ https://`;
  }
  const slugs = new Set<string>();
  for (const p of s.pages) {
    if (!p.title.trim()) return 'عنوان الصفحة لا يمكن أن يكون فارغاً.';
    if (!SLUG_RE.test(p.slug) || p.slug.length > 40) return `«${p.title}»: الرابط حروف إنجليزية صغيرة وأرقام وشرطات فقط (مثل privacy).`;
    if (slugs.has(p.slug)) return `الرابط «${p.slug}» مستخدم في صفحة أخرى.`;
    slugs.add(p.slug);
    if (p.body.length > 30000) return `«${p.title}»: النص طويل جداً.`;
  }
  if (s.payments.presets.some((p) => !Number.isInteger(p) || p < 1)) return 'مبالغ الشحن السريعة أعداد صحيحة موجبة.';
  return null;
};

/** يطبّق تعديلاً على الإعدادات ويفحص النتيجة كاملة. */
export const edit = (s: SiteSettings, fn: (draft: SiteSettings) => SiteSettings): Result<SiteSettings> => {
  const next = fn(s);
  const err = validateSite(next);
  return err ? fail(err) : ok(next);
};

export const setBrand = (s: SiteSettings, patch: Partial<SiteSettings['brand']>) => edit(s, (d) => ({ ...d, brand: { ...d.brand, ...patch, name: clean(patch.name ?? d.brand.name) } }));
export const setTeacher = (s: SiteSettings, patch: Partial<SiteSettings['teacher']>) => edit(s, (d) => ({ ...d, teacher: { ...d.teacher, ...patch, name: clean(patch.name ?? d.teacher.name) } }));
export const setTexts = (s: SiteSettings, patch: Partial<SiteSettings['texts']>) => edit(s, (d) => ({ ...d, texts: { ...d.texts, ...patch } }));
export const setAppearance = (s: SiteSettings, patch: Partial<SiteSettings['appearance']>) => edit(s, (d) => ({ ...d, appearance: { ...d.appearance, ...patch } }));
export const setSize = (s: SiteSettings, key: keyof SiteSettings['sizes'], v: number) => edit(s, (d) => ({ ...d, sizes: { ...d.sizes, [key]: v } }));
export const setHero = (s: SiteSettings, patch: Partial<Omit<SiteSettings['hero'], 'labels'>>) => edit(s, (d) => ({ ...d, hero: { ...d.hero, ...patch } }));
export const setHeroLabels = (s: SiteSettings, patch: Partial<SiteSettings['hero']['labels']>) => edit(s, (d) => ({ ...d, hero: { ...d.hero, labels: { ...d.hero.labels, ...patch } } }));
export const setFooter = (s: SiteSettings, patch: Partial<Omit<SiteSettings['footer'], 'cta'>>) => edit(s, (d) => ({ ...d, footer: { ...d.footer, ...patch } }));
export const setFooterCta = (s: SiteSettings, patch: Partial<SiteSettings['footer']['cta']>) => edit(s, (d) => ({ ...d, footer: { ...d.footer, cta: { ...d.footer.cta, ...patch } } }));
export const setPayments = (s: SiteSettings, patch: Partial<SiteSettings['payments']>) => edit(s, (d) => ({ ...d, payments: { ...d.payments, ...patch } }));
export const setHomeTitle = (s: SiteSettings, key: HomeSectionKey, title: string) => edit(s, (d) => ({ ...d, home: { ...d.home, titles: { ...d.home.titles, [key]: title.trim() } } }));

export const setColor = (s: SiteSettings, id: string, value: string) => {
  const def = COLOR_DEFS.find((c) => c.id === id);
  return def ? edit(s, (d) => def.set(d, value.trim())) : fail('لون غير معروف.');
};

/** ينقل قسماً في ترتيب الرئيسية خطوة لأعلى (-1) أو لأسفل (+1). */
export const moveSection = (s: SiteSettings, key: HomeSectionKey, dir: -1 | 1): SiteSettings => {
  const order = [...s.home.order]; const i = order.indexOf(key); const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return s;
  [order[i], order[j]] = [order[j], order[i]];
  return { ...s, home: { ...s.home, order } };
};

/** ينقل عنصراً داخل قائمة (أعمدة، روابط، كروت...) خطوة واحدة. */
export const moveItem = <T,>(list: T[], index: number, dir: -1 | 1): T[] => {
  const j = index + dir;
  if (index < 0 || j < 0 || j >= list.length) return list;
  const out = [...list]; [out[index], out[j]] = [out[j], out[index]]; return out;
};

export const setPages = (s: SiteSettings, pages: SiteSettings['pages']) => edit(s, (d) => ({ ...d, pages }));
export const setFeature = (s: SiteSettings, key: FeatureKey, on: boolean): SiteSettings => ({ ...s, features: { ...s.features, [key]: on } });
export const resetSite = (): SiteSettings => DEFAULT_SITE;
