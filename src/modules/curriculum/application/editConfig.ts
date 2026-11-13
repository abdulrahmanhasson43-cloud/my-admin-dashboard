import type { CurriculumConfig, Label, LabelKey } from '../domain/entities';
import { DEFAULT_LABELS } from '../domain/defaults';

import type { Result } from '../../../core/result';
export type { Result };
export type ListKind = 'stages' | 'grades' | 'subjects' | 'terms';
/** عدّاد الاستخدام: كم عنصراً (كورسات/وحدات) يعتمد على هذا المعرّف؟ يُحقن من الخارج. */
export type UsageCounter = (kind: ListKind, id: string) => number;

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const PREFIX: Record<ListKind, string> = { stages: 'st', grades: 'gr', subjects: 'sb', terms: 'tm' };
const NOUN: Record<ListKind, string> = { stages: 'المرحلة', grades: 'الصف', subjects: 'المادة', terms: 'الترم' };
const clean = (s: string) => s.trim().replace(/\s+/g, ' ');

type Item = { id: string; name: string; stageId?: string };
const groupOf = (kind: ListKind, it: Item) => (kind === 'grades' || kind === 'subjects' ? it.stageId : 'all');

export const addItem = (c: CurriculumConfig, kind: ListKind, name: string, stageId?: string): Result<CurriculumConfig> => {
  const n = clean(name);
  if (!n) return { ok: false, error: `اكتب اسم ${NOUN[kind]} أولاً.` };
  if ((kind === 'grades' || kind === 'subjects') && !stageId) return { ok: false, error: 'اختر المرحلة أولاً.' };
  const list = c[kind] as Item[];
  if (list.some((x) => groupOf(kind, x) === (stageId ?? 'all') && x.name === n)) return { ok: false, error: `يوجد ${NOUN[kind]} بنفس الاسم.` };
  const item = kind === 'grades' || kind === 'subjects' ? { id: uid(PREFIX[kind]), name: n, stageId } : { id: uid(PREFIX[kind]), name: n };
  return { ok: true, value: { ...c, [kind]: [...list, item] } };
};

export const renameItem = (c: CurriculumConfig, kind: ListKind, id: string, name: string): Result<CurriculumConfig> => {
  const n = clean(name);
  if (!n) return { ok: false, error: 'الاسم لا يمكن أن يكون فارغاً.' };
  const list = c[kind] as Item[];
  const me = list.find((x) => x.id === id);
  if (!me) return { ok: false, error: 'العنصر غير موجود.' };
  if (list.some((x) => x.id !== id && groupOf(kind, x) === groupOf(kind, me) && x.name === n)) return { ok: false, error: `يوجد ${NOUN[kind]} بنفس الاسم.` };
  return { ok: true, value: { ...c, [kind]: list.map((x) => (x.id === id ? { ...x, name: n } : x)) } };
};

export const removeItem = (c: CurriculumConfig, kind: ListKind, id: string, usage: UsageCounter): Result<CurriculumConfig> => {
  if (kind === 'stages' && (c.grades.some((g) => g.stageId === id) || c.subjects.some((s) => s.stageId === id)))
    return { ok: false, error: 'احذف صفوف ومواد هذه المرحلة أولاً.' };
  const used = usage(kind, id);
  if (used > 0) return { ok: false, error: `لا يمكن الحذف: مستخدم في ${used.toLocaleString('ar-EG')} من الكورسات أو الوحدات.` };
  return { ok: true, value: { ...c, [kind]: (c[kind] as Item[]).filter((x) => x.id !== id) } };
};

/** تحريك عنصر خطوة لأعلى/لأسفل داخل مجموعته (نفس المرحلة مثلاً). */
export const moveItem = (c: CurriculumConfig, kind: ListKind, id: string, dir: -1 | 1): CurriculumConfig => {
  const list = [...(c[kind] as Item[])];
  const from = list.findIndex((x) => x.id === id);
  if (from < 0) return c;
  const grp = groupOf(kind, list[from]);
  let to = from + dir;
  while (to >= 0 && to < list.length && groupOf(kind, list[to]) !== grp) to += dir;
  if (to < 0 || to >= list.length) return c;
  [list[from], list[to]] = [list[to], list[from]];
  return { ...c, [kind]: list };
};

export const setLabel = (c: CurriculumConfig, key: LabelKey, label: Label): Result<CurriculumConfig> => {
  const one = clean(label.one), many = clean(label.many);
  if (!one || !many) return { ok: false, error: 'اكتب المفرد والجمع.' };
  return { ok: true, value: { ...c, labels: { ...c.labels, [key]: { one, many } } } };
};

export const resetLabels = (c: CurriculumConfig): CurriculumConfig => ({ ...c, labels: { ...DEFAULT_LABELS } });
export const setTermsEnabled = (c: CurriculumConfig, on: boolean): CurriculumConfig => ({ ...c, termsEnabled: on });
