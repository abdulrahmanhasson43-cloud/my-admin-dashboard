import type { StockLevel } from '@/lib/inventory';

/** How each stock level is worded and coloured wherever a product's shelf quantity is shown. */
export const stockLevelMeta: Record<StockLevel, { label: string; color: string }> = {
  out: { label: 'نافد', color: 'var(--vuno-danger)' },
  critical: { label: 'حرج', color: 'var(--vuno-danger)' },
  low: { label: 'منخفض', color: 'var(--vuno-warning)' },
  ok: { label: 'متوفر', color: 'var(--vuno-success)' },
};
