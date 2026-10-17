import { useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { XIcon } from '@/components/icons';

interface QRCodeButtonProps {
  /**
   * البيانات التي سيتم تشفيرها داخل الـ QR Code.
   * يمكن أن تكون رابط، نص، أو بيانات منسّقة.
   */
  value: string;
  /**
   * العنوان الظاهر أعلى الـ QR Code في النافذة المنبثقة.
   */
  label?: string;
  /**
   * حجم أيقونة الزر (اختياري).
   */
  iconSize?: number;
  /**
   * نص تلميح (tooltip) للزر.
   */
  title?: string;
}

/**
 * يعرض QR Code مباشرةً بدون أي زر أو نافذة منبثقة — للاستخدام داخل
 * نافذة/بطاقة أصلاً مفتوحة (مثل تفاصيل الفاتورة)، حتى لا يضطر المستخدم
 * لضغطة إضافية عشان يشوف الكود، وحتى لا نفتح نافذة فوق نافذة.
 */
export function QRCodeInline({ value, size = 180 }: { value: string; size?: number }) {
  return (
    <div className="p-5 bg-white rounded-2xl border-2 border-[var(--vuno-border)] inline-flex">
      <QRCodeSVG
        value={value || ' '}
        size={size}
        level="M"
        includeMargin={false}
        fgColor="#1D1D1F"
        bgColor="#FFFFFF"
      />
    </div>
  );
}

/**
 * زر صغير يعرض أيقونة QR، وعند الضغط عليه يفتح نافذة منبثقة
 * تعرض QR Code للقيمة الممرّرة. مناسب لإدراجه في أي صفحة
 * (المنتجات، الفواتير، العملاء، المخزون، الفئات، إلخ) كإجراء ثانوي
 * ضمن صف أو جدول — مش لما يكون QR هو المحتوى الأساسي المطلوب عرضه فورًا.
 */
export default function QRCodeButton({
  value,
  label = 'رمز QR',
  iconSize = 16,
  title = 'عرض رمز QR',
}: QRCodeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={title}
        aria-label={title}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--vuno-primary)] border border-[var(--vuno-border)] hover:bg-[color-mix(in_srgb,var(--vuno-primary)_8%,transparent)] transition-colors flex-shrink-0"
      >
        <QRCodeIcon size={iconSize} />
      </button>

      {open && createPortal(
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-[80] animate-in fade-in duration-200"
          />
          {/* QR modal — rendered via a portal straight into <body> so its
              `fixed` positioning always anchors to the real screen, not to
              some transformed ancestor (framer-motion pages use CSS
              transforms, which silently turn `fixed` into `absolute`
              relative to them — that's why this used to appear "from the
              middle" instead of stuck to the bottom). */}
          <div className="fixed inset-x-0 bottom-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:w-full sm:max-w-sm z-[85] bg-white rounded-t-[24px] sm:rounded-[20px] p-6 pb-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Drag handle on mobile bottom sheet */}
            <div className="sm:hidden flex justify-center mb-3">
              <div className="w-9 h-1 rounded-full bg-[var(--vuno-border)]" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--vuno-text)]">{label}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]"
              >
                <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              {/* QR code with generous padding so it's never clipped */}
              <div className="p-5 bg-white rounded-2xl border-2 border-[var(--vuno-border)] flex-shrink-0">
                <QRCodeSVG
                  value={value || ' '}
                  size={200}
                  level="M"
                  includeMargin={false}
                  fgColor="#1D1D1F"
                  bgColor="#FFFFFF"
                />
              </div>
              <p className="text-sm text-[var(--vuno-text-muted)] text-center break-all max-w-[260px]">
                {value}
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

/* أيقونة QR محلية بنفس نمط باقي الأيقونات في المشروع */
export const QRCodeIcon: React.FC<{ className?: string; size?: number }> = ({
  className,
  size = 24,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v.01" />
    <path d="M12 12v.01" />
    <path d="M12 17v.01" />
    <path d="M8 12h.01" />
    <path d="M16 12h.01" />
    <path d="M8 16h.01" />
  </svg>
);
