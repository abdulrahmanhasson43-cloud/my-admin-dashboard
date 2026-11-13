import type { Result } from '../../../core/result';
import { CODE_ALPHABET, CODE_LENGTH, DURATIONS, MAX_BATCH, formatCode, normalizeCode, type AccessCode } from '../domain/entities';

export type Hasher = (text: string) => Promise<string>;
export type RandomBytes = (n: number) => Uint8Array;

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export interface GenerateSpec { courseId: string; days: number; count: number; createdBy: string }

/** يولّد دفعة أكواد: يرجع الأكواد الخام (لتُعرض مرة واحدة) والسجلات المحفوظة (بصمات فقط). */
export const generateCodes = async (spec: GenerateSpec, now: Date, hash: Hasher, random: RandomBytes): Promise<Result<{ raw: string[]; records: AccessCode[] }>> => {
  if (!Number.isInteger(spec.count) || spec.count < 1 || spec.count > MAX_BATCH) return { ok: false, error: `العدد من ١ إلى ${MAX_BATCH.toLocaleString('ar-EG')}.` };
  if (!(DURATIONS as readonly number[]).includes(spec.days)) return { ok: false, error: 'مدة غير مدعومة.' };
  const batchId = uid('bt');
  const raw: string[] = [];
  const records: AccessCode[] = [];
  for (let i = 0; i < spec.count; i++) {
    const bytes = random(CODE_LENGTH);
    const code = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
    raw.push(formatCode(code));
    records.push({ id: uid('cd'), hint: code.slice(-4), hash: await hash(code), courseId: spec.courseId, days: spec.days, batchId, createdBy: spec.createdBy, createdAt: now.toISOString() });
  }
  return { ok: true, value: { raw, records } };
};

/** يتحقق من كود مُدخل ويعلّمه مستخدماً. الرسالة موحّدة لغير الصحيح والمستخدم كي لا تُكشف معلومات. */
export const redeemCode = async (all: AccessCode[], input: string, userKey: string, now: Date, hash: Hasher): Promise<Result<{ all: AccessCode[]; redeemed: AccessCode }>> => {
  const code = normalizeCode(input);
  if (code.length !== CODE_LENGTH) return { ok: false, error: 'اكتب الكود كاملاً (١٢ حرفاً).' };
  const h = await hash(code);
  const found = all.find((c) => c.hash === h && !c.redeemedBy);
  if (!found) return { ok: false, error: 'الكود غير صحيح أو سبق استخدامه.' };
  const redeemed = { ...found, redeemedBy: userKey, redeemedAt: now.toISOString() };
  return { ok: true, value: { all: all.map((c) => (c.id === found.id ? redeemed : c)), redeemed } };
};
