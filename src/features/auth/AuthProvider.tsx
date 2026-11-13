import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { COURSES } from '../../data/catalog';
import { courseProgress } from '../../modules/curriculum/domain/rules';
import { curriculumRepository } from '../../modules/curriculum/infrastructure/container';
import { siteRepository } from '../../modules/site/infrastructure/container';
import { OWNER_EMAIL, SHOW_ROLE_PICKER } from '../../shared/lib/config';

/** student=طالب، teacher=مدرّس، assistant=مشرف (مساعد المدرّس)، support=فريق الدعم، admin=السوبر أدمن (المالك فقط). */
export type Role = 'student' | 'teacher' | 'assistant' | 'support' | 'admin';
export type StaffRole = 'teacher' | 'assistant' | 'support';

/** أين يذهب كل دور بعد الدخول. */
export const portalOf = (role: Role) => (role === 'student' ? '/' : role === 'admin' ? '/owner' : role === 'support' ? '/support' : '/teacher');

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  /** السنة والترم للطالب: تُحدَّد عند التسجيل ولا يغيّرها إلا فريق الدعم. */
  gradeId?: string;
  termId?: string;
  /** للمشرف: اسم المدرّس الذي يساعده. */
  teacherName?: string;
}

interface Result { ok: boolean; error?: string }
export interface StaffAccount { email: string; name: string; role: StaffRole; builtIn?: boolean }

interface AuthState {
  user: SessionUser | null;
  /** `role` يُستخدم فقط ما دام اختيار نوع الحساب ظاهراً (للتجربة). في الوضع النهائي يُتجاهل. */
  login: (email: string, password: string, role?: Role) => Result;
  register: (input: { name: string; email: string; password: string; gradeId: string; termId?: string }) => Result;
  /** يضبط السنة والترم لأول مرة فقط (أو لو السنة القديمة لم تعد موجودة). بعدها التعديل عبر الدعم. */
  setGrade: (gradeId: string, termId?: string) => string | null;
  /** للدعم والمالك فقط: تنفيذ طلب تعديل السنة/الترم لطالب. */
  applyProfileChange: (studentEmail: string, patch: { gradeId?: string; termId?: string }) => string | null;
  /** للمالك فقط: إدارة حسابات الفريق (مدرّس، مشرف، دعم). */
  listStaff: () => StaffAccount[];
  createStaff: (input: { name: string; email: string; password: string; role: StaffRole }) => string | null;
  removeStaff: (email: string) => string | null;
  logout: () => void;
  progress: Record<string, number>;
  completedLessons: string[];
  saved: string[];
  toggleSave: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string, total?: number) => void;
}

const AuthContext = createContext<AuthState | null>(null);

const SESSION_KEY = 'madar.session';
const USERS_KEY = 'madar.users';
const STAFF_KEY = 'madar.staff';
const PROFILES_KEY = 'madar.profiles';
const LESSONS_KEY = 'madar.lessons.v3';
const SAVED_KEY = 'madar.saved';

interface Account { password: string; name: string; role: Role; gradeId?: string; termId?: string; teacherName?: string }

/** حسابات تجريبية — في الإنتاج تُستبدل بمصادقة خادم. كلمات المرور هنا للتجربة فقط. */
const teacherName = () => siteRepository.load().teacher.name;
const builtIn = (): Record<string, Account> => ({
  'student@madar.app': { password: '123456', name: 'مريم حسن', role: 'student', gradeId: 'prep-1', termId: 'tm-1' },
  'teacher@madar.app': { password: '123456', name: teacherName(), role: 'teacher' },
  'assistant@madar.app': { password: '123456', name: 'هالة سليم', role: 'assistant', teacherName: teacherName() },
  'support@madar.app': { password: '123456', name: 'فريق الدعم', role: 'support' },
  [OWNER_EMAIL]: { password: '123456', name: 'مالك المنصة', role: 'admin' },
});

const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* التخزين ممتلئ */ } };

type StoredStudents = Record<string, { password: string; name: string; gradeId: string; termId?: string }>;
type StoredStaff = Record<string, { password: string; name: string; role: StaffRole; teacherName?: string }>;
type Profiles = Record<string, { gradeId?: string; termId?: string }>;

/** يبحث عن الحساب. دور admin لا يُمنح إلا لإيميل المالك، مهما كان المخزَّن. */
const findAccount = (email: string): Account | undefined => {
  const key = email.trim().toLowerCase();
  const b = builtIn()[key];
  if (b) return b.role === 'admin' && key !== OWNER_EMAIL ? undefined : b;
  const staff = read<StoredStaff>(STAFF_KEY, {})[key];
  if (staff && staff.role !== ('admin' as string)) return { ...staff, role: staff.role };
  const st = read<StoredStudents>(USERS_KEY, {})[key];
  if (st) return { ...st, role: 'student' };
  return undefined;
};

/** يبني المستخدم الحالي من الحساب (لا من محتوى الجلسة المخزَّنة)، مع تعديلات الدعم على السنة/الترم. */
const buildUser = (email: string): SessionUser | null => {
  const acc = findAccount(email);
  if (!acc) return null;
  const key = email.trim().toLowerCase();
  const over = read<Profiles>(PROFILES_KEY, {})[key] ?? {};
  return { name: acc.name, email: key, role: acc.role, gradeId: over.gradeId ?? acc.gradeId, termId: over.termId ?? acc.termId, teacherName: acc.teacherName };
};

const demoLessons = (): string[] => {
  const ids = (courseId: string, unit: number, count?: number) =>
    (COURSES.find((c) => c.id === courseId)?.curriculum[unit]?.lessons ?? []).slice(0, count).map((l) => l.id);
  return [...ids('prep-1-full', 0), ...ids('prep-1-full', 1, 2)];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(() => { const s = read<{ email?: string } | null>(SESSION_KEY, null); return s?.email ?? null; });
  const [tick, setTick] = useState(0);
  const [lessonsByUser, setLessonsByUser] = useState<Record<string, string[]>>(() => read(LESSONS_KEY, {}));
  const [saved, setSaved] = useState<string[]>(() => read(SAVED_KEY, []));

  const user = useMemo(() => (email ? buildUser(email) : null), [email, tick]);

  // جلسة غير صالحة (حساب محذوف أو دور غير مسموح) تُلغى تلقائياً.
  useEffect(() => { if (email && !user) setEmail(null); }, [email, user]);
  useEffect(() => { if (user) write(SESSION_KEY, { email: user.email }); else localStorage.removeItem(SESSION_KEY); }, [user]);
  useEffect(() => { write(LESSONS_KEY, lessonsByUser); }, [lessonsByUser]);
  useEffect(() => { write(SAVED_KEY, saved); }, [saved]);
  // تعديلات الدعم من تبويب آخر تظهر للطالب مباشرة.
  useEffect(() => { const on = (e: StorageEvent) => { if (e.key === PROFILES_KEY || e.key === USERS_KEY || e.key === STAFF_KEY) setTick((t) => t + 1); }; window.addEventListener('storage', on); return () => window.removeEventListener('storage', on); }, []);

  const completedLessons = useMemo(() => (user ? lessonsByUser[user.email] ?? (user.email === 'student@madar.app' ? demoLessons() : []) : []), [user, lessonsByUser]);
  const progress = useMemo(() => {
    const done = new Set(completedLessons);
    const out: Record<string, number> = {};
    for (const c of COURSES) { const p = courseProgress(c, done); if (p > 0) out[c.id] = p; }
    return out;
  }, [completedLessons]);

  const login: AuthState['login'] = (em, password, role) => {
    const acc = findAccount(em);
    if (!acc || acc.password !== password) return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    if (SHOW_ROLE_PICKER && role && acc.role !== role) return { ok: false, error: 'نوع الحساب المختار لا يطابق هذا الحساب. اختر النوع الصحيح من الأعلى ثم أعد المحاولة.' };
    setEmail(em.trim().toLowerCase());
    return { ok: true };
  };

  const register: AuthState['register'] = ({ name, email: em, password, gradeId, termId }) => {
    const key = em.trim().toLowerCase();
    const cfg = curriculumRepository.load();
    if (!name.trim()) return { ok: false, error: 'اكتب اسمك الكامل.' };
    if (!/^\S+@\S+\.\S+$/.test(key)) return { ok: false, error: 'اكتب بريداً إلكترونياً صحيحاً.' };
    if (password.length < 6) return { ok: false, error: 'كلمة المرور ٦ أحرف على الأقل.' };
    if (!cfg.grades.some((g) => g.id === gradeId)) return { ok: false, error: 'اختر سنتك الدراسية.' };
    if (cfg.termsEnabled && !cfg.terms.some((t) => t.id === termId)) return { ok: false, error: 'اختر الترم.' };
    if (findAccount(key)) return { ok: false, error: 'هذا البريد مسجّل بالفعل. سجّل دخولك بدلاً من ذلك.' };
    // التسجيل الذاتي ينشئ حساب طالب فقط؛ الأدوار الأخرى يمنحها المالك من لوحته.
    write(USERS_KEY, { ...read<StoredStudents>(USERS_KEY, {}), [key]: { password, name: name.trim(), gradeId, termId: cfg.termsEnabled ? termId : undefined } });
    setEmail(key); setTick((t) => t + 1);
    return { ok: true };
  };

  const setGrade: AuthState['setGrade'] = (gradeId, termId) => {
    if (!user || user.role !== 'student') return 'هذه الميزة للطلاب فقط.';
    const cfg = curriculumRepository.load();
    const current = cfg.grades.some((g) => g.id === user.gradeId);
    if (current) return 'لا يمكن تغيير السنة الدراسية أو الترم بنفسك. أرسل طلباً لفريق الدعم.';
    if (!cfg.grades.some((g) => g.id === gradeId)) return 'اختر سنة دراسية صحيحة.';
    write(PROFILES_KEY, { ...read<Profiles>(PROFILES_KEY, {}), [user.email]: { gradeId, termId } });
    setTick((t) => t + 1);
    return null;
  };

  const applyProfileChange: AuthState['applyProfileChange'] = (studentEmail, patch) => {
    if (!user || (user.role !== 'support' && user.role !== 'admin')) return 'هذا الإجراء لفريق الدعم والمالك فقط.';
    const acc = findAccount(studentEmail);
    if (!acc || acc.role !== 'student') return 'لا يوجد طالب بهذا البريد.';
    const key = studentEmail.trim().toLowerCase();
    write(PROFILES_KEY, { ...read<Profiles>(PROFILES_KEY, {}), [key]: { ...read<Profiles>(PROFILES_KEY, {})[key], ...patch } });
    setTick((t) => t + 1);
    return null;
  };

  const ownerOnly = () => !user || user.role !== 'admin' || user.email !== OWNER_EMAIL;
  const listStaff: AuthState['listStaff'] = () => {
    if (ownerOnly()) return [];
    const b = Object.entries(builtIn()).filter(([, a]) => a.role === 'teacher' || a.role === 'assistant' || a.role === 'support').map(([e, a]) => ({ email: e, name: a.name, role: a.role as StaffRole, builtIn: true }));
    const s = Object.entries(read<StoredStaff>(STAFF_KEY, {})).map(([e, a]) => ({ email: e, name: a.name, role: a.role }));
    return [...b, ...s];
  };
  const createStaff: AuthState['createStaff'] = ({ name, email: em, password, role }) => {
    if (ownerOnly()) return 'إنشاء حسابات الفريق للمالك فقط.';
    const key = em.trim().toLowerCase();
    if (!['teacher', 'assistant', 'support'].includes(role)) return 'نوع الحساب غير مسموح.';
    if (!name.trim()) return 'اكتب اسم العضو.';
    if (!/^\S+@\S+\.\S+$/.test(key)) return 'اكتب بريداً إلكترونياً صحيحاً.';
    if (password.length < 8) return 'كلمة المرور ٨ أحرف على الأقل.';
    if (findAccount(key)) return 'هذا البريد مسجّل بالفعل.';
    write(STAFF_KEY, { ...read<StoredStaff>(STAFF_KEY, {}), [key]: { password, name: name.trim(), role, teacherName: role === 'assistant' ? teacherName() : undefined } });
    setTick((t) => t + 1);
    return null;
  };
  const removeStaff: AuthState['removeStaff'] = (em) => {
    if (ownerOnly()) return 'حذف حسابات الفريق للمالك فقط.';
    const key = em.trim().toLowerCase();
    const all = read<StoredStaff>(STAFF_KEY, {});
    if (!all[key]) return 'لا يمكن حذف هذا الحساب (تجريبي أو غير موجود).';
    delete all[key]; write(STAFF_KEY, all); setTick((t) => t + 1);
    return null;
  };

  const logout = () => setEmail(null);
  const toggleSave = (courseId: string) => setSaved((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));
  const completeLesson: AuthState['completeLesson'] = (_c, lessonId) => {
    if (!user) return;
    setLessonsByUser((prev) => {
      const cur = prev[user.email] ?? (user.email === 'student@madar.app' ? demoLessons() : []);
      return cur.includes(lessonId) ? prev : { ...prev, [user.email]: [...cur, lessonId] };
    });
  };

  const value = useMemo(
    () => ({ user, login, register, setGrade, applyProfileChange, listStaff, createStaff, removeStaff, logout, progress, completedLessons, saved, toggleSave, completeLesson }),
    [user, progress, completedLessons, saved]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
