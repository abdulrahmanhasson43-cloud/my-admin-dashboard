interface OrdersErrorBannerProps {
  error: string;
  onRetry: () => void;
}

/** مؤشّر الخطأ — يعرض أي فشل في القراءة أو المعالجة بدلاً من ابتلاعه صامتاً. */
export default function OrdersErrorBanner({ error, onRetry }: OrdersErrorBannerProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3 mt-5"
      style={{
        borderColor: 'color-mix(in srgb, var(--vuno-danger) 30%, transparent)',
        background: 'color-mix(in srgb, var(--vuno-danger) 6%, transparent)',
      }}
    >
      <p className="text-[13px] text-[var(--vuno-danger)]">{error}</p>
      <button
        onClick={onRetry}
        className="text-[13px] font-semibold text-[var(--vuno-danger)] underline whitespace-nowrap"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
