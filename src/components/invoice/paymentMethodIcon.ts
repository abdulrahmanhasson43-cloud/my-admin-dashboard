import { CashIcon, CardIcon, WalletIcon, InstaPayIcon, ApplePayIcon } from '@/components/icons';

/** The icon for an invoice payment-method label (cash for anything unknown). */
export function getMethodIcon(method: string) {
  switch (method) {
    case 'كاش': return CashIcon;
    case 'بطاقة': return CardIcon;
    case 'محفظة': return WalletIcon;
    case 'إنستاباي': return InstaPayIcon;
    case 'Apple Pay': return ApplePayIcon;
    default: return CashIcon;
  }
}
