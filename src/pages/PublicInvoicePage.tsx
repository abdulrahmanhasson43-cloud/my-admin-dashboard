import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { sampleInvoices } from '@/services/mock';
import { PrintIcon, ArrowRightIcon } from '@/components/icons';

/**
 * الفكرة #29 — صفحة الفاتورة العامة.
 * صفحة عامة قابلة للمشاركة تعرض فاتورة واحدة عبر رابط مباشر
 * (مثال: /public/invoice/INV-2025-001) مع رمز QR يمكن للعميل
 * مسحه للوصول إلى تفاصيل الفاتورة. لا تتطلب تسجيل دخول.
 *
 * ملاحظة: في الإنتاج سيتم استبدال sampleInvoices بمصدر بيانات حقيقي
 * (Firestore / API) يتحقق من صلاحية الوصول للفاتورة.
 */
export default function PublicInvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();

  const invoice = useMemo(
    () => sampleInvoices.find((i) => i.id === invoiceId),
    [invoiceId],
  );

  // رابط الفاتورة العامة (يُستخدم داخل QR Code)
  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/public/invoice/${invoiceId ?? ''}`
      : `/public/invoice/${invoiceId ?? ''}`;

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[var(--vuno-bg)] flex items-center justify-center p-6" dir="rtl">
        <div className="card-vuno p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--vuno-surface)] mx-auto flex items-center justify-center">
            <span className="text-2xl">?</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--vuno-text)]">الفاتورة غير موجودة</h1>
          <p className="text-sm text-[var(--vuno-text-muted)]">
            قد يكون الرابط غير صحيح أو أن الفاتورة لم تعد متاحة.
          </p>
          <Link
            to="/"
            className="btn-primary-pill inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            <ArrowRightIcon size={16} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    paid: 'مدفوعة',
    pending: 'قيد الانتظار',
    cancelled: 'ملغاة',
  };

  const statusColor: Record<string, string> = {
    paid: 'var(--vuno-success)',
    pending: 'var(--vuno-warning)',
    cancelled: 'var(--vuno-danger)',
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[var(--vuno-bg)] py-6 px-4" dir="rtl">
      <div className="max-w-md mx-auto space-y-4">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between no-print">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-[var(--vuno-text-muted)] hover:text-[var(--vuno-text)] transition-colors"
          >
            <ArrowRightIcon size={16} />
            الرئيسية
          </Link>
          <button
            onClick={handlePrint}
            className="btn-primary-pill inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <PrintIcon size={16} />
            طباعة
          </button>
        </div>

        {/* بطاقة الفاتورة */}
        <div className="card-vuno overflow-hidden">
          {/* رأس الفاتورة */}
          <div className="gradient-header p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg leading-tight">Vuno</h1>
                  <p className="text-xs text-white/80">فاتورة ضريبية مبسطة</p>
                </div>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                }}
              >
                {statusLabel[invoice.status] ?? invoice.status}
              </span>
            </div>
          </div>

          {/* تفاصيل الفاتورة */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--vuno-text-muted)] mb-0.5">رقم الفاتورة</p>
                <p className="font-bold text-[var(--vuno-text)]">{invoice.id}</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-[var(--vuno-text-muted)] mb-0.5">التاريخ</p>
                <p className="text-sm font-medium text-[var(--vuno-text)]">{invoice.date}</p>
              </div>
            </div>

            <div className="border-t border-[var(--vuno-border)] pt-4">
              <p className="text-xs text-[var(--vuno-text-muted)] mb-0.5">العميل</p>
              <p className="text-sm font-semibold text-[var(--vuno-text)]">{invoice.customer}</p>
            </div>

            <div className="border-t border-[var(--vuno-border)] pt-4">
              <p className="text-xs text-[var(--vuno-text-muted)] mb-0.5">طريقة الدفع</p>
              <p className="text-sm font-semibold text-[var(--vuno-text)]">{invoice.method}</p>
            </div>

            {/* ملخص المبالغ */}
            <div className="border-t border-[var(--vuno-border)] pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--vuno-text-muted)]">المجموع الفرعي</span>
                <span className="font-medium text-[var(--vuno-text)]">
                  {invoice.amount.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--vuno-text-muted)]">الضريبة (14%)</span>
                <span className="font-medium text-[var(--vuno-text)]">
                  {invoice.tax.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div
                className="flex items-center justify-between pt-2 border-t border-[var(--vuno-border)]"
              >
                <span className="font-bold text-[var(--vuno-text)]">الإجمالي</span>
                <span
                  className="font-bold text-lg"
                  style={{ color: statusColor[invoice.status] ?? 'var(--vuno-primary)' }}
                >
                  {invoice.total.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            {/* عدد الأصناف */}
            <div className="border-t border-[var(--vuno-border)] pt-4 text-center">
              <p className="text-xs text-[var(--vuno-text-muted)]">
                عدد الأصناف: <span className="font-semibold text-[var(--vuno-text)]">{invoice.items}</span>
              </p>
            </div>

            {/* رمز QR — الفكرة #29 */}
            <div className="border-t border-[var(--vuno-border)] pt-5 flex flex-col items-center gap-2">
              <p className="text-xs text-[var(--vuno-text-muted)]">امسح الرمز للتحقق من الفاتورة</p>
              <div className="p-3 bg-white rounded-xl border border-[var(--vuno-border)]">
                <QRCodeSVG value={publicUrl} size={120} level="M" />
              </div>
              <p className="text-[10px] text-[var(--vuno-text-muted)] break-all max-w-[260px] text-center">
                {publicUrl}
              </p>
            </div>
          </div>

          {/* تذييل */}
          <div className="bg-[var(--vuno-surface)] p-4 text-center">
            <p className="text-xs text-[var(--vuno-text-muted)]">
              هذه الفاتورة صادرة من نظام Vuno لإدارة المتاجر
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
