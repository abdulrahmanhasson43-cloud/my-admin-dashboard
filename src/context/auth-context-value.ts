import { createContext, useContext } from 'react';

export interface AuthContextValue {
  /** هل فيه جلسة دخول على الجهاز دلوقتي؟ */
  isSignedIn: boolean;
  /** تسجيل الدخول (بيسجّل الجلسة على الجهاز) */
  signIn: () => void;
  /** تسجيل الخروج (بيمسح الجلسة) */
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
