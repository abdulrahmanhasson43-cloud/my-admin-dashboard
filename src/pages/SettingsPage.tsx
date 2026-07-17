import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PaymentMethodsIcon,
  ChevronDownIcon
} from '@/components/icons';
import { settingsSections as sections } from '@/constants/settingsSections';
import { staffMembers, paymentMethodsList, sampleBranches } from '@/services/mock';
import { useAppSettings } from '@/context/app-settings-context-value';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('متجر Vuno');
  const [storePhone, setStorePhone] = useState('01001234567');
  const [storeAddress, setStoreAddress] = useState('القاهرة، مصر');
  const [taxNumber, setTaxNumber] = useState('123-456-789');
  const [taxRate, setTaxRate] = useState('14');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2025');
  const [invoiceFooter, setInvoiceFooter] = useState('شكراً لتعاملكم معنا!');
  const [payments, setPayments] = useState(paymentMethodsList);
  const {
    multiBranchEnabled, setMultiBranchEnabled,
    transferRequiresConfirmation, setTransferRequiresConfirmation,
    defaultBranchId, setDefaultBranchId,
    lowStockThreshold, setLowStockThreshold,
  } = useAppSettings();

  const togglePayment = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Settings Grid */}
      {!activeSection && (
        <div className="grid md:grid-cols-2 gap-4">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.1, 0.3) }}
                onClick={() => setActiveSection(section.id)}
                className="card-vuno p-6 text-right hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl gradient-header flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <ChevronDownIcon size={18} className="text-[var(--vuno-text-muted)] rotate-90" />
                </div>
                <h3 className="text-lg font-bold text-[var(--vuno-text)] mb-1">{section.title}</h3>
                <p className="text-sm text-[var(--vuno-text-muted)]">{section.description}</p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Store Settings */}
      {activeSection === 'store' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setActiveSection(null)} className="p-2 rounded-xl hover:bg-gray-100 text-[var(--vuno-text-muted)]">
              <ChevronDownIcon size={20} className="-rotate-90" />
            </button>
            <h2 className="text-xl font-bold text-[var(--vuno-text)]">إعدادات المتجر</h2>
          </div>
          <div className="card-vuno p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">اسم المتجر</label>
                <input value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">رقم الهاتف</label>
                <input value={storePhone} onChange={e => setStorePhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">العنوان</label>
                <input value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">الرقم الضريبي</label>
                <input value={taxNumber} onChange={e => setTaxNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-3 rounded-xl gradient-btn text-white font-semibold hover:opacity-90 transition-opacity">
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Invoice Settings */}
      {activeSection === 'invoice' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setActiveSection(null)} className="p-2 rounded-xl hover:bg-gray-100 text-[var(--vuno-text-muted)]">
              <ChevronDownIcon size={20} className="-rotate-90" />
            </button>
            <h2 className="text-xl font-bold text-[var(--vuno-text)]">إعدادات الفاتورة</h2>
          </div>
          <div className="card-vuno p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">بادئة الفاتورة</label>
                <input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">نسبة الضريبة (%)</label>
                <input value={taxRate} onChange={e => setTaxRate(e.target.value)} type="number" className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">تذييل الفاتورة</label>
                <textarea value={invoiceFooter} onChange={e => setInvoiceFooter(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm resize-none" />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-3 rounded-xl gradient-btn text-white font-semibold hover:opacity-90 transition-opacity">
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Staff Settings */}
      {activeSection === 'staff' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setActiveSection(null)} className="p-2 rounded-xl hover:bg-gray-100 text-[var(--vuno-text-muted)]">
              <ChevronDownIcon size={20} className="-rotate-90" />
            </button>
            <h2 className="text-xl font-bold text-[var(--vuno-text)]">الموظفين والصلاحيات</h2>
          </div>
          <div className="card-vuno overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-[var(--vuno-border)]">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الموظف</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الدور</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--vuno-text-muted)]">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((member, i) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.1, 0.3) }}
                    className="border-b border-[var(--vuno-border-light)] last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-[var(--vuno-primary)] font-bold text-sm">{member.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-[var(--vuno-text)]">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--vuno-text-secondary)]">{member.role}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium">نشط</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="px-3 py-1.5 rounded-lg bg-orange-50 text-[var(--vuno-primary)] text-xs font-medium hover:bg-orange-100 transition-colors">
                        تعديل الصلاحيات
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Payment Methods */}
      {activeSection === 'payments' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setActiveSection(null)} className="p-2 rounded-xl hover:bg-gray-100 text-[var(--vuno-text-muted)]">
              <ChevronDownIcon size={20} className="-rotate-90" />
            </button>
            <h2 className="text-xl font-bold text-[var(--vuno-text)]">طرق الدفع</h2>
          </div>
          <div className="space-y-3">
            {payments.map((method, i) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.1, 0.3) }}
                className="card-vuno p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${method.enabled ? 'gradient-header' : 'bg-gray-100'} flex items-center justify-center text-white`}>
                    {method.id === 'cash' && <PaymentMethodsIcon size={22} />}
                    {method.id === 'card' && <PaymentMethodsIcon size={22} />}
                    {method.id === 'wallet' && <PaymentMethodsIcon size={22} />}
                    {method.id === 'instapay' && <PaymentMethodsIcon size={22} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--vuno-text)]">{method.name}</h4>
                    <p className="text-xs text-[var(--vuno-text-muted)]">{method.enabled ? 'مفعل' : 'معطل'}</p>
                  </div>
                </div>
                <button
                  onClick={() => togglePayment(method.id)}
                  className={`w-14 h-8 rounded-full transition-colors relative ${method.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${method.enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Branches & Inventory Settings */}
      {activeSection === 'branches-inventory' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setActiveSection(null)} className="p-2 rounded-xl hover:bg-gray-100 text-[var(--vuno-text-muted)]">
              <ChevronDownIcon size={20} className="-rotate-90" />
            </button>
            <h2 className="text-xl font-bold text-[var(--vuno-text)]">الفروع والمخزون</h2>
          </div>

          <div className="card-vuno p-6 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[var(--vuno-text)] mb-1">عندي أكتر من فرع</h4>
              <p className="text-xs text-[var(--vuno-text-muted)]">فعّلها لو عندك أكتر من فرع.</p>
            </div>
            <button
              onClick={() => setMultiBranchEnabled(!multiBranchEnabled)}
              className={`w-14 h-8 rounded-full transition-colors relative flex-shrink-0 ${multiBranchEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${multiBranchEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {multiBranchEnabled && (
            <>
              <div className="card-vuno p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[var(--vuno-text)] mb-1">النقل بين الفروع يحتاج تأكيد</h4>
                  <p className="text-xs text-[var(--vuno-text-muted)]">لو مفعّلة، النقل هيفضل معلّق لحد ما توافق عليه.</p>
                </div>
                <button
                  onClick={() => setTransferRequiresConfirmation(!transferRequiresConfirmation)}
                  className={`w-14 h-8 rounded-full transition-colors relative flex-shrink-0 ${transferRequiresConfirmation ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${transferRequiresConfirmation ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="card-vuno p-6">
                <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">الفرع الافتراضي لنقطة البيع</label>
                <select
                  value={defaultBranchId}
                  onChange={(e) => setDefaultBranchId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm"
                >
                  {sampleBranches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="card-vuno p-6">
            <label className="block text-sm font-medium text-[var(--vuno-text)] mb-2">حد تنبيه "المخزون المنخفض"</label>
            <p className="text-xs text-[var(--vuno-text-muted)] mb-3">تحت الرقم ده، المنتج يعتبر ناقص.</p>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Math.max(0, Number(e.target.value) || 0))}
              className="w-full md:w-48 px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-gray-50 text-sm"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}


