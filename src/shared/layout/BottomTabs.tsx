import React, { useState } from 'react';
import { House, Library, CirclePlay, User } from 'lucide-react';
import { go, useRoute } from '../lib/router';
import { useAuth } from '../../features/auth/AuthProvider';

/** شريط تبويب سفلي بعرض الشاشة كاملاً ومتصل بالحافة السفلية — للجوال فقط. */
export const BottomTabs: React.FC = () => {
  const { path } = useRoute();
  const { user, logout } = useAuth();
  const [sheet, setSheet] = useState(false);

  const tabs = [
    { label: 'الرئيسية', icon: House, active: path === '/' || path === '', onClick: () => go('/') },
    { label: 'الدورات', icon: Library, active: path.startsWith('/courses') || path.startsWith('/course/'), onClick: () => go('/courses') },
    { label: 'مساراتي', icon: CirclePlay, active: path.startsWith('/my-learning'), onClick: () => go('/my-learning') },
    { label: 'حسابي', icon: User, active: sheet || path.startsWith('/login'), onClick: () => (user ? setSheet(true) : go('/login')) },
  ];

  return (
    <>
      {sheet && user && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setSheet(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 bg-surface rounded-t-2xl gutter pt-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="حسابي">
            <p className="text-[18px] font-bold text-white">{user.name}</p>
            <p className="text-[14px] text-muted mb-4">{user.email}</p>
            {user.role !== 'student' && <button onClick={() => { setSheet(false); go('/admin'); }} className="btn btn-ghost w-full mb-2.5">لوحة التحكم</button>}
            <button onClick={() => { logout(); setSheet(false); go('/'); }} className="btn btn-ghost w-full">تسجيل الخروج</button>
          </div>
        </div>
      )}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 glass border-t border-white/10 grid grid-cols-4" style={{ height: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="التنقّل السفلي">
        {tabs.map(({ label, icon: Icon, active, onClick }) => (
          <button key={label} onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex flex-col items-center justify-center gap-0.5 ${active ? 'text-white' : 'text-white/50'}`}>
            <Icon className="w-6 h-6" strokeWidth={active ? 2.1 : 1.6} />
            <span className="text-[12px] font-medium leading-none">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
