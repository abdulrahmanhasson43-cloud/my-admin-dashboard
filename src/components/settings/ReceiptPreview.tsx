import { ThermalReceipt } from '@/components/ThermalReceipt';
import { receiptPreviewInvoice } from '@/constants/receiptPreview';
import type { ReceiptSettings } from '@/lib/receipt';

/** معاينة مباشرة — يظهر على الديسكتوب (على الجانب) وعلى الموبايل (تحت). */
export default function ReceiptPreview({ settings }: { settings: ReceiptSettings }) {
  return (
    <div className="lg:sticky lg:top-6">
      <p className="text-[13px] font-medium text-[var(--vuno-text-muted)] mb-2 text-center">معاينة مباشرة</p>
      <div className="rounded-[6px] overflow-hidden inline-block mx-auto lg:mx-0" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <ThermalReceipt invoice={receiptPreviewInvoice} settings={settings} />
      </div>
    </div>
  );
}
