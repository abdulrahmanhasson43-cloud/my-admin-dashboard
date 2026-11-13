import React from 'react';
import { go, useRoute } from '../../../shared/lib/router';
import { fill } from '../../../shared/lib/template';
import { useBrand } from '../../../shared/lib/brand';
import { useSite } from './SiteProvider';

/** يحوّل نص الصفحة إلى عناصر آمنة: «## عنوان» و«- نقطة» وفقرات مفصولة بسطر فارغ. لا يُنفَّذ أي HTML. */
const renderBody = (body: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  const flushList = () => { if (list.length) { out.push(<ul key={`u${out.length}`} className="list-disc ps-6 mt-3 space-y-1.5 text-[16px] text-white/80 leading-[1.9]">{list.map((t, i) => <li key={i}>{t}</li>)}</ul>); list = []; } };
  const flushPara = () => { if (para.length) { out.push(<p key={`p${out.length}`} className="mt-3 text-[16px] text-white/80 leading-[1.9]">{para.join(' ')}</p>); para = []; } };
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) { flushList(); flushPara(); continue; }
    if (line.startsWith('## ')) { flushList(); flushPara(); out.push(<h2 key={`h${out.length}`} className="mt-8 text-[22px] text-white">{line.slice(3)}</h2>); }
    else if (line.startsWith('- ')) { flushPara(); list.push(line.slice(2)); }
    else { flushList(); para.push(line); }
  }
  flushList(); flushPara();
  return out;
};

/** صفحة معلومات (خصوصية، شروط، من نحن...) يحرّر نصها المالك من «التحكم في المنصة ← الصفحات». */
const InfoPage: React.FC = () => {
  const { path } = useRoute();
  const { site } = useSite();
  const { name } = useBrand();
  const slug = decodeURIComponent(path.split('#')[0].replace(/^\/page\//, '').replace(/\/$/, ''));
  const page = site.pages.find((p) => p.slug === slug && p.on);
  const vars = { name, year: new Date().getFullYear().toLocaleString('en-US', { useGrouping: false }), email: site.texts.contactEmail || 'البريد الموضّح أسفل الصفحة', phone: site.texts.contactPhone || 'الرقم الموضّح أسفل الصفحة' };

  if (!page) {
    return (
      <div className="min-h-[60vh] gutter" style={{ paddingTop: 'calc(var(--topbar-h) + 64px)' }}>
        <h1 className="text-[36px]">الصفحة غير متاحة</h1>
        <p className="text-muted mt-3">هذه الصفحة غير موجودة أو تم إيقافها.</p>
        <button onClick={() => go('/')} className="btn btn-primary mt-6">الرئيسية</button>
      </div>
    );
  }
  return (
    <article className="gutter pb-6 max-w-3xl mx-auto" style={{ paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 28px)' }}>
      <h1 className="text-[34px] md:text-[44px]">{page.title}</h1>
      <div>{renderBody(fill(page.body, vars))}</div>
    </article>
  );
};

export default InfoPage;
