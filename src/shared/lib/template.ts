/** يستبدل {name} و{price} و{year} داخل نص يكتبه المالك. القيم غير الموجودة تُترك كما هي. */
export const fill = (text: string, vars: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
