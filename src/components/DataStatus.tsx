interface DataStatusProps {
  /** The message of the last failed read or change, or null. */
  error: string | null;
  isLoading: boolean;
  /** True while there is nothing to show yet — "loading…" appears only then, never over a list that is already on screen. */
  isEmpty: boolean;
  /** Reads the data again; the button beside the error calls it. */
  onRetry: () => Promise<unknown>;
  /** Adds the top margin the Orders and Returns pages use. The Invoice page does not, because its parent spaces its children. */
  spaced?: boolean;
}

/**
 * مؤشّر الخطأ والتحميل — يعرض أي فشل في القراءة أو المعالجة بدلاً من ابتلاعه صامتاً.
 * كان نفس الشريط منسوخاً في صفحات الطلبات والمرتجعات والفواتير.
 */
export default function DataStatus({ error, isLoading, isEmpty, onRetry, spaced = false }: DataStatusProps) {
  const margin = spaced ? ' mt-5' : '';
  return (
    <>
      {error && (
        <div
          className={`flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3${margin}`}
          style={{
            borderColor: 'color-mix(in srgb, var(--vuno-danger) 30%, transparent)',
            background: 'color-mix(in srgb, var(--vuno-danger) 6%, transparent)',
          }}
        >
          <p className="text-[13px] text-[var(--vuno-danger)]">{error}</p>
          <button
            onClick={() => { onRetry().catch(() => {}); }}
            className="text-[13px] font-semibold text-[var(--vuno-danger)] underline whitespace-nowrap"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      {isLoading && isEmpty && (
        <p className={`text-[13px] text-[var(--vuno-text-secondary)]${margin}`}>جارٍ التحميل…</p>
      )}
    </>
  );
}
