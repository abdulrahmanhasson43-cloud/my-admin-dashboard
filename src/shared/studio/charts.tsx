import React from 'react';
import type { Point } from '../../modules/analytics/domain/series';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
export const num = (n: number) => n.toLocaleString('ar-EG');

/** رسم خطي بسيط بـ SVG: خط ومساحة خفيفة تحته، مع أعلى قيمة وتاريخي البداية والنهاية. */
export const LineChart: React.FC<{ points: Point[]; label: string; unit?: string }> = ({ points, label, unit = '' }) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  const W = 640, H = 200, pad = 6;
  const xy = points.map((p, i) => [pad + (i / Math.max(1, points.length - 1)) * (W - pad * 2), H - pad - (p.value / max) * (H - pad * 2)] as const);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${xy[xy.length - 1]?.[0] ?? 0},${H} L${xy[0]?.[0] ?? 0},${H} Z`;
  const total = points.reduce((n, p) => n + p.value, 0);
  return (
    <figure>
      <div className="relative">
        <span className="absolute top-0 left-0 text-[12px] text-faint tabular-nums">{num(max)}{unit}</span>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-[180px] md:h-[220px]" role="img" aria-label={`${label}: الإجمالي ${num(total)}${unit} خلال ${num(points.length)} يوماً`}>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,.07)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
          <path d={area} fill="var(--color-accent)" opacity=".14" />
          <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <figcaption dir="ltr" className="flex justify-between text-[12px] text-faint mt-1"><span>{points[0] && fmtDate(points[0].date)}</span><span>{points.length > 0 && fmtDate(points[points.length - 1].date)}</span></figcaption>
    </figure>
  );
};

export interface MetricDef { key: string; label: string; value: number; deltaPct: number; unit?: string }

/** أرقام كبيرة مع نسبة التغيير؛ اضغط رقماً ليتغيّر الرسم (كما في YouTube Studio). بلا بطاقات. */
export const MetricTabs: React.FC<{ metrics: MetricDef[]; value: string; onChange: (key: string) => void }> = ({ metrics, value, onChange }) => (
  <div className={`grid grid-cols-2 ${metrics.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-x-4`} role="tablist">
    {metrics.map((m) => (
      <button key={m.key} role="tab" aria-selected={value === m.key} onClick={() => onChange(m.key)}
        className={`text-start py-3 border-b-2 transition-colors ${value === m.key ? 'border-accent' : 'border-white/10 hover:border-white/25'}`}>
        <span className="block text-[13px] text-muted">{m.label}</span>
        <span className="block text-[26px] md:text-[30px] font-extrabold text-white leading-tight tabular-nums">{num(m.value)}{m.unit}</span>
        <span className={`block text-[13px] ${m.deltaPct > 0 ? 'text-mint' : m.deltaPct < 0 ? 'text-[#ff8a8a]' : 'text-muted'}`}>
          {m.deltaPct === 0 ? 'بلا تغيير' : `${m.deltaPct > 0 ? '▲' : '▼'} ${num(Math.abs(m.deltaPct))}٪ عن الفترة السابقة`}
        </span>
      </button>
    ))}
  </div>
);

export const PeriodTabs: React.FC<{ value: number; onChange: (d: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-4" role="group" aria-label="الفترة">
    {[7, 28, 90].map((d) => (
      <button key={d} onClick={() => onChange(d)} aria-pressed={value === d} className={`h-[var(--tap)] px-1 text-[15px] font-medium border-b-2 ${value === d ? 'text-white border-accent' : 'text-white/55 border-transparent hover:text-white'}`}>
        آخر {num(d)} يوماً
      </button>
    ))}
  </div>
);

/** جدول خفيف: خطوط فاصلة رفيعة، ويُخفي الأعمدة الثانوية على الجوال. */
export interface Col<T> { label: string; render: (row: T) => React.ReactNode; hideOnMobile?: boolean; align?: 'end' }
export function DataTable<T>({ cols, rows, rowKey, onRow }: { cols: Col<T>[]; rows: T[]; rowKey: (r: T) => string; onRow?: (r: T) => void }) {
  return (
    <div className="overflow-x-auto -mx-[var(--gutter)] px-[var(--gutter)]">
      <table className="w-full text-[15px]">
        <thead>
          <tr className="text-[13px] text-muted">
            {cols.map((c) => <th key={c.label} className={`font-medium text-start py-2.5 border-b border-white/10 ${c.hideOnMobile ? 'hidden md:table-cell' : ''} ${c.align === 'end' ? 'text-end' : ''}`}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRow && (() => onRow(r))} className={`border-b border-white/10 ${onRow ? 'cursor-pointer hover:bg-white/[0.03]' : ''}`}>
              {cols.map((c) => <td key={c.label} className={`py-3 pe-3 ${c.hideOnMobile ? 'hidden md:table-cell' : ''} ${c.align === 'end' ? 'text-end' : ''}`}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
