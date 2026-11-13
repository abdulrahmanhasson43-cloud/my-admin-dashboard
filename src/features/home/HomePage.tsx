import React, { useMemo, useState } from 'react';
import { Rail } from '../../shared/ui';
import { egp } from '../../shared/lib/format';
import { useAuth } from '../auth/AuthProvider';
import GradePage from '../auth/GradePage';
import { COURSES, FAQ } from '../../data/catalog';
import { useCurriculum, definite } from '../../modules/curriculum/ui/CurriculumProvider';
import { CoursePoster } from '../../modules/curriculum/ui/CoursePoster';
import { gradesOfStage, subjectsOfGrade, subjectsOfStage } from '../../modules/curriculum/domain/rules';
import { useWallet } from '../../modules/wallet/ui/WalletProvider';
import { useSite } from '../../modules/site/ui/SiteProvider';
import { HOME_SECTIONS, type HomeSectionKey } from '../../modules/site/domain/entities';
import { stableNumber } from '../../modules/analytics/infrastructure/demoSeries';
import { LandingHero } from './LandingHero';
import { Top10Rail, type TopItem } from './Top10Rail';
import { Collections } from './Collections';
import { LatestLessonsRail } from './LatestLessonsRail';
import { PromoCard } from './PromoCard';
import { TeacherSection } from './TeacherSection';
import { HowToSubscribe } from './HowToSubscribe';
import { GuestBanner } from './GuestBanner';
import { Faq } from './GuestSections';

const byPopularity = (a: { students: number }, b: { students: number }) => b.students - a.students;
const priceLine = (price: number) => `${egp(price)} للترم`;

/**
 * ترتيب الصفحة كما في Apple TV: هبوط بشرائح، ثم صفوف، بطاقة ترويجية للزائر، أفضل 10، صفوف المواد،
 * قسم المدرّس، كيفية الاشتراك، والأسئلة. كل قسم يمكن للسوبر أدمن إخفاؤه من إعدادات المنصة.
 */
const HomePage: React.FC = () => {
  const { user, progress } = useAuth();
  const { config, labels, gradeName } = useCurriculum();
  const { hasAccess } = useWallet();
  const { site } = useSite();
  const f = site.features;
  const [guestStage, setGuestStage] = useState(config.stages[0]?.id ?? '');

  const gradeId = user?.role === 'student' ? user.gradeId : undefined;
  const gradeKnown = config.grades.some((g) => g.id === gradeId);
  const scoped = useMemo(() => (gradeKnown ? COURSES.filter((c) => c.gradeId === gradeId) : COURSES), [gradeKnown, gradeId]);
  const popular = useMemo(() => [...scoped].sort(byPopularity), [scoped]);
  const minPrice = useMemo(() => Math.min(...COURSES.map((c) => c.termPrice)), []);

  /** أفضل 10: كورسات لو كثيرة، وإلا الدروس الأكثر مشاهدة (عند صف واحد فيه باقات قليلة). */
  const top = useMemo<{ title: string; items: TopItem[] }>(() => {
    if (scoped.length >= 6) return { title: `أفضل 10 ${labels.course.many}`, items: popular.map((c) => ({ course: c })) };
    const lessons = scoped.flatMap((c) => c.curriculum.flatMap((m) => m.lessons.map((l) => ({ course: c, title: m.title, sub: l.title, views: stableNumber(l.id, 100, 9000) }))));
    return { title: `أفضل 10 ${labels.lesson.many}`, items: lessons.sort((a, b) => b.views - a.views).slice(0, 10) };
  }, [scoped, popular, labels]);

  if (user?.role === 'student' && !gradeKnown) return <GradePage embedded />;

  const inProgress = scoped.filter((c) => (progress[c.id] ?? 0) > 0 && (progress[c.id] ?? 0) < 100);
  const notSubscribed = scoped.filter((c) => !hasAccess(c)).sort(byPopularity);
  const fresh = scoped.filter((c) => c.isNew);
  const showFree = (!user || user.role === 'student') && notSubscribed.length > 0;
  const priceSub = (c: (typeof COURSES)[number]) => (gradeKnown ? priceLine(c.termPrice) : gradeName(c.gradeId));

  const t = (key: HomeSectionKey, fallback: string) => site.home.titles[key]?.trim() || fallback;
  const on = (key: HomeSectionKey) => { const def = HOME_SECTIONS.find((x) => x.key === key); return !def?.feature || f[def.feature]; };

  /** كل قسم يرجع null لو كان مخفياً أو غير مناسب للحالة؛ والترتيب من إعدادات السوبر أدمن. */
  const sections: Record<HomeSectionKey, () => React.ReactNode> = {
    inProgress: () => user && inProgress.length > 0 && (
      <Rail title={t('inProgress', 'أكمل من حيث توقّفت')}>{inProgress.map((c) => <CoursePoster key={c.id} course={c} sub={priceSub(c)} />)}</Rail>
    ),
    free: () => showFree && <Rail title={t('free', 'شاهد أول درس مجاناً')} href="/courses">{notSubscribed.slice(0, 12).map((c) => <CoursePoster key={c.id} course={c} sub={priceSub(c)} />)}</Rail>,
    fresh: () => fresh.length > 0 && <Rail title={t('fresh', `${labels.course.many} جديدة`)} href="/courses">{fresh.map((c) => <CoursePoster key={c.id} course={c} sub={priceSub(c)} />)}</Rail>,
    latest: () => <LatestLessonsRail courses={fresh.length >= 3 ? fresh : popular} title={t('latest', `أحدث ${labels.lesson.many}`)} />,
    promo: () => !user && <PromoCard minPrice={minPrice} />,
    top10: () => top.items.length > 0 && <Top10Rail items={top.items} title={t('top10', top.title)} href="/courses" />,
    collections: () => <Collections courses={scoped} title={t('collections', 'قوائم شائعة')} />,
    subjects: () => gradeKnown ? (
      subjectsOfGrade(config, gradeId).map((s) => {
        const items = scoped.filter((c) => c.subjectId === s.id);
        return items.length === 0 ? null : (
          <Rail key={s.id} title={s.name} href={`/courses?grade=${gradeId}&subject=${s.id}`}>{items.map((c) => <CoursePoster key={c.id} course={c} sub={priceLine(c.termPrice)} />)}</Rail>
        );
      })
    ) : (
      <>
        <div className="gutter mt-12 flex gap-5 overflow-x-auto no-scrollbar border-b border-white/10" role="tablist" aria-label={definite(labels.stage.many)}>
          {config.stages.map((st) => (
            <button key={st.id} role="tab" aria-selected={guestStage === st.id} onClick={() => setGuestStage(st.id)}
              className={`h-[var(--tap)] shrink-0 -mb-px text-[16px] font-semibold border-b-2 transition-colors ${guestStage === st.id ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>{st.name}</button>
          ))}
        </div>
        {subjectsOfStage(config, guestStage).map((s) => {
          const ids = new Set(gradesOfStage(config, guestStage).map((g) => g.id));
          const items = COURSES.filter((c) => c.subjectId === s.id && ids.has(c.gradeId));
          return items.length === 0 ? null : (
            <Rail key={s.id} title={s.name} href={`/courses?stage=${guestStage}&subject=${s.id}`}>{items.map((c) => <CoursePoster key={c.id} course={c} sub={gradeName(c.gradeId)} />)}</Rail>
          );
        })}
      </>
    ),
    teacher: () => <TeacherSection title={t('teacher', 'تعرّف على المدرّس')} />,
    howTo: () => <HowToSubscribe title={t('howTo', 'كيفية الاشتراك')} />,
    faq: () => !user && <Faq items={FAQ} title={t('faq', 'هل لديك أي أسئلة؟')} />,
  };

  return (
    <>
      <LandingHero courses={popular} minPrice={minPrice} />

      {gradeKnown && (
        <div className="gutter mt-6">
          <p className="text-[19px] md:text-[24px] font-bold text-white whitespace-nowrap truncate">{gradeName(gradeId)}</p>
        </div>
      )}

      {site.home.order.map((key) => (on(key) ? <React.Fragment key={key}>{sections[key]()}</React.Fragment> : null))}

      {f.guestBanner && !user && <GuestBanner />}
    </>
  );
};

export default HomePage;
