import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { go } from '../../shared/lib/router';

/** بانر بنفسجي داكن بزرّ «ابدأ» بعرض الشاشة، كما في Yango Play. */
export const PromoBand: React.FC = () => (
  <section className="mt-14 md:mt-20 pt-12 pb-10 gutter" style={{ background: 'linear-gradient(180deg, #0b0c0f 0%, #0a1a38 40%, #0f2a5c 62%, #0b0c0f 100%)' }}>
    <div className="max-w-2xl">
      <p className="text-[22px] font-bold text-accent">حسابك المجاني</p>
      <h2 className="text-white font-extrabold text-[26px] md:text-[34px] leading-snug mt-1">ابدأ بدرس مجاني من معظم الدورات، وتحفظ مدار مكانك في كل درس</h2>
      <p className="text-muted mt-3">والمزيد</p>
    </div>
    <button onClick={() => go('/login?mode=signup')} className="btn btn-primary btn-lg w-full mt-16 md:max-w-md">ابدأ</button>
  </section>
);

export const Faq: React.FC<{ items: { q: string; a: string }[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="gutter mt-14 md:mt-20 max-w-3xl">
      <h2 className="text-white font-bold text-[22px] md:text-[26px]">أسئلة شائعة</h2>
      <div className="mt-4">
        {items.map((f, k) => (
          <div key={f.q} className="border-t border-white/10 last:border-b">
            <button className="w-full min-h-[56px] flex items-center justify-between gap-4 py-3 text-start" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>
              <span className="text-[16px] font-medium text-white">{f.q}</span>
              <Plus className={`w-5 h-5 shrink-0 text-white/60 transition-transform ${open === k ? 'rotate-45' : ''}`} />
            </button>
            {open === k && <p className="text-[15px] text-muted pb-4 max-w-[60ch]">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};
