import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Minus, RotateCcw } from 'lucide-react';

/**
 * أدوات لوحة تحكم المالك بأسلوب «الإعدادات المجمّعة»: كل قسم بطاقة واحدة هادئة، وصفوفها مفصولة بخط خفيف،
 * والأرقام بأسهم وشريط في سطر واحد. لا توجد قيم أو ألوان مقترحة من عندي.
 */

export const Section: React.FC<{ title: string; help?: string; children: React.ReactNode }> = ({ title, help, children }) => (
  <section className="mt-8 first:mt-2">
    <h2 className="px-1 text-[13px] font-bold tracking-wide text-muted">{title}</h2>
    {help && <p className="px-1 mt-1 text-[12.5px] leading-relaxed text-faint max-w-[68ch]">{help}</p>}
    <div className="mt-2.5 rounded-2xl bg-surface px-4 divide-y divide-white/[0.07]">{children}</div>
  </section>
);

const Label: React.FC<{ label: string; help?: string }> = ({ label, help }) => (
  <div className="min-w-0">
    <p className="text-[15px] font-medium text-white leading-snug">{label}</p>
    {help && <p className="text-[12.5px] leading-snug text-muted mt-0.5">{help}</p>}
  </div>
);

/** صف إعداد: الافتراضي يضع الحقل تحت العنوان، و«inline» يضع الأداة بجانب العنوان (ألوان، مفاتيح). */
export const Row: React.FC<{ label: string; help?: string; children: React.ReactNode; inline?: boolean }> = ({ label, help, children, inline }) => (
  inline ? (
    <div className="flex items-center justify-between gap-4 py-3"><Label label={label} help={help} /><div className="shrink-0">{children}</div></div>
  ) : (
    <div className="py-3 md:grid md:grid-cols-[220px_1fr] md:gap-x-6 md:items-start"><Label label={label} help={help} /><div className="mt-2 md:mt-0 min-w-0">{children}</div></div>
  )
);

/** حقل نص يُحفظ عند الخروج منه (أو الضغط على Enter في الحقل المفرد). */
export const TextField: React.FC<{ value: string; aria: string; onCommit: (v: string) => void; multiline?: boolean; rows?: number; ph?: string; ltr?: boolean; className?: string }> = ({ value, aria, onCommit, multiline, rows = 3, ph, ltr, className = '' }) => {
  const common = {
    defaultValue: value, 'aria-label': aria, placeholder: ph, dir: ltr ? 'ltr' as const : undefined,
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (e.target.value !== value) onCommit(e.target.value); },
  };
  return multiline
    ? <textarea key={`${aria}-${value}`} rows={rows} className={`field !min-h-0 py-2.5 leading-relaxed resize-y ${className}`} {...common} />
    : <input key={`${aria}-${value}`} className={`field !min-h-[44px] ${className}`} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} {...common} />;
};

export const Switch: React.FC<{ on: boolean; label: string; onChange: (v: boolean) => void }> = ({ on, label, onChange }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
    className={`relative w-[46px] h-[28px] rounded-full shrink-0 transition-colors ${on ? 'bg-accent' : 'bg-white/20'}`}>
    <span className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-all ${on ? 'end-[3px]' : 'start-[3px]'}`} />
  </button>
);

export const ToggleRow: React.FC<{ label: string; help?: string; on: boolean; onChange: (v: boolean) => void }> = ({ label, help, on, onChange }) => (
  <div className="flex items-center justify-between gap-5 py-3"><Label label={label} help={help} /><Switch on={on} label={label} onChange={onChange} /></div>
);

const stepBtn = 'w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 shrink-0';

/** صف مقاس كامل: العنوان والقيمة في سطر، وتحتهما شريط السحب بين سهمي (−) و(+). */
export const StepperRow: React.FC<{ label: string; help?: string; value: number; min: number; max: number; step?: number; unit?: string; aria?: string; onChange: (n: number) => void; defaultValue?: number }> = ({ label, help, value, min, max, step = 1, unit = '', aria, onChange, defaultValue }) => {
  const name = aria ?? label;
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step));
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <Label label={label} help={help} />
        <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
          {defaultValue !== undefined && defaultValue !== value && (
            <button className="h-8 px-2 inline-flex items-center gap-1 rounded-full text-[12px] text-white/65 hover:text-white" onClick={() => onChange(defaultValue)} aria-label={`إعادة ${name} للأصل`}><RotateCcw className="w-3.5 h-3.5" />الأصل</button>
          )}
          <input key={`${name}-${value}`} inputMode="decimal" defaultValue={value} aria-label={name} dir="ltr"
            className="w-[60px] h-9 rounded-lg bg-white/[0.07] text-center text-[15px] font-semibold tabular-nums text-white outline-none focus:ring-2 focus:ring-accent"
            onBlur={(e) => { const n = Number(e.target.value); if (Number.isFinite(n) && n !== value) onChange(n); else e.target.value = String(value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
          <span className="text-[12px] text-muted w-6">{unit}</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5" dir="ltr">
        <button className={stepBtn} aria-label={`تقليل ${name}`} disabled={value <= min} onClick={() => onChange(clamp(value - step))}><Minus className="w-4 h-4" /></button>
        <input type="range" min={min} max={max} step={step} value={value} aria-label={`${name} (سحب)`} className="flex-1 min-w-0 accent-[var(--color-accent)]" onChange={(e) => onChange(Number(e.target.value))} />
        <button className={stepBtn} aria-label={`زيادة ${name}`} disabled={value >= max} onClick={() => onChange(clamp(value + step))}><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

/** منتقي لون حرّ + كتابة الكود يدوياً + زرّ للرجوع للون الأصلي، بجانب العنوان. */
export const ColorField: React.FC<{ value: string; aria: string; onChange: (v: string) => void; defaultValue?: string }> = ({ value, aria, onChange, defaultValue }) => (
  <div className="flex items-center gap-2">
    {defaultValue && defaultValue.toLowerCase() !== value.toLowerCase() && (
      <button className="w-8 h-8 grid place-items-center rounded-full text-white/60 hover:text-white" onClick={() => onChange(defaultValue)} aria-label={`إعادة ${aria} للأصل`} title="الأصل"><RotateCcw className="w-4 h-4" /></button>
    )}
    <input key={`${aria}-${value}`} defaultValue={value} aria-label={`كود ${aria}`} dir="ltr" placeholder="#RRGGBB"
      className="w-[92px] h-10 rounded-lg bg-white/[0.07] text-center text-[14px] tabular-nums text-white outline-none focus:ring-2 focus:ring-accent"
      onBlur={(e) => e.target.value !== value && onChange(e.target.value.trim())} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
    <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : '#000000'} aria-label={`اختيار ${aria}`} onChange={(e) => onChange(e.target.value)}
      className="w-11 h-10 rounded-lg border border-white/20 bg-transparent p-0.5 cursor-pointer" />
  </div>
);

export const SelectField: React.FC<{ value: string; aria: string; options: { value: string; label: string }[]; onChange: (v: string) => void }> = ({ value, aria, options, onChange }) => (
  <select aria-label={aria} value={value} onChange={(e) => onChange(e.target.value)} className="field !min-h-[44px] bg-transparent">
    {options.map((o) => <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>)}
  </select>
);

export const Chips: React.FC<{ options: { value: string; label: string }[]; value: string; aria: string; onChange: (v: string) => void }> = ({ options, value, aria, onChange }) => (
  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={aria}>
    {options.map((o) => (
      <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
        className={`h-10 px-4 rounded-full text-[14px] font-semibold ${value === o.value ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>{o.label}</button>
    ))}
  </div>
);

/** اختيار شكل الزوايا بمعاينة حقيقية لكل خيار (كبسولة، ناعمة، حادّة...) بدل الاسم وحده. */
export const ShapePicker: React.FC<{ value: number; aria: string; options: { value: number; label: string }[]; onChange: (v: number) => void; kind: 'button' | 'poster' }> = ({ value, aria, options, onChange, kind }) => (
  <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label={aria}>
    {options.map((o) => {
      const on = value === o.value;
      return (
        <button key={o.label} role="radio" aria-checked={on} onClick={() => onChange(o.value)}
          className={`rounded-xl p-3 flex flex-col items-center gap-2 transition-colors ${on ? 'bg-white/[0.13] ring-2 ring-accent' : 'bg-white/[0.05] hover:bg-white/[0.09]'}`}>
          <span aria-hidden className="grid place-items-center h-14 w-full">
            {kind === 'button'
              ? <span className="block h-9 w-full max-w-[92px] bg-white" style={{ borderRadius: o.value }} />
              : <span className="block h-14 w-10 bg-white/85" style={{ borderRadius: Math.min(o.value, 20) }} />}
          </span>
          <span className="text-[13px] font-semibold text-white">{o.label}</span>
        </button>
      );
    })}
  </div>
);

/** أسهم نقل عنصر لأعلى/لأسفل + حذف، لقوائم الأعمدة والروابط والكروت. */
export const ItemTools: React.FC<{ index: number; count: number; onMove: (dir: -1 | 1) => void; onDelete?: () => void; name: string }> = ({ index, count, onMove, onDelete, name }) => (
  <div className="flex items-center shrink-0">
    <button className="w-9 h-9 grid place-items-center rounded-full text-white disabled:opacity-30" aria-label={`نقل ${name} لأعلى`} disabled={index === 0} onClick={() => onMove(-1)}><ChevronUp className="w-5 h-5" /></button>
    <button className="w-9 h-9 grid place-items-center rounded-full text-white disabled:opacity-30" aria-label={`نقل ${name} لأسفل`} disabled={index === count - 1} onClick={() => onMove(1)}><ChevronDown className="w-5 h-5" /></button>
    {onDelete && <button className="w-9 h-9 grid place-items-center rounded-full text-white/55 hover:text-[#ff8a8a]" aria-label={`حذف ${name}`} onClick={() => { if (confirm(`حذف «${name}»؟`)) onDelete(); }}><Trash2 className="w-[17px] h-[17px]" /></button>}
  </div>
);

export const AddButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <div className="py-3"><button onClick={onClick} className="h-10 px-4 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-[14px] font-semibold text-white"><Plus className="w-4 h-4" />{label}</button></div>
);

/** عنصر قابل للطي داخل بطاقة القسم (طريقة دفع، كرت، عمود...). */
export const Collapsible: React.FC<{ title: React.ReactNode; tools?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, tools, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div className="flex items-center gap-2">
        <button className="flex-1 min-w-0 min-h-[52px] flex items-center gap-2.5 text-start" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <ChevronDown className={`w-4 h-4 text-white/50 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
          <span className="min-w-0 truncate text-[15px] font-semibold text-white">{title}</span>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">{tools}</div>
      </div>
      {open && <div className="mb-3 rounded-xl bg-black/25 px-3 divide-y divide-white/[0.07]">{children}</div>}
    </div>
  );
};

export const ErrorLine: React.FC<{ error: string | null }> = ({ error }) => (error ? <p role="alert" className="mb-3 rounded-xl bg-[#ff8a8a]/10 px-4 py-3 text-[14px] text-[#ff8a8a]">{error}</p> : null);
