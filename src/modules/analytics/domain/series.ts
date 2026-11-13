export interface Point { date: string; value: number }

export interface Summary { total: number; previous: number; deltaPct: number }

/** إجمالي آخر `days` يوماً مقارنةً بالفترة السابقة لها مباشرة. تحتاج السلسلة 2×days نقطة على الأقل. */
export const summarize = (series: Point[], days: number): Summary => {
  const cur = series.slice(-days).reduce((n, p) => n + p.value, 0);
  const prev = series.slice(-days * 2, -days).reduce((n, p) => n + p.value, 0);
  const deltaPct = prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100);
  return { total: cur, previous: prev, deltaPct };
};

export const lastDays = (series: Point[], days: number): Point[] => series.slice(-days);
