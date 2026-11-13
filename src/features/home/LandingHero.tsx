import React, { useEffect, useRef, useState } from 'react';
import { Plus, Check, Pause, Play, ChevronDown } from 'lucide-react';
import type { Course } from '../../core/entities';
import { go } from '../../shared/lib/router';
import { egp } from '../../shared/lib/format';
import { fill } from '../../shared/lib/template';
import { Avatar, BrandMark } from '../../shared/ui';
import { subjectTint, hideBroken } from '../../shared/ui/hue';
import { useAuth } from '../auth/AuthProvider';
import { useCurriculum } from '../../modules/curriculum/ui/CurriculumProvider';
import { nextLesson } from '../../modules/curriculum/domain/rules';
import { useWallet } from '../../modules/wallet/ui/WalletProvider';
import { totalLessons } from '../../data/catalog';
import { useBrand } from '../../shared/lib/brand';
import { useSite } from '../../modules/site/ui/SiteProvider';

type Slide = { kind: 'course'; course: Course } | { kind: 'promo' };

const OutlineChip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center h-6 px-1.5 rounded border border-white/45 text-[12px] font-semibold text-white/90 leading-none">{children}</span>
);

/**
 * السلايدر العلوي بأسلوب Apple TV: شريحة بملء الشاشة (شارة، عنوان، سطرا وصف، زر واحد)،
 * ونقاط ترقيم، ثم كروت زجاجية صغيرة وسهم نزول. ارتفاعه وأحجامه وألوانه ونصوصه كلها من إعدادات السوبر أدمن.
 */
export const LandingHero: React.FC<{ courses: Course[]; minPrice: number }> = ({ courses, minPrice }) => {
  const { name: brandName } = useBrand();
  const { site } = useSite();
  const f = site.features, L = site.hero.labels;
  const { user, completedLessons, saved, toggleSave } = useAuth();
  const { config, gradeName } = useCurriculum();
  const { wallet, hasAccess } = useWallet();
  const box = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [dockH, setDockH] = useState(0);
  const [playing, setPlaying] = useState(() => f.heroAutoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(true);

  const slides: Slide[] = [
    ...courses.slice(0, site.hero.slides).map((c): Slide => ({ kind: 'course', course: c })),
    ...(f.heroPromoSlide ? [{ kind: 'promo' } as Slide] : []),
  ];
  const cards = f.heroCards ? site.hero.cards.filter((c) => c.on) : [];
  const isStudent = user?.role === 'student';
  /** الشريط الثابت للزائر (جوال) يغطي أسفل السلايدر، فنرفع النقاط والكروت فوقه. */
  const bannerOn = f.guestBanner && !user;
  const vars = { name: brandName, price: egp(minPrice) };

  const goTo = (k: number) => {
    const el = box.current, s = el?.children[k] as HTMLElement | undefined;
    if (!el || !s) return;
    const a = el.getBoundingClientRect(), b = s.getBoundingClientRect();
    el.scrollBy({ left: b.left - a.left - (el.clientWidth - b.width) / 2, behavior: 'smooth' });
  };

  useEffect(() => { setPlaying(f.heroAutoplay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, [f.heroAutoplay]);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const on = () => {
      const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
      let best = 0, bd = Infinity;
      Array.from(el.children).forEach((c, k) => { const r = (c as HTMLElement).getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = k; } });
      setActive(best);
    };
    el.addEventListener('scroll', on, { passive: true });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => { el.removeEventListener('scroll', on); io.disconnect(); };
  }, [slides.length]);

  // ارتفاع الجزء السفلي (نقاط + كروت) يتغيّر بتغيّر الإعدادات؛ نقيسه ليبقى نص الشريحة فوقه دائماً.
  useEffect(() => {
    const el = dock.current;
    if (!el) { setDockH(0); return; }
    const measure = () => setDockH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  });

  useEffect(() => {
    if (!playing || !visible || slides.length < 2) return;
    const t = setInterval(() => goTo((active + 1) % slides.length), site.hero.intervalSec * 1000);
    return () => clearInterval(t);
  }, [playing, visible, active, slides.length, site.hero.intervalSec]);

  const renderCourse = (c: Course) => {
    const subscribed = hasAccess(c);
    const nl = nextLesson(c, new Set(completedLessons));
    const started = completedLessons.some((id) => id.startsWith(`${c.id}-`));
    const first = c.curriculum[0]?.lessons[0];
    const cta = !user ? { label: L.guest, run: () => go(`/learn/${c.id}?lesson=${first?.id}`) }
      : isStudent && !subscribed ? { label: L.subscribe, run: () => go(`/subscribe?course=${c.id}`) }
      : isStudent ? { label: started ? L.resume : L.start, run: () => go(`/learn/${c.id}${nl ? `?lesson=${nl.id}` : ''}`) }
      : { label: L.view, run: () => go(`/course/${c.id}`) };
    const isSaved = saved.includes(c.id);
    return (
      <div key={c.id} className="relative shrink-0 w-full h-full snap-center" style={{ background: subjectTint(c.subjectId, 16) }}>
        <img src={c.image.replace('w=900', 'w=1600')} alt="" fetchPriority="high" onError={hideBroken} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'var(--hero-grad)' }} />
        <div className="absolute inset-x-0 bottom-0 px-5 flex flex-col items-center text-center" style={{ paddingBottom: dockH + 12 }}>
          {f.heroBadge && <span className="inline-flex items-center h-7 px-3 rounded-full bg-white/20 backdrop-blur-md text-[13px] font-semibold text-white">{c.isNew ? L.badgeNew : L.badgePopular}</span>}
          <h2 className="hero-title mt-3 font-extrabold leading-[1.1] text-white">{c.offering}</h2>
          <p className="mt-2 flex items-center justify-center gap-2 text-[15px] font-semibold text-white">
            <Avatar src={c.instructorAvatar} name={c.instructor} size={24} /><span>{gradeName(c.gradeId)}</span><span className="text-white/65">{c.instructor}</span>
          </p>
          {f.heroDescription && <p className="hero-desc mt-2 max-w-[48ch] text-white/80 line-clamp-2">{c.description}</p>}
          {f.heroMeta && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-white/85">
              <span>{c.hours.toLocaleString('ar-EG')} ساعات</span>
              <span>{totalLessons(c).toLocaleString('ar-EG')} درساً</span>
              <span>★ {c.rating.toLocaleString('ar-EG', { minimumFractionDigits: 1 })}</span>
              {config.termsEnabled && config.terms[0] && <OutlineChip>{config.terms[0].name}</OutlineChip>}
            </div>
          )}
          <div className="mt-4 w-full flex items-center justify-center gap-3">
            <button onClick={cta.run} className="btn btn-primary btn-lg min-w-[200px] max-w-[320px] flex-1"><Play className="w-4 h-4 fill-current" />{cta.label}</button>
            {f.heroSave && (
              <button onClick={() => (user ? toggleSave(c.id) : go('/login'))} aria-pressed={isSaved} aria-label={isSaved ? 'إزالة من قائمتي' : 'أضف إلى قائمتي'}
                className="w-[var(--btn-h-lg)] h-[var(--btn-h-lg)] rounded-full grid place-items-center bg-white/20 backdrop-blur-md text-white shrink-0">
                {isSaved ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPromo = () => (
    <div key="promo" className="relative shrink-0 w-full h-full snap-center bg-black">
      <div aria-hidden className="absolute inset-0">
        {site.teacher.photo && <img src={site.teacher.photo} alt="" onError={hideBroken} className="w-full h-full object-cover object-top" />}
        <div className="absolute inset-0" style={{ background: 'var(--hero-grad)' }} />
      </div>
      <div className="absolute inset-x-0 bottom-0 px-6 flex flex-col items-center text-center" style={{ paddingBottom: dockH + 12 }}>
        <div className="flex items-center gap-2.5"><BrandMark className="w-9 h-9" /><span className="text-[38px] font-extrabold leading-none text-white">{brandName}</span></div>
        <p className="mt-2 text-[16px] font-semibold text-white">مع {site.teacher.name}</p>
        {f.heroDescription && <p className="hero-desc mt-1 text-white/75 max-w-[40ch]">{isStudent ? 'اشحن محفظتك واشترك في كورسات صفّك.' : fill(site.texts.heroPromo, vars)}</p>}
        <p className="mt-2 text-[16px] font-bold text-white">{isStudent ? `رصيدك ${egp(wallet.balance)}` : `تبدأ الأسعار من ${egp(minPrice)} للترم`}</p>
        <button onClick={() => go(isStudent ? '/wallet' : '/login?mode=signup')} className="btn btn-primary btn-lg mt-4 !px-10">{isStudent ? L.promoStudent : L.promoGuest}</button>
      </div>
    </div>
  );

  if (slides.length === 0) return <div style={{ paddingTop: 'var(--topbar-h)' }} />;
  const showDots = f.heroDots && slides.length > 1;
  const showDock = showDots || cards.length > 0 || f.heroScrollHint;

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px))' }}>
      <section ref={root} className="hero-box relative bg-black overflow-hidden" aria-roledescription="carousel" aria-label="ابدأ من هنا">
        <div ref={box} className="flex h-full overflow-x-auto no-scrollbar snap-x snap-mandatory" onPointerDown={() => setPlaying(false)}>
          {slides.map((s, k) => <React.Fragment key={s.kind === 'course' ? s.course.id : `p${k}`}>{s.kind === 'course' ? renderCourse(s.course) : renderPromo()}</React.Fragment>)}
        </div>

        {showDock && (
          <div ref={dock} className={`absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 pb-2 ${bannerOn ? 'max-md:pb-[66px]' : ''}`}>
            {showDots && (
              <div className="inline-flex items-center h-9 px-2 rounded-full bg-black/40 backdrop-blur-md" role="group" aria-label="الشرائح">
                {slides.map((_, k) => (
                  <button key={k} onClick={() => goTo(k)} aria-label={`الشريحة ${k + 1}`} aria-current={k === active} className="h-9 w-5 grid place-items-center">
                    <span className={`block rounded-full transition-all ${k === active ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-white/45'}`} />
                  </button>
                ))}
                {f.heroPlayPause && (
                  <button onClick={() => setPlaying((v) => !v)} aria-label={playing ? 'إيقاف التمرير التلقائي' : 'تشغيل التمرير التلقائي'} className="h-9 w-8 grid place-items-center text-white/85">
                    {playing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                )}
              </div>
            )}

            {cards.length > 0 && (
              <div className="w-full flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory gutter md:justify-center" aria-label="عروض">
                {cards.map((c) => (
                  <div key={c.id} className="glass-card snap-center shrink-0 w-[80%] max-w-[360px] md:w-[340px] p-4 flex flex-col">
                    <p className="text-[17px] font-bold leading-snug">{fill(c.title, vars)}</p>
                    <p className="mt-1 text-[13.5px] leading-snug opacity-75 line-clamp-2 min-h-[38px]">{fill(c.line, vars)}</p>
                    <button onClick={() => go(c.href || '/')} className="btn btn-primary !h-10 !text-[15px] mt-3 w-full">{fill(c.button, vars)}</button>
                  </div>
                ))}
              </div>
            )}

            {f.heroScrollHint && (
              <button onClick={() => window.scrollTo({ top: root.current?.offsetHeight ?? 600, behavior: 'smooth' })} aria-label="انزل لأسفل" className="h-8 w-12 grid place-items-center text-white/85">
                <ChevronDown className="w-6 h-6" strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
