import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** أسئلة شائعة بأسلوب Yango: كتل بزوايا ناعمة، والسؤال يمين، وزرّ دائري للسهم يسار. */
export const Faq: React.FC<{ items: { q: string; a: string }[]; title?: string }> = ({ items, title = 'هل لديك أي أسئلة؟' }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="gutter mt-14 md:mt-20 max-w-3xl mx-auto">
      <h2 className="text-white font-bold section-title">{title}</h2>
      <p className="text-muted mt-1">سنساعدك في الإجابة عنها.</p>
      <div className="mt-5 space-y-2.5">
        {items.map((f, k) => (
          <div key={f.q} className="rounded-2xl bg-surface">
            <button className="w-full min-h-[64px] flex items-center justify-between gap-4 px-5 py-3 text-start" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>
              <span className="text-[17px] font-medium text-white">{f.q}</span>
              <span className={`grid place-items-center w-9 h-9 rounded-full shrink-0 transition-colors ${open === k ? 'bg-white text-ink' : 'bg-white/12 text-white'}`}>
                <ChevronDown className={`w-5 h-5 transition-transform ${open === k ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {open === k && <p className="text-[15px] text-white/75 px-5 pb-5 -mt-1 max-w-[60ch]">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};
