import React from 'react';

/** الشعار: كلمة «مدار» مع علامة مدارية بسيطة (حلقة ونقطة). */
export const Logo: React.FC<{ onClick?: () => void; size?: number }> = ({ onClick, size = 26 }) => (
  <button onClick={onClick} className="inline-flex items-center gap-2 h-[var(--tap)]" aria-label="مدار — الصفحة الرئيسية">
    <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
      <circle cx="19.2" cy="7.2" r="3" fill="#3d8bff" />
    </svg>
    <span className="font-extrabold leading-none text-white" style={{ fontSize: size }}>مدار</span>
  </button>
);
