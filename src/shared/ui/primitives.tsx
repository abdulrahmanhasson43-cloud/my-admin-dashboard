import React, { useState } from 'react';
import { Star, Check, Lock, Play, Users } from 'lucide-react';

/** وسم نصّي بسيط — بلا إطار ولا خلفية. */
export const Pill: React.FC<{ children: React.ReactNode; tone?: 'default' | 'brand' | 'free' | 'new' | 'live' }> = ({ children, tone = 'default' }) => {
  const color = tone === 'free' ? 'text-mint' : tone === 'default' ? 'text-white/80' : 'text-white';
  return <span className={`inline-flex items-center gap-1 text-[13px] font-semibold ${color}`}>{children}</span>;
};

export const Stars: React.FC<{ value: number; size?: number; showValue?: boolean }> = ({ value, size = 13, showValue }) => (
  <span className="inline-flex items-center gap-1">
    <Star width={size} height={size} className="fill-gold text-gold" strokeWidth={0} />
    {showValue && <span className="text-white/90 text-[13px] font-semibold">{value.toLocaleString('ar-EG', { minimumFractionDigits: 1 })}</span>}
  </span>
);

export const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`h-[3px] w-full bg-white/25 overflow-hidden ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full bg-accent" style={{ width: `${Math.max(2, value)}%` }} />
  </div>
);

export const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 36 }) => {
  const [failed, setFailed] = useState(false);
  const initials = name.trim().split(' ').slice(0, 2).map((w) => w[0]).join('');
  return src && !failed ? (
    <img src={src} alt={name} width={size} height={size} loading="lazy" onError={() => setFailed(true)} className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="grid place-items-center rounded-full bg-surface-2 text-white font-semibold shrink-0" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-label={name}>{initials}</span>
  );
};

export const SectionTitle: React.FC<{ eyebrow?: string; title: string; desc?: string; center?: boolean }> = ({ title, desc, center }) => (
  <div className={center ? 'text-center max-w-2xl mx-auto' : ''}>
    <h2 className="text-white">{title}</h2>
    {desc && <p className="text-[15px] text-muted leading-relaxed mt-2 max-w-[60ch]">{desc}</p>}
  </div>
);

export const LessonState: React.FC<{ locked?: boolean; done?: boolean }> = ({ locked, done }) => (
  <span className={`grid place-items-center w-7 h-7 rounded-full shrink-0 ${done ? 'bg-mint/20 text-mint' : locked ? 'bg-white/8 text-muted' : 'bg-white/12 text-white'}`}>
    {done ? <Check className="w-3.5 h-3.5" /> : locked ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
  </span>
);

export const MetaDot: React.FC = () => <span className="w-1 h-1 rounded-full bg-white/30 inline-block" />;

export const StudentCount: React.FC<{ n: number }> = ({ n }) => (
  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{n.toLocaleString('ar-EG')} متعلّم</span>
);
