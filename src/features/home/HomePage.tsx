import React, { useMemo } from 'react';
import { Poster, Rail } from '../../shared/ui';
import { useAuth } from '../auth/AuthProvider';
import { COURSES, CATEGORIES, FAQ, coursesByCategory } from '../../data/catalog';
import { HeroCarousel } from './HeroCarousel';
import { Top10Rail } from './Top10Rail';
import { PromoBand, Faq } from './GuestSections';

const HomePage: React.FC = () => {
  const { user, progress } = useAuth();

  const popular = useMemo(() => [...COURSES].sort((a, b) => b.students - a.students), []);
  const featured = popular.slice(0, 4);
  const inProgress = COURSES.filter((c) => (progress[c.id] ?? c.progress ?? 0) > 0 && (progress[c.id] ?? c.progress ?? 0) < 100);
  const fresh = COURSES.filter((c) => c.isNew);
  const spotlight = COURSES.filter((c) => c.free).length >= 3 ? COURSES.filter((c) => c.free) : popular.slice(4, 10);
  const sections = CATEGORIES.slice(0, 3).map((cat) => ({ cat, items: coursesByCategory(cat.key) })).filter((s) => s.items.length > 1);

  return (
    <>
      <HeroCarousel items={featured} progress={progress} />

      {!user && (
        <div className="gutter mt-10 md:mt-14">
          <p className="text-[22px] md:text-[26px] font-bold text-accent">دورات ومسارات</p>
          <h2 className="text-[30px] md:text-[46px] font-extrabold text-white leading-tight mt-1">تعلّم في أي وقت</h2>
        </div>
      )}

      {user && inProgress.length > 0 && (
        <Rail title="أكمل من حيث توقّفت">
          {inProgress.map((c) => <Poster key={c.id} course={c} progress={progress[c.id] ?? c.progress} />)}
        </Rail>
      )}
      {fresh.length > 0 && (
        <Rail title="دورات جديدة" href="/courses">
          {fresh.map((c) => <Poster key={c.id} course={c} />)}
        </Rail>
      )}
      <Top10Rail items={popular} href="/courses" />
      <Rail title="لا يفوتك" href="/courses">
        {spotlight.map((c) => <Poster key={c.id} course={c} size="lg" />)}
      </Rail>
      {sections.map(({ cat, items }) => (
        <Rail key={cat.key} title={cat.label} href={`/courses?cat=${cat.key}`}>
          {items.map((c) => <Poster key={c.id} course={c} />)}
        </Rail>
      ))}

      {!user && (
        <>
          <PromoBand />
          <Faq items={FAQ} />
        </>
      )}
    </>
  );
};

export default HomePage;
