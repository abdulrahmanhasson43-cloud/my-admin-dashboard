import { defaultReceiptSettings } from '@/lib/receipt';
import { VAT_PERCENT } from '@/lib/pricing';

/**
 * Settings-screen rules — plain functions and starting values with no React, so they can be tested on their own.
 * The page (SettingsPage) only wires them to the screen; the pieces are in components/settings/.
 */

/** How long the "تم الحفظ بنجاح" notice stays on screen after a save. */
export const SAVED_NOTICE_MS = 2000;

/** The store form (name, phone, address, tax number) while it is being edited. Everything is text, as typed. */
export interface StoreDraft {
  name: string;
  phone: string;
  address: string;
  taxNumber: string;
}

/** The invoice form while it is being edited. The tax rate is text because it is typed into a field. */
export interface InvoiceDraft {
  prefix: string;
  taxRate: string;
  footer: string;
}

/**
 * Both forms start from what the receipt starts with — they describe the same store.
 * (Neither form is saved anywhere yet: see "الباقي" in the project context.)
 */
export const defaultStoreDraft: StoreDraft = {
  name: defaultReceiptSettings.storeName,
  phone: defaultReceiptSettings.storePhone,
  address: defaultReceiptSettings.storeAddress,
  taxNumber: defaultReceiptSettings.taxNumber,
};

export const defaultInvoiceDraft: InvoiceDraft = {
  prefix: 'INV-2025',
  taxRate: String(VAT_PERCENT),
  footer: defaultReceiptSettings.footerText,
};

/**
 * What the "low stock" field holds, read from what was typed: never negative, and an empty or
 * non-numeric entry counts as zero. A decimal is kept as typed (stock can be counted in fractions).
 */
export function parseLowStockThreshold(typed: string): number {
  return Math.max(0, Number(typed) || 0);
}

/** An empty logo field means "no logo" (null), not an empty address. */
export function logoUrlFromInput(typed: string): string | null {
  return typed || null;
}

/** The text a logo field shows for the stored logo address. */
export function logoUrlToInput(logoUrl: string | null): string {
  return logoUrl || '';
}
