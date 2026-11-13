export const num = (v: number) => v.toLocaleString('ar-EG');
export const egp = (v: number) => `${v.toLocaleString('ar-EG')} ج.م`;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
