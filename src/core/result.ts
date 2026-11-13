/** نتيجة عملية قد تفشل بسبب قاعدة عمل (وليس استثناءً برمجياً). */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
