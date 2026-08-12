import { forwardRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import type { CompletedSale } from '@/types';

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

// eslint-disable-next-line react-refresh/only-export-components
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

interface ThermalReceiptProps {
  invoice: CompletedSale;
  settings?: ReceiptSettings;
}

/**
 * فاتورة حرارية (Thermal Receipt) — تصميم يشبه فاتورة حرارية حقيقية.
 * تُعرض بنمط أحادي اللون، خط monospace، عرض ورقة ضيق (300px).
 *
 * ref يُمرّر إلى العنصر الجذري ليُستخدم في التقاط صورة (html-to-image).
 */
export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ invoice, settings = defaultReceiptSettings }, ref) => {
    const paymentLabel: Record<string, string> = {
      cash: 'كاش',
      card: 'بطاقة',
      wallet: 'محفظة',
      instapay: 'إنستاباي',
      applepay: 'Apple Pay',
    };

    return (
      <div
        ref={ref}
        className="thermal-receipt mx-auto"
        style={{
          width: settings.paperWidth === 58 ? 220 : 300,
          padding: '16px 14px',
          background: '#fff',
          color: '#000',
          fontFamily: "'Courier New', 'Cairo', monospace",
          fontSize: 12,
          lineHeight: 1.6,
        }}
        dir="rtl"
      >
        {/* رأس الفاتورة — اسم المتجر + الشعار */}
        {settings.showStoreName && (
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
            {settings.storeName}
          </div>
        )}

        {settings.showLogo && settings.logoUrl && (
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <img
              src={settings.logoUrl}
              alt="logo"
              style={{ maxWidth: 70, maxHeight: 70, objectFit: 'contain' }}
            />
          </div>
        )}

        {settings.showPhone && (
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            هاتف: {settings.storePhone}
          </div>
        )}

        {settings.showAddress && (
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            {settings.storeAddress}
          </div>
        )}

        {settings.showTaxNumber && (
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            الرقم الضريبي: {settings.taxNumber}
          </div>
        )}

        {/* خط فاصل منقّط */}
        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

        {/* معلومات الفاتورة */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span>فاتورة: {invoice.id}</span>
          <span>{invoice.date}</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        {/* رأس الأصناف */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 11 }}>
          <span>الصنف</span>
          <span>المجموع</span>
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        {/* قائمة الأصناف */}
        {invoice.items.map((item, i) => (
          <div key={i} style={{ marginBottom: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <span>{(item.price * item.quantity).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 10, color: '#333', paddingRight: 4 }}>
              {item.quantity} × {item.price.toLocaleString()} EGP
            </div>
          </div>
        ))}

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        {/* المجاميع */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span>المجموع الفرعي</span>
          <span>{invoice.subtotal.toLocaleString()} EGP</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span>الضريبة (14%)</span>
          <span>{invoice.tax.toLocaleString()} EGP</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
          <span>الإجمالي</span>
          <span>{invoice.total.toLocaleString()} EGP</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
          <span>طريقة الدفع</span>
          <span>{paymentLabel[invoice.paymentMethod] || invoice.paymentMethod}</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

        {/* رمز QR */}
        {settings.showQR && (
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <div style={{ display: 'inline-block', padding: 6, background: '#fff' }}>
              <QRCodeSVG
                value={`vuno:invoice:${invoice.id}:${invoice.total}`}
                size={90}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>
            <div style={{ fontSize: 9, marginTop: 2 }}>امسح للتحقق من الفاتورة</div>
          </div>
        )}

        {/* تذييل الفاتورة */}
        {settings.showFooter && (
          <>
            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600 }}>
              {settings.footerText}
            </div>
          </>
        )}

        {/* خط نهاية الورقة */}
        <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
        <div style={{ textAlign: 'center', fontSize: 9, color: '#666' }}>
          Vuno — نظام نقاط البيع
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';

/**
 * يحوّل عنصر الفاتورة الحرارية إلى صورة PNG.
 * يعمل على الديسكتوب والموبايل (html-to-image يرسم على canvas).
 */
// eslint-disable-next-line react-refresh/only-export-components
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
// eslint-disable-next-line react-refresh/only-export-components
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
// eslint-disable-next-line react-refresh/only-export-components
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

/**
 * زر طباعة الفاتورة — بجانب زرار المشاركة.
 */
export function PrintReceiptButton({ receiptRef }: { receiptRef: React.RefObject<HTMLDivElement | null> }) {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    if (!receiptRef.current) return;
    setLoading(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    try {
      await printReceiptImage(receiptRef.current);
    } catch (err) {
      console.error('Failed to print receipt', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={loading}
      aria-label="طباعة الفاتورة"
      className="h-11 w-11 flex-shrink-0 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-60"
      style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-text)', background: 'var(--vuno-surface)' }}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-[var(--vuno-text-muted)] border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect width="12" height="8" x="6" y="14" />
        </svg>
      )}
    </button>
  );
}
export function ShareReceiptButton({ receiptRef }: { receiptRef: React.RefObject<HTMLDivElement | null> }) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!receiptRef.current) return;
    setLoading(true);
    // نسيب المتصفح يرسم حالة "جاري التحميل" الأول، قبل ما نبدأ العملية
    // التقيلة (تحويل العنصر لصورة) — عشان المستخدم يشوف إن في حاجة بتحصل
    // بدل ما الشاشة تفضل واقفة من غير رد فعل.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    try {
      const result = await shareReceiptImage(receiptRef.current);
      // نتيجة 'shared' أو 'downloaded' — كلاهما نجاح
      void result;
    } catch (err) {
      console.error('Failed to share receipt', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex-1 h-11 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 btn-primary-pill"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          جارٍ التجهيز...
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
          مشاركة الفاتورة
        </>
      )}
    </button>
  );
}
