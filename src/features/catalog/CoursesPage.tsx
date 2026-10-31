import React, { useEffect, useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { COURSES, CATEGORIES, CategoryKey } from '../../data/catalog';
import { Poster } from '../../shared/ui';
import { useAuth } from '../auth/AuthProvider';
import { useRoute } from '../../shared/lib/router';

type SortKey = 'popular' | 'new' | 'rating' | 'short';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'الأكثر مشاهدة' },
  { key: 'new', label: 'الأحدث' },
  { key: 'rating', label: 'الأعلى تقييماً' },
  { key: 'short', label: 'الأقصر أولاً' },
];
const LEVELS = ['الكل', 'مبتدئ', 'متوسط', 'متقدم'] as const;

/** تبويب نصّي: الحالي بخط سفلي بلون التفاعل. */
const Tab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} aria-pressed={active} className={`h-[var(--tap)] px-1 shrink-0 text-[15px] font-medium border-b-2 transition-colors ${active ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>
    {children}
  </button>
);

const CoursesPage: React.FC = () => {
  const { query } = useRoute();
  const { progress } = useAuth();
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const urlCat = (params.get('cat') as CategoryKey | null) ?? 'all';
  const urlQ = params.get('q') ?? '';

  const [cat, setCat] = useState<CategoryKey | 'all'>(urlCat);
  const [q, setQ] = useState(urlQ);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('الكل');
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>((params.get('sort') as SortKey | null) ?? 'popular');

  useEffect(() => { setCat(urlCat); setQ(urlQ); }, [urlCat, urlQ]);

  const results = useMemo(() => {
    let list = [...COURSES];
    if (cat !== 'all') list = list.filter((c) => c.category === cat);
    if (level !== 'الكل') list = list.filter((c) => c.level === level);
    if (freeOnly) list = list.filter((c) => c.free);
    const needle = q.trim().toLowerCase();
    if (needle) list = list.filter((c) => [c.title, c.tagline, c.instructor, ...c.tags].some((t) => t.toLowerCase().includes(needle)));
    if (sort === 'new') list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'short') list.sort((a, b) => a.hours - b.hours);
    else list.sort((a, b) => b.students - a.students);
    return list;
  }, [cat, level, freeOnly, q, sort]);

  const reset = () => { setCat('all'); setLevel('الكل'); setFreeOnly(false); setQ(''); };

  return (
    <div className="gutter pb-10" style={{ paddingTop: 'calc(var(--topbar-h) + env(safe-area-inset-top, 0px) + 20px)' }}>
      <h1 className="text-[32px] md:text-[40px]">الدورات</h1>

      <div className="relative mt-4 max-w-2xl">
        <Search className="absolute start-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/45 pointer-events-none" strokeWidth={1.75} />
        <input className="field ps-8" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن دورة أو مدرّس" aria-label="بحث في الدورات" />
      </div>

      <div className="mt-3 flex gap-5 overflow-x-auto no-scrollbar border-b border-white/10" role="group" aria-label="التصنيف">
        <Tab active={cat === 'all'} onClick={() => setCat('all')}>الكل</Tab>
        {CATEGORIES.map((c) => <Tab key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>{c.label}</Tab>)}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6">
        <div className="flex gap-4 overflow-x-auto no-scrollbar" role="group" aria-label="المستوى">
          {LEVELS.map((l) => <Tab key={l} active={level === l} onClick={() => setLevel(l)}>{l}</Tab>)}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setFreeOnly((v) => !v)} aria-pressed={freeOnly} className={`h-[var(--tap)] flex items-center gap-1.5 text-[15px] font-medium ${freeOnly ? 'text-white' : 'text-white/55'}`}>
            <span className={`w-5 h-5 rounded-md grid place-items-center ${freeOnly ? 'bg-accent' : 'bg-white/15'}`}>{freeOnly && <Check className="w-3.5 h-3.5" strokeWidth={3} />}</span>
            مجانية فقط
          </button>
          <label className="sr-only" htmlFor="sort">الترتيب</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-[var(--tap)] bg-transparent text-[15px] font-medium text-white/80 cursor-pointer">
            {SORTS.map((s) => <option key={s.key} value={s.key} className="bg-surface">{s.label}</option>)}
          </select>
        </div>
      </div>

      <p className="text-[14px] text-muted mt-4 mb-4" aria-live="polite">{results.length.toLocaleString('ar-EG')} دورة</p>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-7">
          {results.map((c) => <Poster key={c.id} course={c} fluid progress={progress[c.id] ?? c.progress} />)}
        </div>
      ) : (
        <div className="py-16 max-w-md">
          <h2 className="text-white">لا توجد دورات بهذه المعايير</h2>
          <p className="text-muted mt-2">خفّف الفلاتر أو جرّب كلمة بحث أخرى.</p>
          <button onClick={reset} className="btn btn-primary mt-5">إعادة ضبط الفلاتر</button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
