import type { ReceiptSettings } from '@/lib/receipt';

/** The receipt settings that are plain on/off switches. */
export type ReceiptSwitchKey = {
  [K in keyof ReceiptSettings]: ReceiptSettings[K] extends boolean ? K : never;
}[keyof ReceiptSettings];

/** The receipt settings that are typed text (the logo address has its own field: it only shows while the logo is on). */
export type ReceiptTextKey = 'storeName' | 'storePhone' | 'storeAddress' | 'taxNumber' | 'footerText';

/** "ما يظهر على الإيصال": one switch per thing the receipt can show, in the order they are listed. */
export const receiptSwitches: ReadonlyArray<{ key: ReceiptSwitchKey; label: string; hint?: string }> = [
  { key: 'showStoreName', label: 'اسم المتجر' },
  { key: 'showLogo', label: 'شعار المتجر', hint: 'أضف رابط صورة الشعار' },
  { key: 'showPhone', label: 'رقم الهاتف' },
  { key: 'showAddress', label: 'العنوان' },
  { key: 'showTaxNumber', label: 'الرقم الضريبي' },
  { key: 'showFooter', label: 'التذييل' },
  { key: 'showQR', label: 'رمز QR للتحقق', hint: 'يمسحه العميل للتحقق من الفاتورة' },
];

/** "بيانات المتجر على الإيصال": the texts printed on the receipt, in the order they are listed. */
export const receiptTextFields: ReadonlyArray<{ key: ReceiptTextKey; label: string }> = [
  { key: 'storeName', label: 'اسم المتجر' },
  { key: 'storePhone', label: 'رقم الهاتف' },
  { key: 'storeAddress', label: 'العنوان' },
  { key: 'taxNumber', label: 'الرقم الضريبي' },
  { key: 'footerText', label: 'نص التذييل' },
];
