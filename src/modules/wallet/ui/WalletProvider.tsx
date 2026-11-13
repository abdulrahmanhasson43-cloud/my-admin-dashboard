import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Course } from '../../../core/entities';
import { EMPTY_WALLET, ALL_TERMS, type WalletState } from '../domain/entities';
import { canWatchLesson, hasEntitlement, priceFor, accessDaysFor } from '../domain/rules';
import { purchase as purchaseUseCase, topUp as topUpUseCase, grant as grantUseCase, type TopUpOptions } from '../application/walletUseCases';
import { walletRepository } from '../infrastructure/container';
import { useAuth } from '../../../features/auth/AuthProvider';
import { useCurriculum } from '../../curriculum/ui/CurriculumProvider';

interface Ctx {
  wallet: WalletState;
  /** يرجع نص الخطأ أو null عند النجاح. */
  topUp: (amount: number, opts?: TopUpOptions) => string | null;
  purchase: (course: Course, termId: string) => string | null;
  /** تفعيل اشتراك بدون دفع (كود). */
  grantAccess: (course: Course, days: number, description: string) => string | null;
  priceOf: (course: Course, termId: string) => number;
  /** الترم الذي يُباع به الكورس حالياً: معرّف الترم أو 'all' لو الترمات غير مفعّلة. */
  canWatch: (course: Course, unitTermId: string | undefined, lessonFree?: boolean) => boolean;
  hasAccess: (course: Course, termId?: string) => boolean;
}

const WalletContext = createContext<Ctx | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { config } = useCurriculum();
  const key = user?.role === 'student' ? user.email : null;
  const [wallet, setWallet] = useState<WalletState>(EMPTY_WALLET);

  useEffect(() => { setWallet(key ? walletRepository.load(key) : EMPTY_WALLET); }, [key]);

  const termsCount = Math.max(1, config.terms.length);
  const commit = useCallback((next: WalletState) => { setWallet(next); if (key) walletRepository.save(key, next); }, [key]);

  const value = useMemo<Ctx>(() => ({
    wallet,
    topUp: (amount, opts) => {
      if (!key) return 'سجّل دخولك كطالب أولاً.';
      const r = topUpUseCase(wallet, amount, new Date(), opts);
      if (!r.ok) return r.error;
      commit(r.value); return null;
    },
    purchase: (course, termId) => {
      if (!key) return 'سجّل دخولك كطالب أولاً.';
      const termName = termId === ALL_TERMS ? '' : config.terms.find((t) => t.id === termId)?.name ?? '';
      const r = purchaseUseCase(wallet, course, termId, termName, priceFor(course, termId, termsCount), accessDaysFor(course, termId, termsCount), new Date());
      if (!r.ok) return r.error;
      commit(r.value); return null;
    },
    grantAccess: (course, days, description) => {
      if (!key) return 'سجّل دخولك كطالب أولاً.';
      const r = grantUseCase(wallet, course, ALL_TERMS, days, description, new Date());
      if (!r.ok) return r.error;
      commit(r.value); return null;
    },
    priceOf: (course, termId) => priceFor(course, termId, termsCount),
    canWatch: (course, unitTermId, lessonFree) => {
      if (user && user.role !== 'student') return true; // المدرّس والإدارة يرون كل شيء
      return canWatchLesson(wallet.enrollments, course.id, config.termsEnabled ? unitTermId : undefined, lessonFree, new Date());
    },
    hasAccess: (course, termId) => hasEntitlement(wallet.enrollments, course.id, termId, new Date()),
  }), [wallet, key, user, config, termsCount, commit]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};

export { egp } from '../../../shared/lib/format';
