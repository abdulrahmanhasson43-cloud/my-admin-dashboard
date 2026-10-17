/**
 * A labelled text input with a modern, clean look — inspired by the input
 * style used on sites like Shopify: white background, a crisp 1.5px
 * border, and a soft focus ring instead of the flat gray-filled boxes
 * this used to be. Shared between ProfilePage and SettingsPage so both
 * stay visually consistent.
 */
export default function Field({ label, value, onChange, type = 'text', placeholder, dir }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        dir={dir}
        onChange={e => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-[10px] text-[15px] text-[var(--vuno-text)] bg-white border-[1.5px] border-[var(--vuno-border)] outline-none transition-all duration-150 placeholder:text-[var(--vuno-text-muted)] hover:border-[var(--vuno-text-muted)] focus:border-[var(--vuno-text)] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)]"
      />
    </div>
  );
}
