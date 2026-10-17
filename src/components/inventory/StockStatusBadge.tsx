/** Small "منخفض / متوفر" pill. The caller adds the padding through `className`. */
export default function StockStatusBadge({ isLow, className = '' }: { isLow: boolean; className?: string }) {
  return (
    <span className={`rounded-lg text-xs font-medium ${isLow ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'} ${className}`}>
      {isLow ? 'منخفض' : 'متوفر'}
    </span>
  );
}
