import {
  CashIcon, CardIcon, WalletIcon, InstaPayIcon, ApplePayIcon,
} from '@/components/icons';
import type { ComponentType } from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Resolve a payment-method id to its icon component.
 * Falls back to WalletIcon for unknown ids.
 */
export function getPaymentIcon(id: string): ComponentType<IconProps> {
  switch (id) {
    case 'cash':
      return CashIcon;
    case 'card':
      return CardIcon;
    case 'wallet':
      return WalletIcon;
    case 'instapay':
      return InstaPayIcon;
    case 'applepay':
      return ApplePayIcon;
    default:
      return WalletIcon;
  }
}
