import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { go } from '../lib/router';

/** صفّ أفقي: العنوان وبجانبه سهم يفتح القائمة الكاملة (أسلوب Apple TV). أسهم التمرير للشاشات الكبيرة فقط.
 *  في RTL قيمة scrollLeft السالبة تعني التقدّم للأمام. */
export const Rail: React.FC<{ title: React.ReactNode; subtitle?: string; href?: string; className?: string; children: React.ReactNode }> = ({ title, subtitle, href, className = 'mt-9 md:mt-12', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.min(ref.current.clientWidth * 0.85, 900), behavior: 'smooth' });
  const heading = <span className="text-white font-bold section-title leading-snug">{title}</span>;
  return (
    <section className={className}>
      <div className="gutter flex items-center justify-between mb-3.5">
        <div className="min-w-0">
          <h2 className="!text-[inherit]">
            {href ? (
              <button onClick={() => go(href)} className="inline-flex items-center gap-1 min-h-[var(--tap)] text-start">{heading}<ChevronLeft className="w-6 h-6 text-white/55 shrink-0 mt-0.5" strokeWidth={2} /></button>
            ) : heading}
          </h2>
          {subtitle && <p className="text-[14px] md:text-[15px] text-muted -mt-1 max-w-[60ch]">{subtitle}</p>}
        </div>
        <div className="hidden lg:flex">
          <button onClick={() => scroll(1)} aria-label="السابق" className="icon-btn"><ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => scroll(-1)} aria-label="التالي" className="icon-btn"><ChevronLeft className="w-5 h-5" /></button>
        </div>
      </div>
      <div ref={ref} className="rail gutter">{children}</div>
    </section>
  );
};
