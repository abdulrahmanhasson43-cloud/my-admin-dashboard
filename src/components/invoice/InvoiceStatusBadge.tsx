import { invoiceStatusConfig } from '@/constants/invoice';

/** Small coloured pill with the invoice status. Unknown statuses show as "pending". */
export default function InvoiceStatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const { label, badgeClass } = invoiceStatusConfig[status] ?? invoiceStatusConfig.pending;
  return <span className={`rounded-lg text-xs font-medium ${badgeClass} ${className}`}>{label}</span>;
}
