import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useShift } from '@/context/shift-context-value';
import { useNotifications } from '@/context/notifications-context-value';
import type { Shift } from '@/types/shift';
import {
  ShiftManagementIcon, PlayIcon, ArchiveIcon, ClockIcon,
  CheckCircleIcon, ReceiptIcon, DollarSignIcon, PrintIcon,
  TrendingUpIcon, TrendingDownIcon,
} from '@/components/icons';

export default function ShiftsPage() {
  const { shifts, currentShift, openShift, closeShift, recordSale } = useShift();
  const { addNotification } = useNotifications();
  const [cashierName, setCashierName] = useState('');
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);


  /** المبلغ المتوقع في الصندوق = افتتاحي + مبيعات — الفكرة #14 */
  const expectedAmount = useMemo(
    () => (currentShift ? currentShift.openingAmount + currentShift.totalSales : 0),
    [currentShift],
  );
  const closingNumber = parseFloat(closingAmount) || 0;
  const liveVariance = closingNumber - expectedAmount;

  const handleOpen = () => {
    if (!cashierName.trim()) {
      toast.error('أدخل اسم الكاشير');
      return;
    }
    const amount = parseFloat(openingAmount) || 0;
    const shift = openShift(cashierName.trim(), amount);
    toast.success(`تم فتح وردية لـ ${shift.cashierName}`);
    addNotification({
      type: 'shift',
      title: 'وردية جديدة مفتوحة',
      message: `${shift.cashierName} فتح وردية بمبلغ افتتاحي ${amount.toLocaleString()} EGP`,
      link: '/shifts',
    });
    setCashierName('');
    setOpeningAmount('');
    setShowOpenForm(false);
  };

  const handleClose = () => {
    const amount = parseFloat(closingAmount) || 0;
    if (!currentShift) return;
    const variance = amount - (currentShift.openingAmount + currentShift.totalSales);
    closeShift(amount);
    if (variance === 0) {
      toast.success('✅ تم إغلاق الوردية — لا يوجد فرق');
    } else if (variance > 0) {
      toast.success(`✅ زيادة في الصندوق: ${variance.toLocaleString()} EGP`);
    } else {
      toast.error(`⚠️ عجز في الصندوق: ${Math.abs(variance).toLocaleString()} EGP`);
    }
    addNotification({
      type: 'shift',
      title: 'تم إغلاق وردية',
      message: `${currentShift.cashierName} أغلق الوردية. مبيعات: ${currentShift.totalSales.toLocaleString()} EGP، فواتير: ${currentShift.invoiceCount}، فرق: ${variance.toLocaleString()} EGP`,
      link: '/shifts',
    });
    setClosingAmount('');
    setShowCloseForm(false);
  };

  // Demo: record a sale on current shift
  const handleDemoSale = () => {
    if (!currentShift) {
      toast.error('لا توجد وردية مفتوحة');
      return;
    }
    const amount = Math.round(100 + Math.random() * 900);
    recordSale(amount);
    toast.success(`تم تسجيل مبيعية ${amount.toLocaleString()} EGP`);
  };

  /** طباعة تقرير الوردية — الفكرة #14 */
  const handlePrintReport = (shift: Shift) => {
    const variance = shift.variance ?? 0;
    const expected = shift.expectedAmount ?? (shift.openingAmount + shift.totalSales);
    const reportWindow = window.open('', '_blank', 'width=600,height=800');
    if (!reportWindow) {
      toast.error('تعذر فتح نافذة الطباعة — اسمح بالنوافذ المنبثقة');
      return;
    }
    reportWindow.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير وردية ${shift.id}</title>
    <style>
      * { font-family: 'Segoe UI', Tahoma, sans-serif; box-sizing: border-box; }
      body { padding: 32px; color: #1a1a2e; max-width: 580px; margin: 0 auto; }
      h1 { font-size: 22px; text-align: center; margin: 0 0 4px; }
      .sub { text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 24px; }
      .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
      .row .lbl { color: #6b7280; }
      .row .val { font-weight: 600; }
      .total { font-size: 18px; font-weight: 800; border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-top: 8px; }
      .variance-pos { color: #16a34a; font-weight: 700; }
      .variance-neg { color: #dc2626; font-weight: 700; }
      .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; }
      @media print { body { padding: 16px; } }
    </style></head><body>
    <h1>تقرير وردية</h1>
    <p class="sub">${shift.id} · ${shift.startedAt} — ${shift.closedAt ?? ''}</p>
    <div class="row"><span class="lbl">اسم الكاشير</span><span class="val">${shift.cashierName}</span></div>
    <div class="row"><span class="lbl">مبلغ الافتتاح</span><span class="val">${shift.openingAmount.toLocaleString()} EGP</span></div>
    <div class="row"><span class="lbl">إجمالي المبيعات</span><span class="val">${shift.totalSales.toLocaleString()} EGP</span></div>
    <div class="row"><span class="lbl">عدد الفواتير</span><span class="val">${shift.invoiceCount}</span></div>
    <div class="row"><span class="lbl">المبلغ المتوقع</span><span class="val">${expected.toLocaleString()} EGP</span></div>
    <div class="row"><span class="lbl">مبلغ الإغلاق الفعلي</span><span class="val">${(shift.closingAmount ?? 0).toLocaleString()} EGP</span></div>
    <div class="row total"><span>الفرق (Variance)</span><span class="${variance >= 0 ? 'variance-pos' : 'variance-neg'}">${variance >= 0 ? '+' : ''}${variance.toLocaleString()} EGP</span></div>
    <div class="footer">تم إنشاء التقرير بواسطة Vuno · ${new Date().toLocaleString('ar-EG')}</div>
    </body></html>`);
    reportWindow.document.close();
    reportWindow.focus();
    setTimeout(() => reportWindow.print(), 400);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Current Shift Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-vuno p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: currentShift ? 'color-mix(in srgb, var(--vuno-success) 12%, transparent)' : 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
          >
            {currentShift ? (
              <PlayIcon size={22} className="text-[var(--vuno-success)]" />
            ) : (
              <ShiftManagementIcon size={22} className="text-[var(--vuno-primary)]" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-[18px] text-[var(--vuno-text)]">الوردية الحالية</h2>
            <p className="text-[13px] text-[var(--vuno-text-muted)]">
              {currentShift ? 'مفتوحة الآن' : 'لا توجد وردية مفتوحة'}
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: currentShift ? 'color-mix(in srgb, var(--vuno-success) 15%, transparent)' : 'var(--vuno-border-light)',
              color: currentShift ? 'var(--vuno-success)' : 'var(--vuno-text-muted)',
            }}
          >
            {currentShift ? '● مفتوحة' : 'مغلقة'}
          </span>
        </div>

        {currentShift ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatBox label="الكاشير" value={currentShift.cashierName} icon={ShiftManagementIcon} />
              <StatBox label="مبلغ الافتتاح" value={`${currentShift.openingAmount.toLocaleString()}`} sub="EGP" icon={DollarSignIcon} />
              <StatBox label="إجمالي المبيعات" value={`${currentShift.totalSales.toLocaleString()}`} sub="EGP" icon={ReceiptIcon} />
              <StatBox label="عدد الفواتير" value={currentShift.invoiceCount.toString()} icon={ClockIcon} />
            </div>
            {/* Expected amount display — الفكرة #14 */}
            <div
              className="rounded-xl p-3 mb-4 flex items-center justify-between"
              style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--vuno-primary) 15%, transparent)' }}
            >
              <span className="text-[12px] font-medium text-[var(--vuno-text-secondary)]">المبلغ المتوقع في الصندوق</span>
              <span className="text-[16px] font-bold text-[var(--vuno-primary)] tabular-nums" dir="ltr">
                {expectedAmount.toLocaleString()} EGP
              </span>
            </div>
            <div className="text-[12px] text-[var(--vuno-text-muted)] mb-4 flex items-center gap-1.5">
              <ClockIcon size={14} />
              بدأت في: {currentShift.startedAt}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDemoSale}
                className="flex-1 h-11 rounded-full border border-[var(--vuno-border)] text-[var(--vuno-text)] font-medium text-[13px] hover:bg-[var(--vuno-bg)] transition-colors"
              >
                + مبيعية تجريبية
              </button>
              <button
                onClick={() => setShowCloseForm(true)}
                className="flex-1 h-11 rounded-full text-white font-semibold text-[13px]"
                style={{ background: 'var(--vuno-danger)' }}
              >
                إغلاق الوردية
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setShowOpenForm(true)}
            className="w-full h-12 rounded-full text-white font-semibold text-[15px]"
            style={{ background: 'var(--vuno-primary)' }}
          >
            + فتح وردية جديدة
          </button>
        )}
      </motion.div>

      {/* Open Shift Form */}
      {showOpenForm && !currentShift && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card-vuno p-5"
        >
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">فتح وردية جديدة</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">اسم الكاشير</label>
              <input
                type="text"
                value={cashierName}
                onChange={e => setCashierName(e.target.value)}
                placeholder="مثال: أحمد محمد"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">مبلغ الافتتاح (EGP)</label>
              <input
                type="number"
                inputMode="numeric"
                value={openingAmount}
                onChange={e => setOpeningAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowOpenForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors text-sm">إلغاء</button>
              <button onClick={handleOpen} className="px-5 py-2.5 rounded-full text-white font-medium text-sm" style={{ background: 'var(--vuno-primary)' }}>فتح الوردية</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Close Shift Form — with expected + live variance — الفكرة #14 */}
      {showCloseForm && currentShift && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card-vuno p-5"
        >
          <h3 className="font-bold text-[var(--vuno-text)] mb-4">إغلاق الوردية</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--vuno-bg)] p-3">
                <p className="text-[10px] text-[var(--vuno-text-muted)]">مبلغ الافتتاح</p>
                <p className="text-[16px] font-bold text-[var(--vuno-text)]">{currentShift.openingAmount.toLocaleString()} EGP</p>
              </div>
              <div className="rounded-xl bg-[var(--vuno-bg)] p-3">
                <p className="text-[10px] text-[var(--vuno-text-muted)]">إجمالي المبيعات</p>
                <p className="text-[16px] font-bold text-[var(--vuno-text)]">{currentShift.totalSales.toLocaleString()} EGP</p>
              </div>
            </div>
            {/* Expected amount — الفكرة #14 */}
            <div
              className="rounded-xl p-3 flex items-center justify-between"
              style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)' }}
            >
              <span className="text-[12px] font-medium text-[var(--vuno-text-secondary)]">المبلغ المتوقع</span>
              <span className="text-[15px] font-bold text-[var(--vuno-primary)]" dir="ltr">{expectedAmount.toLocaleString()} EGP</span>
            </div>
            <div>
              <label className="text-[12px] text-[var(--vuno-text-secondary)] mb-1.5 block">مبلغ الختام (عد النقدية)</label>
              <input
                type="number"
                inputMode="numeric"
                value={closingAmount}
                onChange={e => setClosingAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:outline-none focus:border-[var(--vuno-primary)] transition-colors"
                autoFocus
              />
            </div>
            {/* Live variance preview — الفكرة #14 */}
            {closingNumber > 0 && (
              <div
                className="rounded-xl p-3 flex items-center gap-2"
                style={{
                  background: liveVariance === 0
                    ? 'color-mix(in srgb, var(--vuno-success) 8%, transparent)'
                    : liveVariance > 0
                      ? 'color-mix(in srgb, var(--vuno-success) 8%, transparent)'
                      : 'color-mix(in srgb, var(--vuno-danger) 8%, transparent)',
                }}
              >
                {liveVariance === 0 ? (
                  <CheckCircleIcon size={18} className="text-[var(--vuno-success)]" />
                ) : liveVariance > 0 ? (
                  <TrendingUpIcon size={18} className="text-[var(--vuno-success)]" />
                ) : (
                  <TrendingDownIcon size={18} className="text-[var(--vuno-danger)]" />
                )}
                <span
                  className="text-[13px] font-bold"
                  style={{ color: liveVariance < 0 ? 'var(--vuno-danger)' : 'var(--vuno-success)' }}
                >
                  {liveVariance === 0
                    ? 'لا يوجد فرق — مطابق'
                    : liveVariance > 0
                      ? `زيادة: ${liveVariance.toLocaleString()} EGP`
                      : `عجز: ${Math.abs(liveVariance).toLocaleString()} EGP`}
                </span>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCloseForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)] transition-colors text-sm">إلغاء</button>
              <button onClick={handleClose} className="px-5 py-2.5 rounded-full text-white font-medium text-sm" style={{ background: 'var(--vuno-danger)' }}>تأكيد الإغلاق</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Shift History */}
      <div>
        <h2 className="font-bold text-[16px] text-[var(--vuno-text)] mb-3">سجل الورديات السابقة</h2>
        {shifts.filter(s => s.status === 'closed').length === 0 ? (
          <div className="card-vuno p-8 text-center text-[var(--vuno-text-muted)] text-sm">
            <ArchiveIcon size={28} className="mx-auto mb-2 opacity-40" />
            لا توجد ورديات مغلقة بعد
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.filter(s => s.status === 'closed').map((shift, i) => {
              const variance = shift.variance ?? 0;
              return (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="card-vuno p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[var(--vuno-surface-pearl)] flex items-center justify-center">
                        <CheckCircleIcon size={16} className="text-[var(--vuno-success)]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--vuno-text)]">{shift.cashierName}</p>
                        <p className="text-[11px] text-[var(--vuno-text-muted)]">{shift.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Variance badge — الفكرة #14 */}
                      {variance !== 0 && (
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                          style={{
                            background: variance > 0
                              ? 'color-mix(in srgb, var(--vuno-success) 12%, transparent)'
                              : 'color-mix(in srgb, var(--vuno-danger) 12%, transparent)',
                            color: variance > 0 ? 'var(--vuno-success)' : 'var(--vuno-danger)',
                          }}
                        >
                          {variance > 0 ? <TrendingUpIcon size={11} /> : <TrendingDownIcon size={11} />}
                          {variance > 0 ? '+' : ''}{variance.toLocaleString()}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600">مغلقة</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <MiniStat label="افتتاح" value={shift.openingAmount.toLocaleString()} />
                    <MiniStat label="ختام" value={(shift.closingAmount ?? 0).toLocaleString()} />
                    <MiniStat label="مبيعات" value={shift.totalSales.toLocaleString()} />
                    <MiniStat label="فواتير" value={shift.invoiceCount.toString()} />
                  </div>
                  {/* Print report button — الفكرة #14 */}
                  <button
                    onClick={() => handlePrintReport(shift)}
                    className="w-full h-9 rounded-xl text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                    style={{ background: 'var(--vuno-bg)', border: '1px solid var(--vuno-border)', color: 'var(--vuno-text-secondary)' }}
                  >
                    <PrintIcon size={14} />
                    طباعة تقرير الوردية
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shift Report state placeholder — الفكرة #14 */}
    </div>
  );
}

function StatBox({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: React.FC<{ className?: string; size?: number }> }) {
  return (
    <div className="rounded-xl bg-[var(--vuno-bg)] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className="text-[var(--vuno-text-muted)]" />
        <p className="text-[10px] text-[var(--vuno-text-muted)]">{label}</p>
      </div>
      <p className="text-[15px] font-bold text-[var(--vuno-text)] tabular-nums truncate">
        {value}
        {sub && <span className="text-[10px] font-normal text-[var(--vuno-text-muted)] mr-1">{sub}</span>}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-[var(--vuno-text-muted)] mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-[var(--vuno-text)] tabular-nums truncate">{value}</p>
    </div>
  );
}
