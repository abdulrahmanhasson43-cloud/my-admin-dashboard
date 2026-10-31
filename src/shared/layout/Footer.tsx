import React from 'react';
import { Logo } from '../ui';
import { go } from '../lib/router';

const COLS = [
  { title: 'المنصة', links: [['الدورات', '/courses'], ['مساراتي', '/my-learning'], ['الأسئلة الشائعة', '/#faq']] },
  { title: 'الحساب', links: [['تسجيل الدخول', '/login'], ['إنشاء حساب', '/login?mode=signup']] },
];

export const Footer: React.FC = () => (
  <footer className="gutter mt-20 pt-10 pb-10 border-t border-white/10">
    <div className="flex flex-col md:flex-row gap-10 md:gap-24">
      <div className="md:max-w-xs">
        <Logo onClick={() => go('/')} size={22} />
        <p className="text-[14px] text-muted mt-2">دورات مصوّرة بالعربية، تتابع فيها تقدّمك درساً بعد درس.</p>
      </div>
      {COLS.map((c) => (
        <div key={c.title}>
          <h3 className="text-[14px] font-semibold text-white mb-1">{c.title}</h3>
          <ul>
            {c.links.map(([label, href]) => (
              <li key={href}><button onClick={() => go(href)} className="h-[var(--tap)] text-[14px] text-muted hover:text-white">{label}</button></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <p className="text-[13px] text-faint mt-8">© {new Date().getFullYear()} مدار. جميع الحقوق محفوظة.</p>
  </footer>
);
