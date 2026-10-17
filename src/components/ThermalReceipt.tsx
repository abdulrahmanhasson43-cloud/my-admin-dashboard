import { forwardRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { CompletedSale } from '@/types';
import { VAT_PERCENT } from '@/lib/pricing';
import { defaultReceiptSettings, shareReceiptImage, printReceiptImage } from '@/lib/receipt';
import type { ReceiptSettings } from '@/lib/receipt';

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
          <span>الضريبة ({VAT_PERCENT}%)</span>
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
