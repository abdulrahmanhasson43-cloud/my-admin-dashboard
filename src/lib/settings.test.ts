import { describe, expect, it } from 'vitest';
import { defaultReceiptSettings } from '@/lib/receipt';
import { VAT_PERCENT } from '@/lib/pricing';
import {
  SAVED_NOTICE_MS,
  defaultInvoiceDraft,
  defaultStoreDraft,
  logoUrlFromInput,
  logoUrlToInput,
  parseLowStockThreshold,
} from './settings';

describe('parseLowStockThreshold', () => {
  const readings: ReadonlyArray<readonly [typed: string, expected: number]> = [
    ['25', 25],
    ['0', 0],
    ['007', 7],
    ['  12 ', 12],
  ];
  for (const [typed, expected] of readings) {
    it(`reads ${JSON.stringify(typed)} as ${expected}`, () => {
      expect(parseLowStockThreshold(typed)).toBe(expected);
    });
  }

  it('never goes below zero', () => {
    expect(parseLowStockThreshold('-5')).toBe(0);
    expect(parseLowStockThreshold('-0.1')).toBe(0);
  });

  it('treats an empty or non-numeric entry as zero', () => {
    expect(parseLowStockThreshold('')).toBe(0);
    expect(parseLowStockThreshold('   ')).toBe(0);
    expect(parseLowStockThreshold('abc')).toBe(0);
  });

  it('keeps a decimal as typed (stock can be counted in fractions, e.g. half a kilo)', () => {
    expect(parseLowStockThreshold('3.7')).toBe(3.7);
  });
});

describe('logo URL <-> input text', () => {
  it('an empty field means "no logo" (null), not an empty string', () => {
    expect(logoUrlFromInput('')).toBeNull();
  });

  it('a typed address is kept exactly as typed', () => {
    expect(logoUrlFromInput('https://example.com/logo.png')).toBe('https://example.com/logo.png');
  });

  it('no logo shows as an empty field, a logo shows as its address', () => {
    expect(logoUrlToInput(null)).toBe('');
    expect(logoUrlToInput('https://example.com/logo.png')).toBe('https://example.com/logo.png');
  });

  it('round-trips', () => {
    for (const url of [null, 'https://a.b/c.png']) expect(logoUrlFromInput(logoUrlToInput(url))).toBe(url);
  });
});

describe('settings drafts', () => {
  it('the store draft starts from the same store details the receipt starts with', () => {
    expect(defaultStoreDraft).toEqual({
      name: defaultReceiptSettings.storeName,
      phone: defaultReceiptSettings.storePhone,
      address: defaultReceiptSettings.storeAddress,
      taxNumber: defaultReceiptSettings.taxNumber,
    });
  });

  it('the invoice draft starts with the VAT rate as text (it is typed into a field)', () => {
    expect(defaultInvoiceDraft.taxRate).toBe(String(VAT_PERCENT));
    expect(typeof defaultInvoiceDraft.taxRate).toBe('string');
  });

  it('the invoice draft starts with the standard prefix and the receipt footer', () => {
    expect(defaultInvoiceDraft.prefix).toBe('INV-2025');
    expect(defaultInvoiceDraft.footer).toBe(defaultReceiptSettings.footerText);
  });

  it('the "saved" notice stays for two seconds', () => {
    expect(SAVED_NOTICE_MS).toBe(2000);
  });
});
