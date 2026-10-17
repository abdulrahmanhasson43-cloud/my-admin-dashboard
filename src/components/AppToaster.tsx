import { Toaster } from 'sonner';

/**
 * AppToaster — the one place toasts are drawn.
 *
 * The app calls `toast.success/error(...)` from dozens of places (POS change,
 * barcode scan, backup restore, low-stock …), but nothing ever rendered the
 * container, so none of those messages were visible. This mounts it once.
 *
 * Colours come from the --vuno-* tokens (so dark mode follows automatically);
 * the shadcn wrapper in components/ui/sonner.tsx is not used because its
 * variables are bare HSL triples that are not valid colours here.
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      dir="rtl"
      toastOptions={{
        style: {
          background: 'var(--vuno-surface)',
          color: 'var(--vuno-text)',
          border: '1px solid var(--vuno-border)',
          fontFamily: "'Cairo', 'Inter', sans-serif",
        },
      }}
    />
  );
}
