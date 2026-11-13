import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Result } from '../../../core/result';
import {
  AUDIENCES, COLOR_DEFS, FEATURE_GROUPS, HOME_SECTIONS, SIZE_DEFS, SOCIAL_KINDS,
  type Audience, type FooterColumn, type FooterLink, type SiteSettings, type SocialKind,
} from '../domain/entities';
import { DEFAULT_SITE } from '../domain/defaults';
import {
  moveItem, moveSection, setPages, setAppearance, setBrand, setColor, setFeature, setFooter, setFooterCta, setHero, setHeroLabels, setHomeTitle, setSize, setTeacher, setTexts,
} from '../application/editSite';
import { AddButton, Chips, Collapsible, ColorField, ItemTools, Row, Section, SelectField, ShapePicker, StepperRow, Switch, TextField, ToggleRow } from './controls';

export interface TabProps { site: SiteSettings; save: (r: Result<SiteSettings> | SiteSettings) => void }
const uid = () => Math.random().toString(36).slice(2, 8);
const text = <K extends keyof SiteSettings['texts']>(k: K, v: string) => ({ [k]: v }) as Partial<SiteSettings['texts']>;

const FeatureList: React.FC<TabProps & { group: number; only?: string[] }> = ({ site, save, group, only }) => (
  <>
    {FEATURE_GROUPS[group].items.filter((i) => !only || only.includes(i.key)).map((i) => (
      <ToggleRow key={i.key} label={i.label} help={i.help} on={site.features[i.key]} onChange={(v) => save(setFeature(site, i.key, v))} />
    ))}
  </>
);

/* ---------------------------------------------------------------- الهوية والنصوص */
export const IdentityTab: React.FC<TabProps> = ({ site, save }) => {
  const [teacherChanged, setTeacherChanged] = useState(false);
  const T = (k: keyof SiteSettings['texts'], label: string, help?: string, multiline?: boolean, ph?: string) => (
    <Row label={label} help={help}><TextField value={site.texts[k]} aria={label} multiline={multiline} ph={ph} onCommit={(v) => save(setTexts(site, text(k, v)))} /></Row>
  );
  return (
    <>
      <Section title="الهوية">
        <Row label="اسم المنصة" help="يظهر في الشعار والعنوان والفوتر"><TextField value={site.brand.name} aria="اسم المنصة" onCommit={(v) => save(setBrand(site, { name: v }))} /></Row>
        <Row label="الوصف المختصر" help="يظهر في الفوتر"><TextField value={site.brand.tagline} aria="الوصف المختصر" multiline onCommit={(v) => save(setBrand(site, { tagline: v }))} /></Row>
      </Section>

      <Section title="شكل الزوايا" help="اختر الشكل من المعاينة. «حادّة في كل المنصة» تلغي الاستدارة من الأزرار والبطاقات والملصقات والحقول معاً.">
        <Row label="شكل الأزرار">
          <ShapePicker kind="button" aria="شكل الأزرار" value={site.appearance.buttonShape === 'pill' ? 9999 : site.appearance.buttonShape === 'rounded' ? 12 : 0}
            options={[{ value: 9999, label: 'كبسولة' }, { value: 12, label: 'ناعمة' }, { value: 0, label: 'حادّة' }]}
            onChange={(v) => save(setAppearance(site, { buttonShape: v === 9999 ? 'pill' : v === 12 ? 'rounded' : 'sharp' }))} />
        </Row>
        <Row label="شكل ملصقات الكورسات">
          <ShapePicker kind="poster" aria="شكل الملصقات" value={site.appearance.posterRadius}
            options={[{ value: 0, label: 'حادّة' }, { value: 16, label: 'ناعمة' }, { value: 26, label: 'دائرية' }]}
            onChange={(v) => save(setAppearance(site, { posterRadius: v }))} />
        </Row>
        <StepperRow label="استدارة الملصقات بدقة" help="لو أردت قيمة بين الأشكال" value={site.appearance.posterRadius} min={0} max={32} unit="px" aria="استدارة الملصقات" defaultValue={DEFAULT_SITE.appearance.posterRadius} onChange={(n) => save(setAppearance(site, { posterRadius: n }))} />
        <ToggleRow label="حادّة في كل المنصة" help="زوايا مستقيمة في كل الأزرار والبطاقات والحقول" on={site.appearance.sharpAll} onChange={(v) => save(setAppearance(site, { sharpAll: v }))} />
      </Section>

      <Section title="المدرّس">
        <Row label="الاسم"><TextField value={site.teacher.name} aria="اسم المدرّس" onCommit={(v) => { save(setTeacher(site, { name: v })); setTeacherChanged(true); }} /></Row>
        <Row label="اللقب"><TextField value={site.teacher.title} aria="لقب المدرّس" onCommit={(v) => save(setTeacher(site, { title: v }))} /></Row>
        <Row label="نبذة"><TextField value={site.teacher.bio} aria="نبذة عن المدرّس" multiline onCommit={(v) => save(setTeacher(site, { bio: v }))} /></Row>
        <Row label="رابط الصورة" help="رابط مباشر يبدأ بـ https://"><TextField value={site.teacher.photo} aria="رابط صورة المدرّس" ph="https://" ltr onCommit={(v) => { save(setTeacher(site, { photo: v })); setTeacherChanged(true); }} /></Row>
        {teacherChanged && (
          <div className="flex items-center gap-3 py-3 text-[14px] text-gold">
            يظهر الاسم والصورة الجديدان على بطاقات الكورسات بعد تحديث الصفحة.
            <button onClick={() => location.reload()} className="inline-flex items-center gap-1.5 h-[var(--tap)] font-semibold text-accent"><RefreshCw className="w-4 h-4" />حدّث الآن</button>
          </div>
        )}
      </Section>

      <Section title="النصوص" help="يمكنك استخدام {name} لاسم المنصة و{price} لأقل سعر و{year} للسنة داخل النصوص.">
        {T('heroPromo', 'جملة الشريحة الترويجية', 'تظهر في الشريحة الأخيرة وبطاقة الاشتراك', true)}
        {T('promoButton', 'زرّ البطاقة الترويجية')}
        {T('promoNote', 'السطر تحت البطاقة الترويجية', undefined, true)}
        {T('guestBannerText', 'جملة الشريط الثابت للزائر')}
        {T('guestBannerButton', 'زرّ الشريط الثابت')}
        {T('topbarLogin', 'زرّ الدخول (الشريط العلوي)')}
        {T('topbarSignup', 'زرّ التسجيل (الشريط العلوي)')}
        {T('teacherButton', 'زرّ قسم المدرّس')}
        {T('footerNote', 'ملاحظة أسفل الصفحة', 'سطر إضافي في الفوتر (اختياري)')}
      </Section>

      <Section title="بيانات التواصل" help="تظهر في عمود «تواصل معنا» بالفوتر، وواتساب يُستخدم لأيقونته لو لم تضع رابطاً.">
        {T('contactPhone', 'رقم الهاتف', undefined, false, '01xxxxxxxxx')}
        {T('contactWhatsapp', 'رقم واتساب', undefined, false, '01xxxxxxxxx')}
        {T('contactEmail', 'البريد الإلكتروني', undefined, false, 'name@example.com')}
      </Section>
    </>
  );
};

/* ---------------------------------------------------------------- الألوان */
export const ColorsTab: React.FC<TabProps> = ({ site, save }) => {
  const groups = Array.from(new Set(COLOR_DEFS.map((c) => c.group)));
  return (
    <>
      <p className="text-[14px] text-muted max-w-[60ch]">كل لون هنا تختاره أنت: اضغط المربع لفتح منتقي الألوان أو اكتب الكود بنفسك. زرّ «الأصل» يرجّع اللون كما كان في النسخة الأولى. التغيير يظهر فوراً.</p>
      {groups.map((g) => (
        <Section key={g} title={g}>
          {COLOR_DEFS.filter((c) => c.group === g).map((c) => (
            <Row key={c.id} label={c.label} help={c.help} inline>
              <ColorField aria={c.label} value={c.get(site)} defaultValue={c.get(DEFAULT_SITE)} onChange={(v) => save(setColor(site, c.id, v))} />
            </Row>
          ))}
        </Section>
      ))}
    </>
  );
};

/* ---------------------------------------------------------------- الأحجام */
export const SizesTab: React.FC<TabProps> = ({ site, save }) => {
  const groups = Array.from(new Set(SIZE_DEFS.map((z) => z.group)));
  return (
    <>
      <p className="text-[14px] text-muted max-w-[60ch]">استخدم السهمين ▲ ▼ أو اسحب الشريط أو اكتب الرقم. كل مقاس له حدّ أدنى وأقصى حتى لا ينكسر الشكل، و«الأصل» يرجّعه لقيمته الأولى.</p>
      {groups.map((g) => (
        <Section key={g} title={g}>
          {SIZE_DEFS.filter((z) => z.group === g).map((z) => (
            <StepperRow key={z.key} label={z.label} help={z.help} value={site.sizes[z.key]} min={z.min} max={z.max} step={z.step} unit={z.unit} defaultValue={DEFAULT_SITE.sizes[z.key]} onChange={(n) => save(setSize(site, z.key, n))} />
          ))}
        </Section>
      ))}
    </>
  );
};

/* ---------------------------------------------------------------- السلايدر */
export const HeroTab: React.FC<TabProps> = ({ site, save }) => {
  const h = site.hero, cards = h.cards;
  const setCards = (next: typeof cards) => save(setHero(site, { cards: next }));
  const patchCard = (id: string, p: Partial<(typeof cards)[number]>) => setCards(cards.map((c) => (c.id === id ? { ...c, ...p } : c)));
  const lab = (k: keyof typeof h.labels, label: string) => <Row label={label}><TextField value={h.labels[k]} aria={label} onCommit={(v) => save(setHeroLabels(site, { [k]: v } as Partial<typeof h.labels>))} /></Row>;
  return (
    <>
      <Section title="الشرائح">
        <StepperRow label="عدد شرائح الكورسات" help="الشريحة الأخيرة (المدرّس) تُشغَّل أو تُوقَف من الأسفل" aria="عدد الشرائح" value={h.slides} min={1} max={8} defaultValue={DEFAULT_SITE.hero.slides} onChange={(n) => save(setHero(site, { slides: n }))} />
        <StepperRow label="مدة بقاء الشريحة" help="عند التمرير التلقائي" aria="مدة الشريحة" value={h.intervalSec} min={2} max={30} unit="ث" defaultValue={DEFAULT_SITE.hero.intervalSec} onChange={(n) => save(setHero(site, { intervalSec: n }))} />
        <FeatureList site={site} save={save} group={0} />
      </Section>

      <Section title="نصوص أزرار الشرائح">
        {lab('guest', 'زرّ الزائر')}{lab('subscribe', 'زرّ غير المشترك')}{lab('start', 'زرّ بدء التعلّم')}{lab('resume', 'زرّ المتابعة')}{lab('view', 'زرّ الإدارة والمدرّس')}
        {lab('badgeNew', 'شارة الكورس الجديد')}{lab('badgePopular', 'شارة الكورس الأكثر طلباً')}{lab('promoGuest', 'زرّ شريحة المدرّس للزائر')}{lab('promoStudent', 'زرّ شريحة المدرّس للطالب')}
      </Section>

      <Section title="الكروت الزجاجية" help="يمكنك استخدام {price} لأقل سعر و{name} لاسم المنصة. ألوانها وشفافيتها واستدارتها من تبويبي الألوان والأحجام.">
        {cards.map((c, i) => (
          <Collapsible key={c.id} title={c.title || 'كرت بلا عنوان'} tools={<>
            <Switch on={c.on} label={`إظهار كرت ${c.title}`} onChange={(v) => patchCard(c.id, { on: v })} />
            <ItemTools index={i} count={cards.length} name={c.title || 'الكرت'} onMove={(d) => setCards(moveItem(cards, i, d))} onDelete={() => setCards(cards.filter((x) => x.id !== c.id))} />
          </>}>
            <Row label="العنوان"><TextField value={c.title} aria="عنوان الكرت" onCommit={(v) => patchCard(c.id, { title: v })} /></Row>
            <Row label="السطر الوصفي"><TextField value={c.line} aria="وصف الكرت" multiline onCommit={(v) => patchCard(c.id, { line: v })} /></Row>
            <Row label="نص الزرّ"><TextField value={c.button} aria="نص زرّ الكرت" onCommit={(v) => patchCard(c.id, { button: v })} /></Row>
            <Row label="رابط الزرّ" help="مثل /courses أو /wallet أو رابط https://"><TextField value={c.href} aria="رابط زرّ الكرت" ltr onCommit={(v) => patchCard(c.id, { href: v })} /></Row>
          </Collapsible>
        ))}
        <AddButton label="إضافة كرت" onClick={() => setCards([...cards, { id: uid(), on: true, title: 'كرت جديد', line: '', button: 'اضغط هنا', href: '/courses' }])} />
      </Section>
    </>
  );
};

/* ---------------------------------------------------------------- الرئيسية */
export const HomeTab: React.FC<TabProps> = ({ site, save }) => (
  <>
    <Section title="أقسام الصفحة الرئيسية" help="رتّب الأقسام بالأسهم، شغّل أو أوقف كل قسم، وغيّر عنوانه. اترك العنوان فارغاً ليرجع للعنوان التلقائي.">
      {site.home.order.map((key, i) => {
        const def = HOME_SECTIONS.find((s) => s.key === key);
        if (!def) return null;
        const on = def.feature ? site.features[def.feature] : true;
        return (
          <Collapsible key={key} title={<span className={on ? '' : 'opacity-50'}>{def.label}</span>} tools={<>
            {def.feature && <Switch on={on} label={`إظهار ${def.label}`} onChange={(v) => save(setFeature(site, def.feature!, v))} />}
            <ItemTools index={i} count={site.home.order.length} name={def.label} onMove={(d) => save(moveSection(site, key, d))} />
          </>}>
            <Row label="العنوان" help={def.defaultTitle ? `التلقائي: ${def.defaultTitle}` : 'التلقائي يتبع مسميات المنهج'}>
              <TextField value={site.home.titles[key] ?? ''} aria={`عنوان ${def.label}`} ph={def.defaultTitle} onCommit={(v) => save(setHomeTitle(site, key, v))} />
            </Row>
          </Collapsible>
        );
      })}
    </Section>
    <Section title="الشريط الثابت للزائر">
      <ToggleRow label="الشريط الثابت أعلى شريط التبويب" help="على الجوال للزائر فقط. نصه من تبويب «الهوية والنصوص»" on={site.features.guestBanner} onChange={(v) => save(setFeature(site, 'guestBanner', v))} />
    </Section>
  </>
);

/* ---------------------------------------------------------------- الفوتر */
export const FooterTab: React.FC<TabProps> = ({ site, save }) => {
  const ft = site.footer, cols = ft.columns;
  const setCols = (next: FooterColumn[]) => save(setFooter(site, { columns: next }));
  const patchCol = (id: string, p: Partial<FooterColumn>) => setCols(cols.map((c) => (c.id === id ? { ...c, ...p } : c)));
  const patchLink = (cid: string, lid: string, p: Partial<FooterLink>) => setCols(cols.map((c) => (c.id === cid ? { ...c, links: c.links.map((l) => (l.id === lid ? { ...l, ...p } : l)) } : c)));
  const socials = ft.socials;
  const setSocials = (next: typeof socials) => save(setFooter(site, { socials: next }));
  const audience = (v: string) => v as Audience;
  return (
    <>
      <Section title="ما يظهر في الفوتر"><FeatureList site={site} save={save} group={2} /></Section>

      <Section title="أعمدة الروابط" help="كل عمود له عنوان وروابطه. لكل رابط جمهور: الجميع أو الزائر فقط أو الطالب فقط. الرابط يبدأ بـ / لصفحة داخل المنصة أو بـ https:// لموقع خارجي.">
        {cols.map((c, i) => (
          <Collapsible key={c.id} title={c.title || 'عمود بلا عنوان'} tools={<>
            <Switch on={c.on} label={`إظهار عمود ${c.title}`} onChange={(v) => patchCol(c.id, { on: v })} />
            <ItemTools index={i} count={cols.length} name={c.title || 'العمود'} onMove={(d) => setCols(moveItem(cols, i, d))} onDelete={() => setCols(cols.filter((x) => x.id !== c.id))} />
          </>}>
            <Row label="عنوان العمود"><TextField value={c.title} aria="عنوان العمود" onCommit={(v) => patchCol(c.id, { title: v })} /></Row>
            {c.links.map((l, j) => (
              <div key={l.id} className="py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0"><TextField value={l.label} aria={`اسم الرابط ${l.label}`} ph="اسم الرابط" onCommit={(v) => patchCol(c.id, { links: c.links.map((x) => (x.id === l.id ? { ...x, label: v } : x)) })} /></div>
                  <Switch on={l.on} label={`إظهار ${l.label}`} onChange={(v) => patchLink(c.id, l.id, { on: v })} />
                  <ItemTools index={j} count={c.links.length} name={l.label || 'الرابط'} onMove={(d) => patchCol(c.id, { links: moveItem(c.links, j, d) })} onDelete={() => patchCol(c.id, { links: c.links.filter((x) => x.id !== l.id) })} />
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6">
                  <TextField value={l.href} aria={`مسار ${l.label}`} ph="/courses أو https://" ltr onCommit={(v) => patchLink(c.id, l.id, { href: v })} />
                  <SelectField value={l.who} aria={`جمهور ${l.label}`} options={AUDIENCES} onChange={(v) => patchLink(c.id, l.id, { who: audience(v) })} />
                </div>
              </div>
            ))}
            <AddButton label="إضافة رابط" onClick={() => patchCol(c.id, { links: [...c.links, { id: uid(), label: 'رابط جديد', href: '/', on: true, who: 'all' }] })} />
          </Collapsible>
        ))}
        <AddButton label="إضافة عمود" onClick={() => setCols([...cols, { id: uid(), title: 'عمود جديد', on: true, links: [] }])} />
      </Section>

      <Section title="أيقونات التواصل الاجتماعي" help="تظهر الأيقونة فقط لو وضعت رابطها. واتساب يكفيه رقمك في بيانات التواصل.">
        {socials.map((s, i) => (
          <div key={s.id} className="py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0"><SelectField value={s.kind} aria="المنصة" options={SOCIAL_KINDS.map((k) => ({ value: k.kind, label: k.label }))} onChange={(v) => setSocials(socials.map((x) => (x.id === s.id ? { ...x, kind: v as SocialKind } : x)))} /></div>
              <Switch on={s.on} label="إظهار الأيقونة" onChange={(v) => setSocials(socials.map((x) => (x.id === s.id ? { ...x, on: v } : x)))} />
              <ItemTools index={i} count={socials.length} name={SOCIAL_KINDS.find((k) => k.kind === s.kind)?.label ?? 'الأيقونة'} onMove={(d) => setSocials(moveItem(socials, i, d))} onDelete={() => setSocials(socials.filter((x) => x.id !== s.id))} />
            </div>
            <TextField value={s.url} aria={`رابط ${s.kind}`} ph="https://" ltr onCommit={(v) => setSocials(socials.map((x) => (x.id === s.id ? { ...x, url: v.trim() } : x)))} />
          </div>
        ))}
        <AddButton label="إضافة أيقونة" onClick={() => setSocials([...socials, { id: uid(), kind: 'tiktok', url: '', on: true }])} />
      </Section>

      <Section title="سطر الحقوق">
        <Row label="النص" help="{name} اسم المنصة و{year} السنة"><TextField value={ft.legal} aria="سطر الحقوق" onCommit={(v) => save(setFooter(site, { legal: v }))} /></Row>
      </Section>

      <Section title="زرّ الدعوة الكبير" help="ألوانه من تبويب الألوان (زرّ الفوتر).">
        <Row label="نص الزرّ"><TextField value={ft.cta.label} aria="نص زرّ الفوتر" onCommit={(v) => save(setFooterCta(site, { label: v }))} /></Row>
        <Row label="رابط الزرّ"><TextField value={ft.cta.href} aria="رابط زرّ الفوتر" ltr onCommit={(v) => save(setFooterCta(site, { href: v }))} /></Row>
        <Row label="السطر الصغير تحته"><TextField value={ft.cta.sub} aria="السطر تحت زرّ الفوتر" onCommit={(v) => save(setFooterCta(site, { sub: v }))} /></Row>
        <Row label="يظهر لـ"><Chips aria="جمهور الزرّ" value={ft.cta.who} options={AUDIENCES} onChange={(v) => save(setFooterCta(site, { who: audience(v) }))} /></Row>
      </Section>
      <p className="text-[13px] text-muted mt-6">شعارات طرق الدفع تُدار من صفحة «الدفع والشحن»: كل طريقة فيها خيار «يظهر في الفوتر» ورابط الشعار.</p>
    </>
  );
};

/* ---------------------------------------------------------------- الأزرار العامة */
export const ButtonsTab: React.FC<TabProps> = ({ site, save }) => (
  <Section title="الأزرار والأيقونات العامة" help="أي زرّ تُوقفه هنا يختفي من كل الأماكن التي يظهر فيها.">
    <FeatureList site={site} save={save} group={3} />
  </Section>
);

/* ---------------------------------------------------------------- الصفحات */
export const PagesTab: React.FC<TabProps> = ({ site, save }) => {
  const pages = site.pages;
  const setP = (next: typeof pages) => save(setPages(site, next));
  const patch = (id: string, p: Partial<(typeof pages)[number]>) => setP(pages.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const addToFooter = (slug: string, title: string) => {
    const cols = site.footer.columns;
    const link = { id: uid(), label: title, href: `/page/${slug}`, on: true, who: 'all' as Audience };
    const info = cols.find((c) => c.id === 'info');
    if (info?.links.some((l) => l.href === `/page/${slug}`)) return;
    save(setFooter(site, { columns: info ? cols.map((c) => (c.id === 'info' ? { ...c, links: [...c.links, link] } : c)) : [...cols, { id: 'info', title: 'معلومات', on: true, links: [link] }] }));
  };
  return (
    <Section title="صفحات المعلومات" help="كل صفحة تظهر على الرابط /page/رابطها وتُعرض في الفوتر. اكتب النص بحرية: «## عنوان» لعنوان فرعي، و«- » لبداية نقطة، وسطر فارغ بين الفقرات. يمكنك استخدام {name} لاسم المنصة و{email} و{phone} و{year}. النصوص الافتراضية قوالب عامة، راجعها وعدّلها بما يناسب نشاطك قبل التشغيل الفعلي.">
      {pages.map((p, i) => (
        <Collapsible key={p.id} title={<span className={p.on ? '' : 'opacity-50'}>{p.title || 'صفحة بلا عنوان'}</span>} tools={<>
          <Switch on={p.on} label={`إظهار صفحة ${p.title}`} onChange={(v) => patch(p.id, { on: v })} />
          <ItemTools index={i} count={pages.length} name={p.title || 'الصفحة'} onMove={(d) => setP(moveItem(pages, i, d))} onDelete={() => setP(pages.filter((x) => x.id !== p.id))} />
        </>}>
          <Row label="العنوان"><TextField value={p.title} aria="عنوان الصفحة" onCommit={(v) => patch(p.id, { title: v })} /></Row>
          <Row label="رابط الصفحة" help={`ستظهر على /page/${p.slug}`}><TextField value={p.slug} aria="رابط الصفحة" ltr ph="privacy" onCommit={(v) => patch(p.id, { slug: v.trim().toLowerCase() })} /></Row>
          <Row label="النص"><TextField value={p.body} aria="نص الصفحة" multiline rows={14} onCommit={(v) => patch(p.id, { body: v })} /></Row>
          <div className="py-3 flex flex-wrap gap-2">
            <button className="h-10 px-4 rounded-full bg-white/10 text-[14px] font-semibold text-white" onClick={() => addToFooter(p.slug, p.title)}>إضافة رابطها للفوتر</button>
            <button className="h-10 px-4 rounded-full bg-white/10 text-[14px] font-semibold text-white" onClick={() => window.open(`${location.pathname}${location.search}#/page/${p.slug}`, '_blank')}>معاينة الصفحة</button>
          </div>
        </Collapsible>
      ))}
      <AddButton label="إضافة صفحة" onClick={() => { let n = pages.length + 1; while (pages.some((x) => x.slug === `page-${n}`)) n++; setP([...pages, { id: uid(), slug: `page-${n}`, title: 'صفحة جديدة', body: '## عنوان\nاكتب نص الصفحة هنا.', on: true }]); }} />
    </Section>
  );
};
