import React from 'react';
import { ChevronLeft, Library, Wallet, KeyRound } from 'lucide-react';
import { go } from '../../shared/lib/router';
import { useAuth } from '../auth/AuthProvider';
import { useSite } from '../../modules/site/ui/SiteProvider';

/** «كيفية الاشتراك»: ثلاثة صفوف في كتلة واحدة بزوايا ناعمة (يقابل «كيفية المشاهدة» في Apple TV). */
export const HowToSubscribe: React.FC<{ title?: string }> = ({ title = 'كيفية الاشتراك' }) => {
  const { user } = useAuth();
  const { site } = useSite();
  const rows = [
    { icon: Library, label: 'اشترك في كورس', go: () => go(user?.role === 'student' ? '/subscribe' : '/login?mode=signup') },
    { icon: Wallet, label: 'اشحن محفظتك', go: () => go(user?.role === 'student' ? '/wallet' : '/login') },
    ...(site.features.codes ? [{ icon: KeyRound, label: 'عندي كود من المدرّس', go: () => go(user?.role === 'student' ? '/redeem' : '/login') }] : []),
  ];
  return (
    <section className="gutter mt-12 md:mt-16 max-w-3xl mx-auto">
      <h2 className="text-white font-bold section-title">{title}</h2>
      <div className="mt-4 rounded-2xl bg-surface overflow-hidden">
        {rows.map(({ icon: Icon, label, go: run }, k) => (
          <button key={label} onClick={run} className={`w-full min-h-[84px] flex items-center gap-4 px-4 text-start ${k > 0 ? 'border-t border-white/10' : ''}`}>
            <span className="grid place-items-center w-14 h-14 rounded-xl bg-black border border-white/10 shrink-0"><Icon className="w-7 h-7 text-white" strokeWidth={1.6} /></span>
            <span className="flex-1 text-[18px] font-medium text-white">{label}</span>
            <ChevronLeft className="w-6 h-6 text-white/45" />
          </button>
        ))}
      </div>
    </section>
  );
};
