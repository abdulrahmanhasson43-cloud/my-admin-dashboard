import type { WalletRepository } from '../application/ports';
import { EMPTY_WALLET, type WalletState } from '../domain/entities';

const KEY = 'madar.wallet.v2';
const DAY = 86_400_000;

/** الطالب التجريبي يبدأ برصيد واشتراكين فعّالين ليرى الصفحات بحالة حقيقية. */
const demoState = (): WalletState => {
  const now = Date.now();
  const iso = (t: number) => new Date(t).toISOString();
  return {
    balance: 300,
    transactions: [
      { id: 'tx-demo-2', type: 'purchase', amount: 150, description: 'الشرح الكامل — الصف الأول الإعدادي — الترم الأول', at: iso(now - 9 * DAY) },
      { id: 'tx-demo-1', type: 'topup', amount: 450, description: 'شحن المحفظة', at: iso(now - 10 * DAY) },
    ],
    enrollments: [
      { id: 'en-demo-1', courseId: 'prep-1-full', termId: 'tm-1', startsAt: iso(now - 9 * DAY), endsAt: iso(now + 111 * DAY) },
    ],
  };
};

export class LocalStorageWalletRepository implements WalletRepository {
  load(userKey: string): WalletState {
    try {
      const raw = localStorage.getItem(`${KEY}.${userKey}`);
      if (raw) return JSON.parse(raw) as WalletState;
    } catch { /* نرجع للحالة الافتراضية */ }
    return userKey === 'student@madar.app' ? demoState() : EMPTY_WALLET;
  }
  save(userKey: string, state: WalletState): void {
    try { localStorage.setItem(`${KEY}.${userKey}`, JSON.stringify(state)); } catch { /* التخزين ممتلئ */ }
  }
}
