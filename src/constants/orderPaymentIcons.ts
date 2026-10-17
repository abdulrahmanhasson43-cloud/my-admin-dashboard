import { CashIcon, CardIcon, WalletIcon, InstaPayIcon } from '@/components/icons';
import type { OrderPaymentMethod } from '@/types/order';

/**
 * The icon of each order payment method.
 *
 * It is a plain lookup object (not a function call) on purpose: React Compiler's purity rule
 * flags "creating a component during render" when a card gets its icon from a function, but
 * not when it reads `orderPaymentIcons[method]`.
 */
export const orderPaymentIcons: Record<OrderPaymentMethod, typeof CashIcon> = {
  cash: CashIcon,
  card: CardIcon,
  wallet: WalletIcon,
  instapay: InstaPayIcon,
};
