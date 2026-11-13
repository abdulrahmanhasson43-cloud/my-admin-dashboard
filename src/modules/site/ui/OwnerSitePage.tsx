import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Result } from '../../../core/result';
import { PageHeader } from '../../../shared/studio/StudioShell';
import { useSite } from './SiteProvider';
import type { SiteSettings } from '../domain/entities';
import { resetSite } from '../application/editSite';
import { ErrorLine } from './controls';
import { ButtonsTab, ColorsTab, FooterTab, HeroTab, HomeTab, IdentityTab, PagesTab, SizesTab } from './OwnerSiteTabs';

const TABS = [
  { id: 'identity', label: 'الهوية والنصوص', Page: IdentityTab },
  { id: 'colors', label: 'الألوان', Page: ColorsTab },
  { id: 'sizes', label: 'الأحجام', Page: SizesTab },
  { id: 'hero', label: 'السلايدر', Page: HeroTab },
  { id: 'home', label: 'الرئيسية', Page: HomeTab },
  { id: 'footer', label: 'الفوتر', Page: FooterTab },
  { id: 'pages', label: 'الصفحات', Page: PagesTab },
  { id: 'buttons', label: 'الأزرار', Page: ButtonsTab },
] as const;
const KEY = 'madar.owner.tab';

/** مركز تحكم المالك: كل ما يراه الزائر والطالب في المنصة يُغيَّر من هنا، وتُحفظ التغييرات فور تنفيذها. */
const OwnerSitePage: React.FC = () => {
  const { site, apply } = useSite();
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>(() => { try { return sessionStorage.getItem(KEY) ?? 'identity'; } catch { return 'identity'; } });
  const save = (r: Result<SiteSettings> | SiteSettings) => setError(apply(r));
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const pick = (id: string) => { setTab(id); setError(null); try { sessionStorage.setItem(KEY, id); } catch { /* بلا تخزين */ } };

  return (
    <div className="max-w-[760px] mx-auto pb-6">
      <PageHeader title="التحكم في المنصة" sub="أنت المالك: الألوان والأحجام والسلايدر والأقسام والفوتر والأزرار كلها بيدك. التغييرات تُحفظ فور تنفيذها." />
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => window.open(`${location.pathname}${location.search}#/`, '_blank')} className="h-11 px-4 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-[14px] font-semibold text-white"><ExternalLink className="w-4 h-4" />افتح الموقع في تبويب جديد</button>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar sticky top-14 z-20 py-2 bg-ink" role="tablist" aria-label="أقسام التحكم">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === current.id} onClick={() => pick(t.id)}
            className={`h-10 px-4 rounded-full shrink-0 text-[14px] font-semibold ${t.id === current.id ? 'bg-white text-black' : 'bg-white/[0.08] text-white/80'}`}>{t.label}</button>
        ))}
      </div>

      <div className="mt-3"><ErrorLine error={error} /></div>
      <current.Page site={site} save={save} />

      <button onClick={() => { if (confirm('استعادة كل إعدادات المنصة للقيم الافتراضية؟ سيُمسح كل ما غيّرته في كل التبويبات.')) { save(resetSite()); } }} className="h-[var(--tap)] mt-10 text-[14px] font-medium text-[#ff8a8a]">استعادة الإعدادات الافتراضية</button>
    </div>
  );
};

export default OwnerSitePage;
