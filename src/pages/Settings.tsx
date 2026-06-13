import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMMISSION_RATE } from '../data';

export default function Settings() {
  const [commission, setCommission] = useState<string>((COMMISSION_RATE * 100).toFixed(0));
  const [platformName, setPlatformName] = useState('Packsy');
  const [adminEmail, setAdminEmail] = useState('admin@packsy.com');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [autoNotify, setAutoNotify] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#F5C443]' : 'bg-[#3A3A3C]'}`}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  );

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">الإعدادات</h1>
        <p className="text-[#8E8E93] text-sm mt-1">إدارة إعدادات المنصة</p>
      </div>

      {/* Platform Settings */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2C2C2E] rounded-2xl p-5 space-y-4"
      >
        <h2 className="text-white font-semibold text-sm border-b border-[#3A3A3C] pb-3">إعدادات المنصة</h2>
        <div>
          <label className="block text-[#8E8E93] text-xs mb-1.5">اسم المنصة</label>
          <input
            type="text"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="w-full bg-[#3A3A3C] text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#F5C443] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[#8E8E93] text-xs mb-1.5">البريد الإلكتروني للمشرف</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full bg-[#3A3A3C] text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#F5C443] transition-colors"
          />
        </div>
      </motion.div>

      {/* Commission Settings */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="bg-[#2C2C2E] rounded-2xl p-5 space-y-4"
      >
        <h2 className="text-white font-semibold text-sm border-b border-[#3A3A3C] pb-3">إعدادات العمولة</h2>
        <div>
          <label className="block text-[#8E8E93] text-xs mb-1.5">نسبة العمولة %</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              min="0"
              max="100"
              className="w-32 bg-[#3A3A3C] text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#F5C443] transition-colors"
            />
            <span className="text-[#8E8E93] text-sm">% من قيمة كل شحنة</span>
          </div>
          <p className="text-[#636366] text-[11px] mt-2">
            مثال: شحنة بقيمة 500 EGP → عمولة {Math.round(500 * (Number(commission) / 100))} EGP
          </p>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="bg-[#2C2C2E] rounded-2xl p-5 space-y-4"
      >
        <h2 className="text-white font-semibold text-sm border-b border-[#3A3A3C] pb-3">إعدادات الإشعارات</h2>

        {[
          { label: 'إشعارات واتساب', sub: 'إرسال تحديثات الشحن عبر واتساب للعميل', val: whatsappEnabled, set: setWhatsappEnabled },
          { label: 'إشعارات SMS', sub: 'إرسال رسائل نصية قصيرة للعميل', val: smsEnabled, set: setSmsEnabled },
          { label: 'إشعارات تلقائية', sub: 'إرسال إشعار تلقائي عند تغيير حالة الشحنة', val: autoNotify, set: setAutoNotify },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-1">
            <div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-[#8E8E93] text-xs mt-0.5">{item.sub}</p>
            </div>
            <Toggle value={item.val} onChange={item.set} />
          </div>
        ))}
      </motion.div>

      {/* Delivery Time Settings */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.21 }}
        className="bg-[#2C2C2E] rounded-2xl p-5 space-y-4"
      >
        <h2 className="text-white font-semibold text-sm border-b border-[#3A3A3C] pb-3">إعدادات التوصيل</h2>
        <div>
          <label className="block text-[#8E8E93] text-xs mb-1.5">متوسط وقت التوصيل (بالدقائق)</label>
          <input
            type="number"
            defaultValue="20"
            min="5"
            max="120"
            className="w-32 bg-[#3A3A3C] text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#F5C443] transition-colors"
          />
          <p className="text-[#636366] text-[11px] mt-2">يُستخدم لحساب وقت الوصول المتوقع لكل عميل</p>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.97 }}
          className="bg-[#F5C443] text-[#1C1C1E] font-bold text-sm px-8 py-3 rounded-xl"
        >
          حفظ الإعدادات
        </motion.button>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[#34C759] text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              تم الحفظ بنجاح
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
