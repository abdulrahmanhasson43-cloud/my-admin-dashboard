import React from 'react';
import { go } from '../../shared/lib/router';
import { fill } from '../../shared/lib/template';
import { useBrand } from '../../shared/lib/brand';
import { useSite } from '../../modules/site/ui/SiteProvider';

/** شريط ثابت بلون التفاعل أعلى شريط التبويب للزائر (الجوال فقط): جملة قصيرة وزرّ. النصوص من إعدادات السوبر أدمن. */
export const GuestBanner: React.FC = () => {
  const { name } = useBrand();
  const { site } = useSite();
  return (
    <>
      <div className="md:hidden h-14" aria-hidden />
      <div className="md:hidden fixed inset-x-0 z-30 h-14 px-4 bg-accent flex items-center justify-between gap-3" style={{ bottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px))' }}>
        <p className="text-[16px] font-bold text-white truncate">{fill(site.texts.guestBannerText, { name })}</p>
        <button onClick={() => go('/login?mode=signup')} className="btn btn-primary !h-10 !px-5 !text-[15px] shrink-0">{site.texts.guestBannerButton}</button>
      </div>
    </>
  );
};
