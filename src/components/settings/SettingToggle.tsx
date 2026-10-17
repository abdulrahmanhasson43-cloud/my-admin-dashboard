/** مفتاح تبديل Apple-style: شكل كبسولة، حركة سلسة، لون النجاح عند التفعيل. بدون label يملأ الصف فراغًا (يُستخدم داخل صف له نصّه الخاص). */
export default function SettingToggle({ checked, onChange, label, hint }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 py-3 text-right"
    >
      {label ? (
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-[var(--vuno-text)] leading-snug">{label}</p>
          {hint && <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5 leading-snug">{hint}</p>}
        </div>
      ) : <div className="flex-1" />}
      <span
        className="flex-shrink-0 relative w-[46px] h-[28px] rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--vuno-success)' : '#D2D2D7' }}
      >
        <span
          className="absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white transition-all duration-200"
          style={{
            left: checked ? '2px' : '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        />
      </span>
    </button>
  );
}
