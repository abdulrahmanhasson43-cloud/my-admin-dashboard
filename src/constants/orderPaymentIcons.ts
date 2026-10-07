import { CashIcon, CardIcon, WalletIcon, InstaPayIcon } from '@/components/icons';
import type { OrderPaymentMethod } from '@/types/order';

/* Static map from payment method → icon component. Declared as a plain
   lookup object (not a function call) so React Compiler's purity rule
   does not flag "creating a component during render" when a card reads
   its icon via ORDER_PAYMENT_ICONS[method]. */
export const ORDER_PAYMENT_ICONS: Record<OrderPaymentMethod, typeof CashIcon> = {
  cash: CashIcon,
  card: CardIcon,
  wallet: WalletIcon,
  instapay: InstaPayIcon,
};
