import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TaxInvoiceIcon, CheckCircleIcon, ShieldIcon,
  CheckIcon, AlertTriangleIcon,
} from '@/components/icons';

/* Toggle Switch — Apple-style */
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
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-[var(--vuno-text)] leading-snug">{label}</p>
        {hint && <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5 leading-snug">{hint}</p>}
      </div>
      <span
        className="flex-shrink-0 relative w-[46px] h-[28px] rounded-full transition-colors duration-200"
        style={{ background: checked ? 'var(--vuno-success)' : '#D2D2D7' }}
      >
        <span
          className="absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white transition-all duration-200"
          style={{ left: checked ? '2px' : '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
        />
      </span>
    </button>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
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
      {hint && <p className="text-[11px] text-[var(--vuno-text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[18px] p-5 sm:p-6 ${className}`} style={{ border: '1px solid var(--vuno-border)' }}>
      {children}
    </div>
  );
}

export default function TaxInvoiceSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  // ETA (Egyptian Tax Authority) registration fields
  const [taxRegistrationNumber, setTaxRegistrationNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [clientId, setClientId] = useState('');
  const [apiEnvironment, setApiEnvironment] = useState<'production' | 'preprod'>('production');

  // Invoice type toggles
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [includeQR, setIncludeQR] = useState(true);
  const [includeTaxBreakdown, setIncludeTaxBreakdown] = useState(true);
  const [notifyOnSubmit, setNotifyOnSubmit] = useState(false);

  const connectionStatus = enabled && taxRegistrationNumber && clientId && clientSecret ? 'connected' : 'disconnected';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
          تم حفظ الإعدادات
        </motion.div>
      )}

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--vuno-surface-pearl)' }}>
            <TaxInvoiceIcon size={22} className="text-[var(--vuno-primary)]" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--vuno-text)] tracking-tight">الفاتورة الضريبية الإلكترونية</h1>
            <p className="text-[14px] text-[var(--vuno-text-muted)]">ربط مع هيئة الضرائب المصرية (ETA)</p>
          </div>
        </div>
      </div>

      {/* Connection status banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[18px] p-5 flex items-center gap-4"
        style={{
          background: connectionStatus === 'connected'
            ? 'color-mix(in srgb, var(--vuno-success) 8%, white)'
            : 'color-mix(in srgb, #FF9500 8%, white)',
          border: `1px solid ${connectionStatus === 'connected' ? 'color-mix(in srgb, var(--vuno-success) 20%, transparent)' : 'color-mix(in srgb, #FF9500 20%, transparent)'}`,
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: connectionStatus === 'connected'
              ? 'color-mix(in srgb, var(--vuno-success) 15%, transparent)'
              : 'color-mix(in srgb, #FF9500 15%, transparent)',
          }}
        >
          {connectionStatus === 'connected'
            ? <CheckCircleIcon size={20} className="text-[var(--vuno-success)]" />
            : <AlertTriangleIcon size={20} className="text-[#FF9500]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[var(--vuno-text)]">
            {connectionStatus === 'connected' ? 'متصل بهيئة الضرائب' : 'غير متصل'}
          </p>
          <p className="text-[13px] text-[var(--vuno-text-muted)]">
            {connectionStatus === 'connected'
              ? `الرقم الضريبي: ${taxRegistrationNumber}`
              : 'أكمل بيانات الربط لتفعيل الفواتير الإلكترونية'}
          </p>
        </div>
      </motion.div>

      {/* Enable toggle */}
      <SectionCard>
        <Toggle
          checked={enabled}
          onChange={setEnabled}
          label="تفعيل الفاتورة الضريبية الإلكترونية"
          hint="عند التفعيل، كل فاتورة تصدر ستصلك لمراجعة هيئة الضرائب تلقائياً"
        />
      </SectionCard>

      {/* ETA Registration */}
      {enabled && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <SectionCard>
            <h3 className="text-[15px] font-semibold text-[var(--vuno-text)] mb-1">بيانات التسجيل</h3>
            <p className="text-[13px] text-[var(--vuno-text-muted)] mb-4">البيانات اللي هيتم استخدامها للربط مع بوابة هيئة الضرائب</p>
            <div className="space-y-4">
              <Field
                label="الرقم الضريبي (Tax Registration Number)"
                value={taxRegistrationNumber}
                onChange={setTaxRegistrationNumber}
                placeholder="123-456-789"
                hint="الرقم اللي حصلت عليه من هيئة الضرائب"
              />
              <Field
                label="اسم الشركة / المنشأة"
                value={companyName}
                onChange={setCompanyName}
                placeholder="شركة مثال للتجارة"
              />
              <Field
                label="عنوان الشركة"
                value={companyAddress}
                onChange={setCompanyAddress}
                placeholder="القاهرة، مصر"
              />
            </div>
          </SectionCard>

          {/* API Credentials */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-1">
              <ShieldIcon size={16} className="text-[var(--vuno-primary)]" />
              <h3 className="text-[15px] font-semibold text-[var(--vuno-text)]">بيانات API</h3>
            </div>
            <p className="text-[13px] text-[var(--vuno-text-muted)] mb-4">بيانات الدخول اللي حصلت عليها من بوابة المطورين في هيئة الضرائب</p>
            <div className="space-y-4">
              <Field
                label="Client ID"
                value={clientId}
                onChange={setClientId}
                placeholder="abcd1234-ef56-7890"
              />
              <Field
                label="Client Secret"
                value={clientSecret}
                onChange={setClientSecret}
                type="password"
                placeholder="••••••••••••••••"
              />
              <div>
                <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-2">بيئة الـ API</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setApiEnvironment('production')}
                    className={`flex-1 h-11 rounded-[12px] text-[14px] font-medium transition-all ${
                      apiEnvironment === 'production' ? 'text-white' : 'border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
                    }`}
                    style={apiEnvironment === 'production' ? { background: 'var(--vuno-primary)' } : undefined}
                  >
                    الإنتاج (Production)
                  </button>
                  <button
                    onClick={() => setApiEnvironment('preprod')}
                    className={`flex-1 h-11 rounded-[12px] text-[14px] font-medium transition-all ${
                      apiEnvironment === 'preprod' ? 'text-white' : 'border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)]'
                    }`}
                    style={apiEnvironment === 'preprod' ? { background: 'var(--vuno-primary)' } : undefined}
                  >
                    تجريبي (Preprod)
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Invoice behavior */}
          <SectionCard className="p-0 overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-[15px] font-semibold text-[var(--vuno-text)]">سلوك الفاتورة</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--vuno-border-light)' }}>
              <div style={{ borderColor: 'var(--vuno-border-light)' }}>
                <Toggle checked={autoSubmit} onChange={setAutoSubmit} label="إرسال تلقائي لهيئة الضرائب" hint="كل فاتورة تتصدر تلقائياً للهيئة" />
              </div>
              <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                <Toggle checked={includeQR} onChange={setIncludeQR} label="إضافة رمز QR للتحقق" hint="رمز QR المطلوب من هيئة الضرائب" />
              </div>
              <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                <Toggle checked={includeTaxBreakdown} onChange={setIncludeTaxBreakdown} label="عرض تفصيل الضريبة" hint="إظهار قيمة الضريبة مفصلة في الفاتورة" />
              </div>
              <div className="border-t" style={{ borderColor: 'var(--vuno-border-light)' }}>
                <Toggle checked={notifyOnSubmit} onChange={setNotifyOnSubmit} label="إشعار عند الإرسال" hint="تنبيه بعد كل فاتورة تتسجل بنجاح" />
              </div>
            </div>
          </SectionCard>

          {/* Test connection button */}
          <button
            onClick={handleSave}
            disabled={!taxRegistrationNumber || !clientId || !clientSecret}
            className="w-full h-12 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--vuno-primary)' }}
          >
            حفظ واختبار الاتصال
          </button>

          {/* Info note */}
          <div className="rounded-[14px] p-4 flex items-start gap-3" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 5%, white)', border: '1px solid color-mix(in srgb, var(--vuno-primary) 15%, transparent)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)' }}>
              <CheckIcon size={12} className="text-[var(--vuno-primary)]" />
            </div>
            <p className="text-[13px] text-[var(--vuno-text-secondary)] leading-relaxed">
              بيانات الـ API بتُخزّن بشكل آمن ومشفّر. Vuno ما بيحتفظش بأي معلومات بنكية. الربط بيتم مباشرة بين متجرك وهيئة الضرائب المصرية.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
