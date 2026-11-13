import React from 'react';
import { go } from '../../shared/lib/router';
import { egp } from '../../shared/lib/format';
import { BrandMark } from '../../shared/ui';
import { hideBroken } from '../../shared/ui/hue';
import { useBrand } from '../../shared/lib/brand';
import { useSite } from '../../modules/site/ui/SiteProvider';
import { fill } from '../../shared/lib/template';

/** بطاقة ترويجية كبيرة بزوايا مستديرة: صورة المدرّس تتلاشى، ثم اسم المنصة وجملة وزرّ (للزائر). */
export const PromoCard: React.FC<{ minPrice: number }> = ({ minPrice }) => {
  const { name } = useBrand();
  const { site } = useSite();
  return (
    <section className="gutter mt-10 md:mt-14">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black min-h-[540px] md:min-h-[480px] flex flex-col justify-end">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[66%]">
          {site.teacher.photo && <img src={site.teacher.photo} alt="" loading="lazy" onError={hideBroken} className="w-full h-full object-cover object-top" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>
        <div className="relative px-6 pb-8 pt-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5"><BrandMark className="w-8 h-8" /><span className="text-[34px] font-extrabold leading-none text-white">{name}</span></div>
          <p className="mt-2 text-[16px] font-semibold text-white/90">مع {site.teacher.name}</p>
          <p className="mt-1 text-[18px] md:text-[20px] text-white/85 max-w-[30ch]">{fill(site.texts.heroPromo, { name, price: egp(minPrice) })}</p>
          <button onClick={() => go('/login?mode=signup')} className="btn btn-primary btn-lg mt-4 !px-10">{site.texts.promoButton}</button>
          <p className="text-[13px] text-white/60 mt-3">{fill(site.texts.promoNote, { name, price: egp(minPrice) })}</p>
        </div>
      </div>
    </section>
  );
};
