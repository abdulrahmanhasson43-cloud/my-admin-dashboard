import type { ReactNode } from 'react';
import { SearchIcon } from '@/components/icons';
import QRCodeButton from '@/components/QRCodeButton';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * زر/أزرار إجراء على اليسار (مثل "إضافة جديد").
   */
  actions?: ReactNode;
  /**
   * قيمة QR Code إن وُجدت (تظهر زر QR بجوار البحث).
   */
  qrValue?: string;
  qrLabel?: string;
}

/**
 * شريط بحث موحّد ومنظّم — البحث والأزرار (QR + إجراءات) دايمًا جنب بعض
 * في نفس الصف، على الموبايل والديسكتوب. الأزرار ثابتة الحجم (flex-shrink-0)
 * وحقل البحث هو اللي بياخد المساحة المتبقية، فالصف مايتكسرش تحت.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'بحث...',
  actions,
  qrValue,
  qrLabel,
}: SearchBarProps) {
  return (
    <div className="w-full flex items-center gap-2">
      {/* حقل البحث — ياخد المساحة المتبقية دايمًا */}
      <div className="relative flex-1 min-w-0">
        <SearchIcon
          size={18}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)] pointer-events-none"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pr-10 pl-4 rounded-full border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm text-[var(--vuno-text)] placeholder:text-[var(--vuno-text-muted)] focus:outline-none focus:border-[var(--vuno-primary)] focus:bg-white transition-colors"
        />
      </div>

      {/* مجموعة الأزرار: QR + إجراءات — دايمًا جنب زرار البحث، نفس الصف */}
      {(qrValue || actions) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {qrValue && <QRCodeButton value={qrValue} label={qrLabel} />}
          {actions}
        </div>
      )}
    </div>
  );
}
