import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronDown, Menu, CircleUser, House, Library, CirclePlay, Wallet, KeyRound, GraduationCap, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Logo } from '../ui';
import { hideBroken } from '../ui/hue';
import { go, useRoute } from '../lib/router';
import { useAuth, portalOf } from '../../features/auth/AuthProvider';
import { COURSES } from '../../data/catalog';
import { useLabels, definite } from '../../modules/curriculum/ui/CurriculumProvider';
import { useWallet, egp } from '../../modules/wallet/ui/WalletProvider';
import { useSite } from '../../modules/site/ui/SiteProvider';

/**
 * شريط علوي أسود ثابت بأسلوب Apple TV: على الجوال زرّ القائمة (بلون التفاعل) يمين، والشعار في المنتصف،
 * والبحث وأيقونة الحساب يسار. على الشاشات الأكبر يظهر التنقّل الأفقي.
 */
export const TopBar: React.FC = () => {
  const { path } = useRoute();
  const { user, logout } = useAuth();
  const labels = useLabels();
  const { wallet } = useWallet();
  const { site } = useSite();
  const [searching, setSearching] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const onHome = path === '/' || path === '';
  const isStudent = user?.role === 'student';

  const NAV_LINKS = [
    { label: 'الرئيسية', href: '/' },
    { label: definite(labels.course.many), href: '/courses' },
    { label: 'مساراتي', href: '/my-learning' },
  ];
  const isActive = (href: string) => (href === '/' ? onHome : path.startsWith(href));

  useEffect(() => {
    if (!searching && !drawer) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSearching(false); setDrawer(false); } };
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [searching, drawer]);
  useEffect(() => { if (searching) inputRef.current?.focus(); }, [searching]);
  useEffect(() => { setSearching(false); setDrawer(false); setMenu(false); }, [path]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return COURSES.filter((c) => (c.title + c.tagline + c.instructor + c.tags.join(' ')).includes(q)).slice(0, 6);
  }, [query]);

  const drawerItems = [
    { icon: House, label: 'الرئيسية', href: '/' },
    { icon: Library, label: definite(labels.course.many), href: '/courses' },
    ...(isStudent ? [
      { icon: CirclePlay, label: 'مساراتي', href: '/my-learning' },
      ...(site.features.walletLink ? [{ icon: Wallet, label: `المحفظة — ${egp(wallet.balance)}`, href: '/wallet' }] : []),
      ...(site.features.codes ? [{ icon: KeyRound, label: 'عندي كود اشتراك', href: '/redeem' }] : []),
      ...(site.features.requestEdit ? [{ icon: GraduationCap, label: 'طلب تعديل السنة أو الترم', href: '/support-request' }] : []),
    ] : []),
    ...(user && !isStudent ? [{ icon: LayoutDashboard, label: 'لوحة التحكم', href: portalOf(user.role) }] : []),
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-black/80 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.08]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="gutter relative flex items-center justify-between" style={{ height: 'var(--topbar-h)' }}>
          <div className="flex items-center gap-2 md:gap-8">
            <button className="icon-btn md:hidden text-accent" aria-label="القائمة" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu className="w-7 h-7" strokeWidth={2.2} /></button>
            <span className="hidden md:block"><Logo onClick={() => go('/')} size={24} /></span>
            <nav className="hidden md:flex items-center gap-1" aria-label="التنقّل الرئيسي">
              {NAV_LINKS.map((l) => (
                <button key={l.href} onClick={() => go(l.href)} aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`h-[var(--tap)] px-3 text-[15px] font-medium transition-colors ${isActive(l.href) ? 'text-white' : 'text-white/60 hover:text-white'}`}>{l.label}</button>
              ))}
            </nav>
          </div>

          <div className="md:hidden absolute inset-x-0 flex justify-center pointer-events-none"><span className="pointer-events-auto"><Logo onClick={() => go('/')} size={24} /></span></div>

          <div className="flex items-center gap-1">
            {site.features.search && <button className="icon-btn" aria-label="بحث" onClick={() => setSearching(true)}><Search className="w-[22px] h-[22px]" strokeWidth={1.75} /></button>}
            <button className="icon-btn md:hidden" aria-label={user ? 'الحساب' : 'تسجيل الدخول'} onClick={() => (user ? setDrawer(true) : go('/login'))}><CircleUser className="w-[26px] h-[26px]" strokeWidth={1.6} /></button>
            <div className="hidden md:flex items-center gap-1 ms-2">
              {user ? (
                <div className="relative">
                  <button onClick={() => setMenu((v) => !v)} className="h-[var(--tap)] px-3 flex items-center gap-1 text-[15px] font-medium text-white" aria-expanded={menu}>{user.name}<ChevronDown className="w-4 h-4 text-white/60" /></button>
                  {menu && (
                    <div className="absolute end-0 top-full mt-1 w-60 bg-surface border border-white/10 rounded-xl py-2 shadow-2xl" role="menu">
                      {drawerItems.filter((i) => i.href !== '/' && i.href !== '/courses').map((i) => (
                        <button key={i.href} role="menuitem" onClick={() => go(i.href)} className="w-full text-start px-4 h-11 text-[15px] hover:bg-white/10">{i.label}</button>
                      ))}
                      <button role="menuitem" onClick={() => { logout(); go('/'); }} className="w-full text-start px-4 h-11 text-[15px] text-white/70 hover:bg-white/10">تسجيل الخروج</button>
                    </div>
                  )}
                </div>
              ) : (
                site.features.topbarAuth && (
                  <>
                    <button onClick={() => go('/login')} className="h-[var(--tap)] px-3 text-[15px] font-medium text-white/80 hover:text-white">{site.texts.topbarLogin}</button>
                    <button onClick={() => go('/login?mode=signup')} className="btn btn-primary !h-10 !px-5 !text-[15px]">{site.texts.topbarSignup}</button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-label="القائمة">
          <button className="absolute inset-0 bg-black/70" aria-label="إغلاق القائمة" onClick={() => setDrawer(false)} />
          <div className="drawer-in absolute inset-y-0 start-0 w-[84%] max-w-[340px] bg-black border-e border-white/10 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="gutter flex items-center justify-between h-[var(--topbar-h)] border-b border-white/10">
              <Logo onClick={() => go('/')} size={22} />
              <button className="icon-btn" aria-label="إغلاق" onClick={() => setDrawer(false)}><X className="w-6 h-6" /></button>
            </div>
            {user && <div className="gutter py-4 border-b border-white/10"><p className="font-bold text-white">{user.name}</p><p className="text-[13px] text-muted">{user.email}</p></div>}
            <nav className="flex-1 overflow-y-auto py-2" aria-label="القائمة">
              {drawerItems.map(({ icon: Icon, label, href }) => (
                <button key={href} onClick={() => go(href)} className="gutter w-full h-14 flex items-center gap-4 text-[17px] text-white/90 hover:bg-white/5 text-start"><Icon className="w-6 h-6 text-white/60" strokeWidth={1.7} />{label}</button>
              ))}
            </nav>
            <div className="gutter py-3 border-t border-white/10">
              {user ? (
                <button onClick={() => { logout(); setDrawer(false); go('/'); }} className="w-full h-12 flex items-center gap-4 text-[16px] text-white/70"><LogOut className="w-6 h-6" strokeWidth={1.7} />تسجيل الخروج</button>
              ) : (
                <div className="btn-pair">
                  <button onClick={() => go('/login')} className="btn btn-ghost"><LogIn className="w-5 h-5" />دخول</button>
                  <button onClick={() => go('/login?mode=signup')} className="btn btn-primary"><UserPlus className="w-5 h-5" />حساب جديد</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {searching && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto" role="dialog" aria-label="بحث">
          <div className="gutter max-w-3xl mx-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-white/50 shrink-0" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) go(`/courses?q=${encodeURIComponent(query.trim())}`); }}
                placeholder={`ابحث عن ${labels.subject.one} أو مدرّس`} className="field flex-1" />
              <button className="icon-btn" aria-label="إغلاق البحث" onClick={() => setSearching(false)}><X className="w-6 h-6" /></button>
            </div>
            <ul className="mt-4">
              {results.map((c) => (
                <li key={c.id}>
                  <button onClick={() => go(`/course/${c.id}`)} className="w-full flex items-center gap-4 py-3 text-start">
                    <img src={c.image} alt="" width={48} height={72} className="w-12 h-[72px] object-cover rounded-lg shrink-0" onError={hideBroken} />
                    <span className="min-w-0"><span className="block font-semibold text-white truncate">{c.title}</span><span className="block text-[14px] text-muted truncate">{c.instructor}</span></span>
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
