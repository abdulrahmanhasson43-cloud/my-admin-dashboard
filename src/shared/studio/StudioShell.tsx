import React, { useState } from 'react';
import { LogOut, Globe, Ellipsis, X, type LucideIcon } from 'lucide-react';
import { Logo } from '../ui';
import { go, useRoute } from '../lib/router';
import { useAuth } from '../../features/auth/AuthProvider';

export interface NavItem { href: string; label: string; icon: LucideIcon }

/**
 * هيكل لوحات التحكم على طريقة YouTube Studio: قائمة جانبية على اللابتوب،
 * وشريط تبويب سفلي على الجوال. الصفحات تُعرض على الخلفية مباشرة بلا بطاقات.
 */
export const StudioShell: React.FC<{ portal: string; root: string; nav: NavItem[]; children: React.ReactNode }> = ({ portal: roleLabel, root: basePath, nav, children }) => {
  const { path } = useRoute();
  const { user, logout } = useAuth();
  const base = path.split('#')[0].split('?')[0];
  const [more, setMore] = useState(false);
  const primary = nav.length > 5 ? nav.slice(0, 4) : nav;
  const rest = nav.length > 5 ? nav.slice(4) : [];
  const isActive = (href: string) => (href === basePath ? base === basePath || base === `${basePath}/` : base.startsWith(href));

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-e border-white/10 px-3 py-5">
        <div className="px-3"><Logo onClick={() => go('/')} size={24} /><p className="text-[13px] text-muted mt-1">{roleLabel}</p></div>
        <nav className="mt-6 flex-1" aria-label="التنقّل">
          {nav.map(({ href, label, icon: Icon }) => (
            <button key={href} onClick={() => go(href)} aria-current={isActive(href) ? 'page' : undefined}
              className={`w-full h-12 px-3 flex items-center gap-3 rounded-lg text-[15px] font-medium transition-colors ${isActive(href) ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-5 h-5" strokeWidth={isActive(href) ? 2.2 : 1.7} />{label}
            </button>
          ))}
        </nav>
        <button onClick={() => go('/')} className="h-11 px-3 flex items-center gap-3 text-[14px] text-white/60 hover:text-white"><Globe className="w-[18px] h-[18px]" />العودة للموقع</button>
        <button onClick={() => { logout(); go('/'); }} className="h-11 px-3 flex items-center gap-3 text-[14px] text-white/60 hover:text-white"><LogOut className="w-[18px] h-[18px]" />تسجيل الخروج</button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-white/10" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="gutter h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="lg:hidden"><Logo onClick={() => go('/')} size={20} /></span>
              <span className="text-[15px] font-semibold text-white/80 truncate">{roleLabel}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="hidden sm:block text-[14px] text-muted">{user?.name}</span>
              <button className="icon-btn lg:hidden" aria-label="تسجيل الخروج" onClick={() => { logout(); go('/'); }}><LogOut className="w-5 h-5" strokeWidth={1.75} /></button>
            </div>
          </div>
        </header>
        <main className="gutter py-6 md:py-8 max-w-6xl mx-auto">{children}
          <p className="text-[12px] text-faint mt-12">الأرقام في هذه اللوحة تجريبية إلى أن تُربط بقاعدة بيانات حقيقية.</p>
        </main>
      </div>

      {more && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMore(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-x-0 bottom-0 bg-surface rounded-t-2xl gutter pt-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="المزيد">
            <div className="flex items-center justify-between mb-1"><p className="font-bold text-white">المزيد</p><button className="icon-btn" aria-label="إغلاق" onClick={() => setMore(false)}><X className="w-5 h-5" /></button></div>
            {rest.map(({ href, label, icon: Icon }) => (
              <button key={href} onClick={() => { setMore(false); go(href); }} className="w-full h-14 flex items-center gap-4 text-[16px] text-white/90 text-start"><Icon className="w-6 h-6 text-white/60" strokeWidth={1.7} />{label}</button>
            ))}
          </div>
        </div>
      )}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 glass border-t border-white/10 grid" style={{ gridTemplateColumns: `repeat(${primary.length + (rest.length ? 1 : 0)}, 1fr)`, height: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="التنقّل السفلي">
        {primary.map(({ href, label, icon: Icon }) => (
          <button key={href} onClick={() => go(href)} aria-current={isActive(href) ? 'page' : undefined} className={`flex flex-col items-center justify-center gap-0.5 ${isActive(href) ? 'text-white' : 'text-white/50'}`}>
            <Icon className="w-6 h-6" strokeWidth={isActive(href) ? 2.1 : 1.6} />
            <span className="text-[12px] font-medium leading-none">{label}</span>
          </button>
        ))}
        {rest.length > 0 && (
          <button onClick={() => setMore(true)} className={`flex flex-col items-center justify-center gap-0.5 ${rest.some((r) => isActive(r.href)) ? 'text-white' : 'text-white/50'}`}>
            <Ellipsis className="w-6 h-6" strokeWidth={1.7} /><span className="text-[12px] font-medium leading-none">المزيد</span>
          </button>
        )}
      </nav>
    </div>
  );
};

/** عنوان الصفحة داخل اللوحة: اسم الصفحة وسطر شرح اختياري وإجراء رئيسي اختياري. */
export const PageHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-end justify-between gap-4 mb-6">
    <div className="min-w-0">
      <h1 className="text-[26px] md:text-[32px]">{title}</h1>
      {sub && <p className="text-muted mt-1 text-[15px]">{sub}</p>}
    </div>
    {action}
  </div>
);
