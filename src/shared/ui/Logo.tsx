import React from 'react';
import { useBrand } from '../lib/brand';

/** الشعار: كلمة «مدار» مع علامة مدارية بسيطة (حلقة ونقطة). */
export const Logo: React.FC<{ onClick?: () => void; size?: number; color?: string }> = ({ onClick, size = 26, color }) => {
  const { name } = useBrand();
  return (
  <button onClick={onClick} className="inline-flex items-center gap-2 h-[var(--tap)]" style={{ color: color ?? "#fff" }} aria-label={`${name} — الصفحة الرئيسية`}>
    <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="19.2" cy="7.2" r="3" fill="var(--color-accent)" />
    </svg>
    <span className="font-extrabold leading-none" style={{ fontSize: size }}>{name}</span>
  </button>
  );
};
