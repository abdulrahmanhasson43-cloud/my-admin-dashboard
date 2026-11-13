import type { WalletState } from '../domain/entities';

/** منفذ التخزين: اليوم localStorage، وغداً قاعدة بيانات مع Paymob/أكواد الشحن. المفتاح هو هوية المستخدم. */
export interface WalletRepository {
  load(userKey: string): WalletState;
  save(userKey: string, state: WalletState): void;
}
