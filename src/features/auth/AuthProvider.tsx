import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'student' | 'teacher' | 'admin';

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthState {
  user: SessionUser | null;
  login: (email: string, password: string, role: Role) => { ok: boolean; error?: string };
  logout: () => void;
  progress: Record<string, number>;
  completedLessons: string[];
  saved: string[];
  toggleSave: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string, total: number) => void;
}

const AuthContext = createContext<AuthState | null>(null);

const USERS_KEY = 'madar.session';
const PROGRESS_KEY = 'madar.progress';
const LESSONS_KEY = 'madar.lessons';
const SAVED_KEY = 'madar.saved';

/** حسابات تجريبية — في الإنتاج تُستبدل بمصادقة خادم (JWT + HttpOnly cookies). */
const DEMO_ACCOUNTS: Record<string, { password: string; name: string; role: Role }> = {
  'student@madar.app': { password: '123456', name: 'مريم حسن', role: 'student' },
  'teacher@madar.app': { password: '123456', name: 'سارة العتيبي', role: 'teacher' },
  'admin@madar.app': { password: '123456', name: 'إدارة مدار', role: 'admin' },
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(() => read<SessionUser | null>(USERS_KEY, null));
  const [progress, setProgress] = useState<Record<string, number>>(() => read(PROGRESS_KEY, {}));
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => read(LESSONS_KEY, []));
  const [saved, setSaved] = useState<string[]>(() => read(SAVED_KEY, []));

  useEffect(() => {
    if (user) localStorage.setItem(USERS_KEY, JSON.stringify(user));
    else localStorage.removeItem(USERS_KEY);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  const login: AuthState['login'] = (email, password, role) => {
    const account = DEMO_ACCOUNTS[email.trim().toLowerCase()];
    if (!account) return { ok: false, error: 'لا يوجد حساب بهذا البريد الإلكتروني.' };
    if (account.password !== password) return { ok: false, error: 'كلمة المرور غير صحيحة. حاول مرة أخرى.' };
    if (account.role !== role) {
      return {
        ok: false,
        error:
          role === 'student'
            ? 'هذا الحساب مسجّل كمدرّس. اختر «مدرّس» من الأعلى ثم أعد المحاولة.'
            : 'هذا الحساب مسجّل كطالب. اختر «طالب» من الأعلى ثم أعد المحاولة.',
      };
    }
    setUser({ name: account.name, email: email.trim().toLowerCase(), role: account.role });
    return { ok: true };
  };

  const logout = () => setUser(null);

  const toggleSave = (courseId: string) =>
    setSaved((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]));

  const completeLesson = (courseId: string, lessonId: string, total: number) => {
    setCompletedLessons((prev) => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      const done = next.filter((id) => id.startsWith(`${courseId}-`)).length;
      const pct = Math.min(100, Math.round((done / Math.max(1, total)) * 100));
      setProgress((p) => ({ ...p, [courseId]: pct }));
      return next;
    });
  };

  const value = useMemo(
    () => ({ user, login, logout, progress, completedLessons, saved, toggleSave, completeLesson }),
    [user, progress, completedLessons, saved]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
