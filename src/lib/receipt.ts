import { toPng } from 'html-to-image';

/**
 * Receipt helpers — settings shape and defaults, and turning a rendered
 * receipt element into an image to share or print. No React: ThermalReceipt.tsx
 * is the component, this file is everything about the receipt that is not.
 */

/**
 * إعدادات الفاتورة الحرارية القابلة للتخصيص.
 * كل حقل يحدد ما إذا كان يظهر على الفاتورة أم لا.
 */
export interface ReceiptSettings {
  /* Paper width in mm — 58mm (narrow) or 80mm (standard thermal). Defaults to 80. */
  paperWidth: 58 | 80;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  logoUrl: string | null;
  taxNumber: string;
  footerText: string;
  showStoreName: boolean;
  showLogo: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showTaxNumber: boolean;
  showFooter: boolean;
  showQR: boolean;
}

export const defaultReceiptSettings: ReceiptSettings = {
  paperWidth: 80,
  storeName: 'متجر Vuno',
  storePhone: '01001234567',
  storeAddress: 'القاهرة، مصر',
  logoUrl: null,
  taxNumber: '123-456-789',
  footerText: 'شكراً لتعاملكم معنا!',
  showStoreName: true,
  showLogo: false,
  showPhone: true,
  showAddress: true,
  showTaxNumber: false,
  showFooter: true,
  showQR: true,
};

/**
 * يحوّل عنصر الفاتورة الحرارية إلى صورة PNG.
 * يعمل على الديسكتوب والموبايل (html-to-image يرسم على canvas).
 */
export async function receiptToImage(element: HTMLElement): Promise<string> {
  return toPng(element, {
    /* pixelRatio 3 still gives a crisp, print-ready output (3x is
       standard "retina" density) without the multi-second main-thread
       freeze that pixelRatio 5 + font-embedding caused on phones —
       that freeze is what made the "مشاركة" button feel like it hung. */
    pixelRatio: 3,
    cacheBust: false,
    backgroundColor: '#ffffff',
    skipFonts: false,
    quality: 1,
  });
}

/**
 * يشارك صورة الفاتورة عبر واتساب أو أي تطبيق مشاركة.
 * - على الموبايل: يستخدم Web Share API (يدعم الملفات) → يفتح واتساب مباشرة.
 * - على الديسكتوب: يحمّل الصورة مباشرة.
 */
export async function shareReceiptImage(
  element: HTMLElement,
  fileName: string = `receipt-${Date.now()}.png`
): Promise<'shared' | 'downloaded'> {
  const dataUrl = await receiptToImage(element);

  // تحويل data URL إلى Blob للمشاركة
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: 'image/png' });

  // Web Share API مع دعم الملفات (موبايل)
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        text: 'إليك فاتورتك من متجر Vuno',
      });
      return 'shared';
    } catch (err) {
      // المستخدم ألغى المشاركة — نحمّل الصورة كبديل
      if ((err as Error).name === 'AbortError') return 'downloaded';
    }
  }

  // بديل: تحميل الصورة مباشرة (ديسكتوب أو متصفحات بدون Web Share)
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return 'downloaded';
}

/**
 * يطبع الفاتورة مباشرة — بيحوّلها لصورة (بنفس جودة زرار المشاركة) وبيفتحها
 * في نافذة طباعة، عشان التنسيق يفضل مطابق 100% للي المستخدم شايفه.
 */
export async function printReceiptImage(element: HTMLElement): Promise<void> {
  const dataUrl = await receiptToImage(element);
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="ltr">
      <head>
        <title>طباعة الفاتورة</title>
        <style>
          @page { margin: 0; }
          html, body { margin: 0; padding: 0; display: flex; justify-content: center; }
          img { width: 100%; max-width: 320px; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="فاتورة" />
      </body>
    </html>
  `);
  printWindow.document.close();

  const img = printWindow.document.querySelector('img');
  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };
  if (img && !img.complete) {
    img.onload = triggerPrint;
  } else {
    triggerPrint();
  }
}
