import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Logo } from '../ui';
import { hideBroken } from '../ui/hue';
import { go, useRoute } from '../lib/router';
import { useAuth } from '../../features/auth/AuthProvider';
import { COURSES } from '../../data/catalog';

export const NAV_LINKS = [
  { label: 'الرئيسية', href: '/' },
  { label: 'الدورات', href: '/courses' },
  { label: 'مساراتي', href: '/my-learning' },
];

/** شريط علوي: شفاف فوق الهيرو ثم زجاجي عند التمرير. قريب من أعلى الشاشة بلا فراغ زائد. */
export const TopBar: React.FC = () => {
  const { path } = useRoute();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const onHome = path === '/' || path === '';

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!searching) return;
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setSearching(false);
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [searching]);

  useEffect(() => { setSearching(false); setMenu(false); }, [path]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return COURSES.filter((c) => (c.title + c.tagline + c.instructor + c.tags.join(' ')).includes(q)).slice(0, 6);
  }, [query]);

  const solid = scrolled || !onHome;
  const isActive = (href: string) => (href === '/' ? onHome : path.startsWith(href));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${solid ? 'glass' : 'bg-gradient-to-b from-black/70 to-transparent'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="gutter flex items-center justify-between" style={{ height: 'var(--topbar-h)' }}>
          <div className="flex items-center gap-8">
            <Logo onClick={() => go('/')} size={24} />
            <nav className="hidden md:flex items-center gap-1" aria-label="التنقّل الرئيسي">
              {NAV_LINKS.map((l) => (
                <button key={l.href} onClick={() => go(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`h-[var(--tap)] px-3 text-[15px] font-medium transition-colors ${isActive(l.href) ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                  {l.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <button className="icon-btn" aria-label="بحث" onClick={() => setSearching(true)}><Search className="w-[22px] h-[22px]" strokeWidth={1.75} /></button>
            <div className="hidden md:flex items-center gap-1 ms-2">
              {user ? (
                <div className="relative">
                  <button onClick={() => setMenu((v) => !v)} className="h-[var(--tap)] px-3 flex items-center gap-1 text-[15px] font-medium text-white" aria-expanded={menu}>
                    {user.name}<ChevronDown className="w-4 h-4 text-white/60" />
                  </button>
                  {menu && (
                    <div className="absolute end-0 top-full mt-1 w-56 glass rounded-xl py-2 shadow-2xl" role="menu">
                      <button role="menuitem" onClick={() => go('/my-learning')} className="w-full text-start px-4 h-11 text-[15px] hover:bg-white/10">مساراتي</button>
                      {user.role !== 'student' && <button role="menuitem" onClick={() => go('/admin')} className="w-full text-start px-4 h-11 text-[15px] hover:bg-white/10">لوحة التحكم</button>}
                      <button role="menuitem" onClick={() => { logout(); go('/'); }} className="w-full text-start px-4 h-11 text-[15px] text-white/70 hover:bg-white/10">تسجيل الخروج</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => go('/login')} className="h-[var(--tap)] px-3 text-[15px] font-medium text-white/80 hover:text-white">دخول</button>
                  <button onClick={() => go('/login?mode=signup')} className="btn btn-primary !h-10 !px-5 !text-[15px]">ابدأ مجاناً</button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {searching && (
        <div className="fixed inset-0 z-50 bg-ink/97 overflow-y-auto" role="dialog" aria-label="بحث">
          <div className="gutter max-w-3xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-white/50 shrink-0" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) go(`/courses?q=${encodeURIComponent(query.trim())}`); }}
                placeholder="ابحث عن دورة أو مدرّس" className="field flex-1" />
              <button className="icon-btn" aria-label="إغلاق البحث" onClick={() => setSearching(false)}><X className="w-6 h-6" /></button>
            </div>
            <ul className="mt-4">
              {results.map((c) => (
                <li key={c.id}>
                  <button onClick={() => go(`/course/${c.id}`)} className="w-full flex items-center gap-4 py-3 text-start">
                    <img src={c.image} alt="" width={48} height={72} className="w-12 h-[72px] object-cover rounded-md shrink-0" onError={hideBroken} />
                    <span className="min-w-0">
                      <span className="block font-semibold text-white truncate">{c.title}</span>
                      <span className="block text-[14px] text-muted truncate">{c.instructor}</span>
                    </span>
                  </button>
                </li>
              ))}
              {query.trim() && results.length === 0 && <li className="py-6 text-muted">لا توجد نتائج لـ «{query.trim()}». جرّب كلمة أخرى أو اسم المدرّس.</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
