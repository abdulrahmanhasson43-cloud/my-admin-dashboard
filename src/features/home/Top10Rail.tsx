import React from 'react';
import type { Course } from '../../core/entities';
import { go } from '../../shared/lib/router';
import { Rail } from '../../shared/ui';
import { categoryTint, hideBroken } from '../../shared/ui/hue';

/** أفضل 10: بطاقات كبيرة بملصق كامل، ورقم الترتيب على لسان ملوّن في الزاوية (أسلوب Shahid). */
export const Top10Rail: React.FC<{ items: Course[]; href?: string }> = ({ items, href }) => (
  <div className="mt-10 md:mt-14 py-8 md:py-10 bg-ink-2">
    <Rail
      className=""
      href={href}
      title={
        <span className="inline-flex items-center">
          أفضل 10 دورات
          <span aria-hidden className="mx-3 h-5 w-px bg-white/25" />
          <span className="text-[15px] md:text-[17px] font-medium text-white/65">هذا الأسبوع</span>
        </span>
      }
    >
      {items.slice(0, 10).map((c, k) => (
        <article
          key={c.id}
          onClick={() => go(`/course/${c.id}`)}
          onKeyDown={(e) => e.key === 'Enter' && go(`/course/${c.id}`)}
          role="link" tabIndex={0} aria-label={`المركز ${k + 1}: ${c.title}`}
          className="group relative w-[180px] sm:w-[230px] lg:w-[270px] aspect-[2/3] overflow-hidden rounded-xl cursor-pointer select-none"
          style={{ background: categoryTint(c.category) }}
        >
          <img src={c.image} alt="" loading={k < 2 ? 'eager' : 'lazy'} decoding="async" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-300 group-hover:brightness-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />
          <div className="absolute top-0 end-3 flex flex-col items-center" aria-hidden>
            <span className="block w-9 h-3 bg-accent rounded-b-[3px]" />
            <span className="mt-1 text-[34px] font-extrabold leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]">{String(k + 1).padStart(2, '0')}</span>
          </div>
          <h3 className="absolute inset-x-0 bottom-0 px-3 pb-4 text-[18px] sm:text-[20px] font-bold leading-snug text-white line-clamp-2">{c.title}</h3>
        </article>
      ))}
    </Rail>
  </div>
);
