import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDownIcon, CheckCircleIcon, StoreIcon, InvoiceSettingsIcon,
  ReceiptIcon, StaffIcon, PaymentMethodsIcon, BranchesIcon,
  CheckIcon,
} from '@/components/icons';
import { settingsSections as sections } from '@/constants/settingsSections';
import { staffMembers, sampleBranches } from '@/services/mock';
import { roleMeta } from '@/types';
import { getPaymentIcon } from '@/lib/payment-icons';
import { useAppSettings } from '@/context/app-settings-context-value';
import { ThermalReceipt } from '@/components/ThermalReceipt';

/* ───────────────────────────── Toggle Switch ───────────────────────────── */
/** مفتاح تبديل Apple-style: شكل كبسولة، حركة سلسة، لون Action Blue عند التفعيل. */
function Toggle({ checked, onChange, label, hint }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 py-3 text-right"
    >
      {label ? (
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-[var(--vuno-text)] leading-snug">{label}</p>
          {hint && <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5 leading-snug">{hint}</p>}
        </div>
      ) : <div className="flex-1" />}
      <span
        className="flex-shrink-0 relative w-[46px] h-[28px] rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--vuno-success)' : '#D2D2D7' }}
      >
        <span
          className="absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white transition-all duration-200"
          style={{
            left: checked ? '2px' : '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        />
      </span>
    </button>
  );
}

/* ───────────────────────────── Settings Field ───────────────────────────── */
function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-[12px] text-[15px] text-[var(--vuno-text)] bg-[var(--vuno-surface-pearl)] focus:bg-white transition-colors focus:outline-none"
        style={{ border: '1px solid var(--vuno-border)' }}
      />
    </div>
  );
}

/* ───────────────────────────── Section Card ───────────────────────────── */
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-[18px] p-5 sm:p-6 ${className}`}
      style={{ border: '1px solid var(--vuno-border)' }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────── Section Header ───────────────────────────── */
function SectionHeader({ icon: Icon, title, onBack }: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
        style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
        aria-label="رجوع"
      >
        <ChevronDownIcon size={18} className="text-[var(--vuno-text)] -rotate-90" />
      </button>
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--vuno-surface-pearl)' }}>
        <Icon size={18} className="text-[var(--vuno-primary)]" />
      </div>
      <h2 className="text-[20px] font-semibold text-[var(--vuno-text)] tracking-tight">{title}</h2>
    </div>
  );
}

/* ───────────────────────────── Save Bar ───────────────────────────── */
function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end mt-5">
      <button
        onClick={onSave}
        className="h-11 px-6 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 btn-primary-pill"
      >
        حفظ التغييرات
      </button>
    </div>
  );
}

/* ═════════════════════════════ Main Settings Page ═════════════════════════════ */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('متجر Vuno');
  const [storePhone, setStorePhone] = useState('01001234567');
  const [storeAddress, setStoreAddress] = useState('القاهرة، مصر');
  const [taxNumber, setTaxNumber] = useState('123-456-789');
  const [taxRate, setTaxRate] = useState('14');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2025');
  const [invoiceFooter, setInvoiceFooter] = useState('شكراً لتعاملكم معنا!');
  const [saved, setSaved] = useState(false);

  const {
    multiBranchEnabled, setMultiBranchEnabled,
    transferRequiresConfirmation, setTransferRequiresConfirmation,
    defaultBranchId, setDefaultBranchId,
    lowStockThreshold, setLowStockThreshold,
    receiptSettings, updateReceiptField,
    paymentMethods: payments,
    togglePaymentMethod,
  } = useAppSettings();

  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ───────────── Saved Toast placeholder ───────────── */


  const sectionTitles: Record<string, string> = {
    store: 'إعدادات المتجر',
    invoice: 'إعدادات الفاتورة',
    receipt: 'الفاتورة الحرارية',
    staff: 'الموظفين والصلاحيات',
    payments: 'طرق الدفع',
    'branches-inventory': 'الفروع والمخزون',
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
      {/* Saved toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-white text-[14px] font-medium flex items-center gap-2"
          style={{ background: 'var(--vuno-success)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          <CheckCircleIcon size={16} className="text-white" />
          تم الحفظ بنجاح
        </motion.div>
      )}

      {/* ═══════════════ Settings Grid (no active section) ═══════════════ */}
      {!activeSection && (
        <>
          <div className="mb-2">
            <h1 className="text-[28px] font-semibold text-[var(--vuno-text)] tracking-tight">الإعدادات</h1>
            <p className="text-[15px] text-[var(--vuno-text-muted)] mt-0.5">خصّص متجرك وفواتيرك وطرق دفعك</p>
          </div>

          <div className="space-y-2.5">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full bg-white rounded-[18px] p-4 sm:p-5 text-right transition-transform active:scale-[0.98] flex items-center gap-4"
                  style={{ border: '1px solid var(--vuno-border)' }}
                >
                  <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--vuno-surface-pearl)' }}>
                    <Icon size={20} className="text-[var(--vuno-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-semibold text-[var(--vuno-text)] leading-snug">{section.title}</h3>
                    <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5 leading-snug truncate">{section.description}</p>
                  </div>
                  <ChevronDownIcon size={18} className="text-[var(--vuno-text-muted)] -rotate-90 flex-shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════════════ Store Settings ═══════════════ */}
      {activeSection === 'store' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }}>
          <SectionHeader icon={StoreIcon} title={sectionTitles.store} onBack={() => setActiveSection(null)} />
          <SectionCard>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="اسم المتجر" value={storeName} onChange={setStoreName} />
              <Field label="رقم الهاتف" value={storePhone} onChange={setStorePhone} />
              <div className="sm:col-span-2">
                <Field label="العنوان" value={storeAddress} onChange={setStoreAddress} />
              </div>
              <Field label="الرقم الضريبي" value={taxNumber} onChange={setTaxNumber} />
            </div>
            <SaveBar onSave={handleSave} />
          </SectionCard>
        </motion.div>
      )}

      {/* ═══════════════ Invoice Settings ═══════════════ */}
      {activeSection === 'invoice' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }}>
          <SectionHeader icon={InvoiceSettingsIcon} title={sectionTitles.invoice} onBack={() => setActiveSection(null)} />
          <SectionCard>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="بادئة الفاتورة" value={invoicePrefix} onChange={setInvoicePrefix} />
              <Field label="نسبة الضريبة (%)" value={taxRate} onChange={setTaxRate} type="number" />
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">تذييل الفاتورة</label>
                <textarea
                  value={invoiceFooter}
                  onChange={e => setInvoiceFooter(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-[12px] text-[15px] text-[var(--vuno-text)] bg-[var(--vuno-surface-pearl)] focus:bg-white transition-colors focus:outline-none resize-none"
                  style={{ border: '1px solid var(--vuno-border)' }}
                />
              </div>
            </div>
            <SaveBar onSave={handleSave} />
          </SectionCard>
        </motion.div>
      )}

      {/* ═══════════════ Thermal Receipt Settings ═══════════════ */}
      {activeSection === 'receipt' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }} className="grid lg:grid-cols-[1fr_auto] gap-5 items-start">
          <div>
            <SectionHeader icon={ReceiptIcon} title={sectionTitles.receipt} onBack={() => setActiveSection(null)} />

            {/* Store info fields for the receipt */}
            <SectionCard className="mb-4">
              <h3 className="text-[15px] font-semibold text-[var(--vuno-text)] mb-3">بيانات المتجر على الإيصال</h3>
              <div className="space-y-3">
                <Field label="اسم المتجر" value={receiptSettings.storeName} onChange={v => updateReceiptField('storeName', v)} />
                <Field label="رقم الهاتف" value={receiptSettings.storePhone} onChange={v => updateReceiptField('storePhone', v)} />
                <Field label="العنوان" value={receiptSettings.storeAddress} onChange={v => updateReceiptField('storeAddress', v)} />
                <Field label="الرقم الضريبي" value={receiptSettings.taxNumber} onChange={v => updateReceiptField('taxNumber', v)} />
                <Field label="نص التذييل" value={receiptSettings.footerText} onChange={v => updateReceiptField('footerText', v)} />
              </div>
            </SectionCard>

            {/* Toggle which fields appear */}
            <SectionCard>
              <h3 className="text-[15px] font-semibold text-[var(--vuno-text)] mb-1">ما يظهر على الإيصال</h3>
              <p className="text-[13px] text-[var(--vuno-text-muted)] mb-2">فعّل أو أوقف الحقول التي تريد إظهارها</p>
              <div className="divide-y" style={{ borderColor: 'var(--vuno-border-light)' }}>
                <div style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Toggle checked={receiptSettings.showStoreName} onChange={v => updateReceiptField('showStoreName', v)} label="اسم المتجر" />
                </div>
                <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Toggle checked={receiptSettings.showLogo} onChange={v => updateReceiptField('showLogo', v)} label="شعار المتجر" hint="أضف رابط صورة الشعار" />
                </div>
                <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Toggle checked={receiptSettings.showPhone} onChange={v => updateReceiptField('showPhone', v)} label="رقم الهاتف" />
                </div>
                <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Toggle checked={receiptSettings.showAddress} onChange={v => updateReceiptField('showAddress', v)} label="العنوان" />
                </div>
                <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Toggle checked={receiptSettings.showTaxNumber} onChange={v => updateReceiptField('showTaxNumber', v)} label="الرقم الضريبي" />
                </div>
                <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Toggle checked={receiptSettings.showFooter} onChange={v => updateReceiptField('showFooter', v)} label="التذييل" />
                </div>
                <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Toggle checked={receiptSettings.showQR} onChange={v => updateReceiptField('showQR', v)} label="رمز QR للتحقق" hint="يمسحه العميل للتحقق من الفاتورة" />
                </div>
              </div>

              {receiptSettings.showLogo && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                  <Field label="رابط الشعار (URL)" value={receiptSettings.logoUrl || ''} onChange={v => updateReceiptField('logoUrl', v || null)} placeholder="https://example.com/logo.png" />
                </div>
              )}
            </SectionCard>
          </div>

          {/* Live receipt preview — shows on desktop (sidebar) and mobile (below) */}
          <div className="lg:sticky lg:top-6">
            <p className="text-[13px] font-medium text-[var(--vuno-text-muted)] mb-2 text-center">معاينة مباشرة</p>
            <div className="rounded-[6px] overflow-hidden inline-block mx-auto lg:mx-0" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
              <ThermalReceipt
                ref={receiptPreviewRef}
                invoice={{
                  id: 'INV-PREVIEW',
                  items: [
                    { id: '1', name: 'سماعة بلوتوث', category: 'إلكترونيات', price: 250, cost: 180, wholesalePrice: 210, stock: 45, storeStock: 15, warehouseStock: 30, barcode: '123', status: 'active', quantity: 2 },
                    { id: '2', name: 'شاحن سريع 65W', category: 'إلكترونيات', price: 180, cost: 120, wholesalePrice: 150, stock: 8, storeStock: 8, warehouseStock: 0, barcode: '456', status: 'active', quantity: 1 },
                  ],
                  subtotal: 680,
                  tax: 95.2,
                  total: 775.2,
                  paymentMethod: 'cash',
                  date: 'معاينة',
                }}
                settings={receiptSettings}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════ Staff Settings ═══════════════ */}
      {activeSection === 'staff' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }}>
          <SectionHeader icon={StaffIcon} title={sectionTitles.staff} onBack={() => setActiveSection(null)} />
          <SectionCard className="p-0 overflow-hidden">
            {staffMembers.map((member, i) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4"
                style={{ borderTop: i > 0 ? '1px solid var(--vuno-border-light)' : 'none' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--vuno-surface-pearl)' }}
                >
                  <span className="text-[var(--vuno-primary)] font-semibold text-[15px]">{member.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--vuno-text)] leading-snug">{member.name}</p>
                  <p className="text-[13px] text-[var(--vuno-text-muted)]">{roleMeta.find(r => r.id === member.role)?.label ?? member.role}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1 flex-shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--vuno-success) 12%, transparent)', color: 'var(--vuno-success)' }}
                >
                  <CheckIcon size={12} />
                  نشط
                </span>
                <button
                  className="px-4 h-9 rounded-full text-[13px] font-medium transition-transform active:scale-95 flex-shrink-0"
                  style={{ border: '1px solid var(--vuno-border)', color: 'var(--vuno-primary)' }}
                >
                  تعديل
                </button>
              </div>
            ))}
          </SectionCard>
        </motion.div>
      )}

      {/* ═══════════════ Payment Methods ═══════════════ */}
      {activeSection === 'payments' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }}>
          <SectionHeader icon={PaymentMethodsIcon} title={sectionTitles.payments} onBack={() => setActiveSection(null)} />
          <SectionCard className="p-0 overflow-hidden">
            {payments.map((method, i) => (
              <div
                key={method.id}
                className="flex items-center gap-4 p-4"
                style={{ borderTop: i > 0 ? '1px solid var(--vuno-border-light)' : 'none' }}
              >
                <div
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: method.enabled ? 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)' : 'var(--vuno-surface-pearl)' }}
                >
                  {(() => { const Icon = getPaymentIcon(method.id); return <Icon size={20} className={method.enabled ? 'text-[var(--vuno-primary)]' : 'text-[var(--vuno-text-muted)]'} />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--vuno-text)] leading-snug">{method.name}</p>
                  <p className="text-[13px] text-[var(--vuno-text-muted)]">{method.enabled ? 'مفعّل' : 'معطّل'}</p>
                </div>
                <Toggle checked={method.enabled} onChange={() => togglePaymentMethod(method.id)} label="" />
              </div>
            ))}
          </SectionCard>
        </motion.div>
      )}

      {/* ═══════════════ Branches & Inventory ═══════════════ */}
      {activeSection === 'branches-inventory' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }} className="space-y-4">
          <SectionHeader icon={BranchesIcon} title={sectionTitles['branches-inventory']} onBack={() => setActiveSection(null)} />

          <SectionCard>
            <Toggle
              checked={multiBranchEnabled}
              onChange={setMultiBranchEnabled}
              label="لدي أكثر من فرع"
              hint="فعّلها لو عندك أكثر من فرع."
            />
          </SectionCard>

          {multiBranchEnabled && (
            <>
              <SectionCard>
                <Toggle
                  checked={transferRequiresConfirmation}
                  onChange={setTransferRequiresConfirmation}
                  label="النقل بين الفروع يحتاج تأكيد"
                  hint="لو مفعّلة، النقل هيبقى معلّق لحد ما توافق عليه."
                />
              </SectionCard>

              <SectionCard>
                <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-2">الفرع الافتراضي لنقطة البيع</label>
                <select
                  value={defaultBranchId}
                  onChange={e => setDefaultBranchId(e.target.value)}
                  className="w-full h-11 px-4 rounded-[12px] text-[15px] text-[var(--vuno-text)] bg-[var(--vuno-surface-pearl)] focus:outline-none"
                  style={{ border: '1px solid var(--vuno-border)' }}
                >
                  {sampleBranches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </SectionCard>
            </>
          )}

          <SectionCard>
            <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-2">حد تنبيه "المخزون المنخفض"</label>
            <p className="text-[13px] text-[var(--vuno-text-muted)] mb-3">تحت الرقم ده، المنتج يعتبر ناقص.</p>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(Math.max(0, Number(e.target.value) || 0))}
              className="w-full sm:w-48 h-11 px-4 rounded-[12px] text-[15px] text-[var(--vuno-text)] bg-[var(--vuno-surface-pearl)] focus:bg-white transition-colors focus:outline-none"
              style={{ border: '1px solid var(--vuno-border)' }}
            />
          </SectionCard>

          <SaveBar onSave={handleSave} />
        </motion.div>
      )}
    </div>
  );
}
