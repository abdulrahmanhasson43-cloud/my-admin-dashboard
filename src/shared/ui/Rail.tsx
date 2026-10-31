import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { go } from '../lib/router';

/** صفّ أفقي: العنوان يمين و«الكل» بنفسجي يسار. الأسهم للشاشات الكبيرة فقط؛ على اللمس يكفي السحب.
 *  في RTL قيمة scrollLeft السالبة تعني التقدّم للأمام. */
export const Rail: React.FC<{ title: React.ReactNode; href?: string; className?: string; children: React.ReactNode }> = ({ title, href, className = 'mt-9 md:mt-12', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.min(ref.current.clientWidth * 0.85, 900), behavior: 'smooth' });
  return (
    <section className={className}>
      <div className="gutter flex items-center justify-between mb-3.5">
        <h2 className="text-white font-bold text-[22px] md:text-[26px]">{title}</h2>
        <div className="flex items-center gap-1">
          <div className="hidden lg:flex">
            <button onClick={() => scroll(1)} aria-label="السابق" className="icon-btn"><ChevronRight className="w-5 h-5" /></button>
            <button onClick={() => scroll(-1)} aria-label="التالي" className="icon-btn"><ChevronLeft className="w-5 h-5" /></button>
          </div>
          {href && <button onClick={() => go(href)} className="h-[var(--tap)] px-1 text-[17px] font-semibold text-accent">الكل</button>}
        </div>
      </div>
      <div ref={ref} className="rail gutter">{children}</div>
    </section>
  );
};
