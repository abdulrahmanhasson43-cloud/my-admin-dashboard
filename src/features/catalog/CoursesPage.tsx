import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { COURSES } from '../../data/catalog';
import { CoursePoster } from '../../modules/curriculum/ui/CoursePoster';
import { useAuth } from '../auth/AuthProvider';
import { useRoute } from '../../shared/lib/router';
import { useCurriculum, definite } from '../../modules/curriculum/ui/CurriculumProvider';
import { gradesOfStage, stageOfGrade, subjectsOfStage } from '../../modules/curriculum/domain/rules';

type SortKey = 'popular' | 'new' | 'rating' | 'short';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'الأكثر مشاهدة' },
  { key: 'new', label: 'الأحدث' },
  { key: 'rating', label: 'الأعلى تقييماً' },
  { key: 'short', label: 'الأقصر أولاً' },
];

/** تبويب نصّي: الحالي بخط سفلي بلون التفاعل. */
const Tab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} aria-pressed={active} className={`h-[var(--tap)] px-1 shrink-0 text-[15px] font-medium border-b-2 transition-colors ${active ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>
    {children}
  </button>
);

const CoursesPage: React.FC = () => {
  const { query } = useRoute();
  const { user } = useAuth();
  const { config, labels, subjectName, gradeName } = useCurriculum();
  const params = useMemo(() => new URLSearchParams(query), [query]);

  const ownGrade = user?.role === 'student' ? user.gradeId : undefined;
  const urlGrade = params.get('grade') ?? (!params.get('stage') && !params.get('subject') ? ownGrade : undefined);
  const initialStage = params.get('stage') ?? stageOfGrade(config, urlGrade)?.id ?? 'all';

  const [stageId, setStageId] = useState<string>(initialStage);
  const [gradeId, setGradeId] = useState<string>(urlGrade ?? 'all');
  const [subjectId, setSubjectId] = useState<string>(params.get('subject') ?? 'all');
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState<SortKey>('popular');

  useEffect(() => {
    const g = params.get('grade') ?? (!params.get('stage') && !params.get('subject') ? ownGrade : undefined);
    setStageId(params.get('stage') ?? stageOfGrade(config, g)?.id ?? 'all');
    setGradeId(g ?? 'all');
    setSubjectId(params.get('subject') ?? 'all');
    setQ(params.get('q') ?? '');
  }, [query]);

  const results = useMemo(() => {
    let list = [...COURSES];
    if (stageId !== 'all') { const ids = new Set(gradesOfStage(config, stageId).map((g) => g.id)); list = list.filter((c) => ids.has(c.gradeId)); }
    if (gradeId !== 'all') list = list.filter((c) => c.gradeId === gradeId);
    if (subjectId !== 'all') list = list.filter((c) => c.subjectId === subjectId);
    const needle = q.trim().toLowerCase();
    if (needle) list = list.filter((c) => [c.title, c.instructor, ...c.tags].some((t) => t.toLowerCase().includes(needle)));
    if (sort === 'new') list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'short') list.sort((a, b) => a.hours - b.hours);
    else list.sort((a, b) => b.students - a.students);
    return list;
  }, [config, stageId, gradeId, subjectId, q, sort]);

  const pickStage = (id: string) => { setStageId(id); setGradeId('all'); setSubjectId('all'); };
  const reset = () => { setStageId('all'); setGradeId('all'); setSubjectId('all'); setQ(''); };

  return (
    <div className="gutter pb-10" style={{ paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 20px)' }}>
      <h1 className="text-[32px] md:text-[40px]">{definite(labels.course.many)}</h1>

      <div className="relative mt-4 max-w-2xl">
        <Search className="absolute start-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/45 pointer-events-none" strokeWidth={1.75} />
        <input className="field ps-8" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`ابحث عن ${labels.subject.one} أو مدرّس`} aria-label="بحث" />
      </div>

      <div className="mt-3 flex gap-5 overflow-x-auto no-scrollbar border-b border-white/10" role="group" aria-label={definite(labels.stage.many)}>
        <Tab active={stageId === 'all'} onClick={() => pickStage('all')}>الكل</Tab>
        {config.stages.map((s) => <Tab key={s.id} active={stageId === s.id} onClick={() => pickStage(s.id)}>{s.name}</Tab>)}
      </div>

      {stageId !== 'all' && (
        <>
          <div className="mt-1 flex gap-4 overflow-x-auto no-scrollbar" role="group" aria-label={definite(labels.grade.many)}>
            <Tab active={gradeId === 'all'} onClick={() => setGradeId('all')}>كل {definite(labels.grade.many)}</Tab>
            {gradesOfStage(config, stageId).map((g) => <Tab key={g.id} active={gradeId === g.id} onClick={() => setGradeId(g.id)}>{g.name}</Tab>)}
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar" role="group" aria-label={definite(labels.subject.many)}>
            <Tab active={subjectId === 'all'} onClick={() => setSubjectId('all')}>كل {definite(labels.subject.many)}</Tab>
            {subjectsOfStage(config, stageId).map((s) => <Tab key={s.id} active={subjectId === s.id} onClick={() => setSubjectId(s.id)}>{s.name}</Tab>)}
          </div>
        </>
      )}

      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-[14px] text-muted" aria-live="polite">{results.length.toLocaleString('ar-EG')} {results.length > 10 || results.length === 0 ? labels.course.one : labels.course.many}</p>
        <div className="flex items-center">
          <label className="sr-only" htmlFor="sort">الترتيب</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-[var(--tap)] bg-transparent text-[15px] font-medium text-white/80 cursor-pointer">
            {SORTS.map((s) => <option key={s.key} value={s.key} className="bg-surface">{s.label}</option>)}
          </select>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-7">
          {results.map((c) => (
            <CoursePoster key={c.id} course={c} fluid caption={c.offering} sub={gradeId === 'all' ? gradeName(c.gradeId) : undefined} />
          ))}
        </div>
      ) : (
        <div className="py-16 max-w-md">
          <h2 className="text-white">لا توجد {labels.course.many} بهذه المعايير</h2>
          <p className="text-muted mt-2">خفّف الفلاتر أو جرّب كلمة بحث أخرى.</p>
          <button onClick={reset} className="btn btn-primary mt-5">إعادة ضبط الفلاتر</button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
