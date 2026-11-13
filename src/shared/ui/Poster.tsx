import React from 'react';
import type { Course } from '../../core/entities';
import { go } from '../lib/router';
import { subjectTint, hideBroken } from './hue';

type Size = 'md' | 'lg';
const WIDTH: Record<Size, string> = {
  md: 'w-[132px] sm:w-[160px] lg:w-[188px]',
  lg: 'w-[190px] sm:w-[230px] lg:w-[270px]',
};

/** علامة مدار الصغيرة (حلقة ونقطة) تظهر في ركن الملصق كشارة المنصة في Apple TV. */
export const BrandMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2.2" /><circle cx="19.2" cy="7.2" r="3.2" fill="#3d8bff" />
  </svg>
);

/**
 * ملصق الكورس بأسلوب Apple TV: زوايا كبيرة، العنوان في أسفل الصورة بخط ثقيل، وسطر فرعي صغير،
 * وعلامة المنصة في الركن، ورقم الترتيب اختيارياً (للقوائم العشرة الأولى). النصوص تأتي من الخارج.
 */
export const Poster: React.FC<{ course: Course; title: string; sub?: string; rank?: number; eager?: boolean; fluid?: boolean; size?: Size }> = ({ course, title, sub, rank, eager, fluid, size = 'md' }) => {
  const open = () => go(`/course/${course.id}`);
  return (
    <article className={`${fluid ? 'w-full' : WIDTH[size]} group cursor-pointer select-none`} onClick={open} role="link" tabIndex={0}
      aria-label={`${rank ? `المركز ${rank}: ` : ''}${title}${sub ? `، ${sub}` : ''} — ${course.instructor}`} onKeyDown={(e) => e.key === 'Enter' && open()}>
      <div className="relative aspect-[2/3] overflow-hidden border border-white/10" style={{ borderRadius: 'var(--radius-poster)', background: subjectTint(course.subjectId) }}>
        <img src={course.image} alt="" width={376} height={564} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-300 group-hover:brightness-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <BrandMark className="absolute top-2.5 start-2.5 w-[18px] h-[18px] opacity-90" />
        {rank !== undefined && <span aria-hidden className="absolute top-1 end-3 text-[42px] font-extrabold leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]">{rank}</span>}
        <div className="absolute inset-x-0 bottom-0 px-2 pb-3 text-center">
          <h3 className="text-[17px] sm:text-[19px] font-extrabold leading-tight text-white line-clamp-2">{title}</h3>
          {sub && <p className="text-[12px] sm:text-[13px] text-white/75 leading-snug line-clamp-1 mt-0.5">{sub}</p>}
        </div>
      </div>
    </article>
  );
};
