import type { TopupRequest } from '../domain/topup';

const KEY = 'madar.topups.v1';

/** طلبات الشحن اليدوي في localStorage للتجربة؛ تُستبدل بجدول في قاعدة البيانات. */
export const topupRepository = {
  list(): TopupRequest[] {
    try { const raw = localStorage.getItem(KEY); const v: unknown = raw ? JSON.parse(raw) : []; return Array.isArray(v) ? (v as TopupRequest[]) : []; } catch { return []; }
  },
  save(list: TopupRequest[]): void {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* التخزين ممتلئ */ }
  },
};
