import { AlertTriangleIcon } from '@/components/icons';

interface ErrorFallbackProps {
  onRetry: () => void;
}

/** ErrorFallback — what the user sees when a screen crashes (flat, no heavy card). */
export default function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center text-center py-20 px-6">
      <AlertTriangleIcon size={40} className="text-[var(--vuno-text-muted)] mb-4" />
      <h2 className="text-lg font-bold text-[var(--vuno-text)] mb-1">حدث خطأ غير متوقع</h2>
      <p className="text-sm text-[var(--vuno-text-muted)] mb-6 max-w-sm">
        تعذّر عرض هذه الشاشة. حاول مرة أخرى، وإن استمرت المشكلة فحدّث الصفحة.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--vuno-primary)] text-white hover:bg-[var(--vuno-primary-light)] transition-colors"
        >
          حاول مرة أخرى
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[var(--vuno-border)] text-[var(--vuno-text)] hover:bg-gray-50 transition-colors"
        >
          تحديث الصفحة
        </button>
      </div>
    </div>
  );
}
