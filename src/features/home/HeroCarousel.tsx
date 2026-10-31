import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import type { Course } from '../../core/entities';
import { go } from '../../shared/lib/router';
import { categoryLabel, totalLessons } from '../../data/catalog';
import { categoryTint, hideBroken } from '../../shared/ui/hue';

const INTERVAL = 7000;

/** هيرو بملء العرض: صورة الدورة خلفية، والمحتوى أسفل الشاشة. تتبدّل الشرائح بتلاشٍ هادئ. */
export const HeroCarousel: React.FC<{ items: Course[]; progress: Record<string, number> }> = ({ items, progress }) => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), INTERVAL);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const c = items[i];
  const pct = progress[c.id] ?? c.progress;
  const started = typeof pct === 'number' && pct > 0 && pct < 100;

  return (
    <section
      className="relative h-[82svh] min-h-[540px] max-h-[820px] overflow-hidden"
      style={{ background: categoryTint(c.category, 16), transition: 'background-color 1s' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel" aria-label="دورات مميّزة"
    >
      {items.map((it, k) => (
        <img key={it.id} src={it.image.replace('w=1400', 'w=1600')} alt="" fetchPriority={k === 0 ? 'high' : 'auto'} loading={k === 0 ? 'eager' : 'lazy'} onError={hideBroken}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 md:bg-gradient-to-l md:from-ink/85 md:via-ink/35 md:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

      <div className="relative h-full gutter flex flex-col justify-end pb-14 md:pb-20">
        <div className="max-w-[620px]" key={c.id}>
          <p className="text-[14px] text-white/70 mb-2">{categoryLabel(c.category)} مع {c.instructor}</p>
          <h1 className="text-white">{c.title}</h1>
          <p className="text-[16px] md:text-[18px] text-white/80 mt-3 max-w-[52ch] line-clamp-2">{c.tagline}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-[14px] text-white/70">
            <span>{c.rating.toLocaleString('ar-EG', { minimumFractionDigits: 1 })} تقييم</span>
            <span>{c.level}</span>
            <span>{c.hours.toLocaleString('ar-EG')} ساعات</span>
            <span>{totalLessons(c).toLocaleString('ar-EG')} درساً</span>
          </div>
          <div className="btn-row mt-6">
            <button onClick={() => go(`/learn/${c.id}`)} className="btn btn-primary btn-lg">
              <Play className="w-[18px] h-[18px] fill-current" />
              {started ? 'أكمل التعلّم' : 'ابدأ الدرس الأول'}
            </button>
            <button onClick={() => go(`/course/${c.id}`)} className="btn btn-ghost btn-lg">التفاصيل</button>
          </div>
        </div>

        {items.length > 1 && (
          <div className="flex gap-1 mt-8" role="tablist" aria-label="اختيار الدورة المميّزة">
            {items.map((it, k) => (
              <button key={it.id} role="tab" aria-selected={k === i} aria-label={it.title} onClick={() => setI(k)} className="h-[var(--tap)] w-10 grid items-center">
                <span className={`block h-[3px] rounded-full transition-colors ${k === i ? 'bg-white' : 'bg-white/35'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
