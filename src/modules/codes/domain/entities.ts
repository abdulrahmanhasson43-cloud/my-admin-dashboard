/** كود اشتراك يولّده المدرّس لكورس ولمدة، ويفعّله الطالب مرة واحدة. لا يُخزَّن الكود الخام أبداً، بل بصمته فقط. */
export interface AccessCode {
  id: string;
  /** آخر ٤ أحرف فقط، لتمييز الكود في القائمة. */
  hint: string;
  hash: string;
  courseId: string;
  days: number;
  batchId: string;
  createdBy: string;
  createdAt: string;
  redeemedBy?: string;
  redeemedAt?: string;
}

/** أحرف بلا تشابه (لا 0/O ولا 1/I/L) كي لا يخطئ الطالب في الكتابة. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 12;
export const DURATIONS = [30, 90, 120, 365] as const;
export const MAX_BATCH = 50;

export const normalizeCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
export const formatCode = (raw: string) => raw.match(/.{1,4}/g)?.join('-') ?? raw;
