import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ProfileIcon, PaletteIcon, StoreIcon, UserIcon, LockIcon,
  UploadIcon, CheckIcon, LogoutIcon, EyeIcon, EyeOffIcon,
  CheckCircleIcon, ClockIcon, CardIcon,
} from '@/components/icons';
import {
  defaultUserProfile, defaultStoreBranding, defaultSubscription,
} from '@/services/mock/profile';
import { brandColorPresets } from '@/types/profile';
import type { UserProfile, StoreBranding } from '@/types/profile';
import { formatEnglishDate } from '@/lib/utils';
import Field from '@/components/Field';
import SectionCard from '@/components/SectionCard';

/* ─────────────────────────────────────────────────────────────────────────────
   Reusable atoms — match SettingsPage design language
   ───────────────────────────────────────────────────────────────────────────── */

/** Header row inside a card: icon tile + title. */
function CardHeader({ icon: Icon, title, subtitle }: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--vuno-surface-pearl)' }}>
        <Icon size={20} className="text-[var(--vuno-primary)]" />
      </div>
      <div>
        <h2 className="text-[17px] font-semibold text-[var(--vuno-text)] tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Store Branding — logo upload, store name, tagline, color presets, live preview
   ───────────────────────────────────────────────────────────────────────────── */

/** The live "preview" card that shows how the store branding will look. */
function BrandPreview({ branding }: { branding: StoreBranding }) {
  const initials = branding.storeName
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('');
  return (
    <div
      className="rounded-[16px] p-6 text-center"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}DD 100%)`,
        boxShadow: `0 8px 24px ${branding.primaryColor}33`,
      }}
    >
      {/* Logo / initials circle */}
      <div className="w-16 h-16 mx-auto rounded-full bg-white/95 flex items-center justify-center mb-3">
        {branding.logoUrl ? (
          <img src={branding.logoUrl} alt="logo" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-[24px] font-bold" style={{ color: branding.primaryColor }}>
            {initials || 'V'}
          </span>
        )}
      </div>
      <h3 className="text-white text-[18px] font-bold tracking-tight">{branding.storeName}</h3>
      <p className="text-white/80 text-[13px] mt-1">{branding.tagline}</p>
      {/* mini accent bar */}
      <div className="w-12 h-1 rounded-full mx-auto mt-3" style={{ background: branding.accentColor }} />
    </div>
  );
}

function StoreBrandingCard({
  branding, onChange,
}: {
  branding: StoreBranding;
  onChange: (patch: Partial<StoreBranding>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة صالح');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logoUrl: reader.result as string });
      toast.success('تم رفع الشعار');
    };
    reader.readAsDataURL(file);
  };

  return (
    <SectionCard>
      <CardHeader icon={PaletteIcon} title="هوية المتجر" subtitle="اسم المتجر، الشعار، والألوان" />

      {/* Live preview */}
      <div className="mb-5">
        <BrandPreview branding={branding} />
      </div>

      {/* Logo upload */}
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">شعار المتجر</label>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <StoreIcon size={24} className="text-[var(--vuno-text-muted)]" />
            )}
          </div>
          <label className="h-10 px-4 rounded-full flex items-center gap-2 text-[14px] font-medium cursor-pointer transition-transform active:scale-95" style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}>
            <UploadIcon size={16} className="text-[var(--vuno-text-secondary)]" />
            <span className="text-[var(--vuno-text)]">رفع شعار</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
          {branding.logoUrl && (
            <button
              type="button"
              onClick={() => onChange({ logoUrl: undefined })}
              className="text-[13px] text-[var(--vuno-danger)] font-medium"
            >
              إزالة
            </button>
          )}
        </div>
      </div>

      {/* Store name + tagline */}
      <div className="grid gap-4 mb-5">
        <Field label="اسم المتجر" value={branding.storeName} onChange={v => onChange({ storeName: v })} placeholder="اسم متجرك" />
        <Field label="الوصف المختصر" value={branding.tagline} onChange={v => onChange({ tagline: v })} placeholder="عبارة قصيرة تصف متجرك" />
      </div>

      {/* Color presets */}
      <div>
        <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-2">ألوان الهوية</label>
        <div className="grid grid-cols-4 gap-2.5">
          {brandColorPresets.map(preset => {
            const isSelected = branding.primaryColor.toUpperCase() === preset.primary.toUpperCase();
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onChange({ primaryColor: preset.primary, accentColor: preset.accent })}
                className="relative rounded-[12px] p-2 flex flex-col items-center gap-1.5 transition-transform active:scale-95"
                style={{
                  background: isSelected ? `${preset.primary}11` : 'var(--vuno-surface-pearl)',
                  border: isSelected ? `2px solid ${preset.primary}` : '1px solid var(--vuno-border)',
                }}
                aria-label={preset.name}
              >
                <div className="flex gap-1">
                  <span className="w-6 h-6 rounded-full" style={{ background: preset.primary }} />
                  <span className="w-6 h-6 rounded-full" style={{ background: preset.accent }} />
                </div>
                {isSelected && (
                  <CheckIcon size={14} className="absolute top-1 left-1" style={{ color: preset.primary } as never} />
                )}
                <span className="text-[10px] text-[var(--vuno-text-muted)] leading-none text-center">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Personal Data — avatar, name, email, phone, password change
   ───────────────────────────────────────────────────────────────────────────── */

function PersonalDataCard({
  profile, onChange,
}: {
  profile: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة صالح');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ avatarUrl: reader.result as string });
      toast.success('تم تحديث الصورة الشخصية');
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = () => {
    if (!currentPass || !newPass || !confirmPass) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    if (newPass.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    toast.success('تم تغيير كلمة المرور بنجاح');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <SectionCard>
      <CardHeader icon={UserIcon} title="البيانات الشخصية" subtitle="اسمك، بريدك، ورقم هاتفك" />

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <ProfileIcon size={36} className="text-[var(--vuno-text-muted)]" />
          )}
        </div>
        <div>
          <label className="h-10 px-4 rounded-full inline-flex items-center gap-2 text-[14px] font-medium cursor-pointer transition-transform active:scale-95" style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}>
            <UploadIcon size={16} className="text-[var(--vuno-text-secondary)]" />
            <span className="text-[var(--vuno-text)]">تغيير الصورة</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
          {profile.avatarUrl && (
            <button
              type="button"
              onClick={() => onChange({ avatarUrl: undefined })}
              className="block mt-2 text-[13px] text-[var(--vuno-danger)] font-medium"
            >
              إزالة الصورة
            </button>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="grid sm:grid-cols-2 gap-4 mb-2">
        <Field label="الاسم الكامل" value={profile.name} onChange={v => onChange({ name: v })} placeholder="اسمك" />
        <Field label="البريد الإلكتروني" value={profile.email} onChange={v => onChange({ email: v })} type="email" placeholder="you@email.com" />
        <Field label="رقم الهاتف" value={profile.phone} onChange={v => onChange({ phone: v })} placeholder="01XXXXXXXXX" />
        <div>
          <label className="block text-[13px] font-medium text-[var(--vuno-text-secondary)] mb-1.5">الصلاحية</label>
          <div className="h-12 px-4 rounded-[10px] flex items-center text-[15px] text-[var(--vuno-text)] bg-[var(--vuno-bg)] border-[1.5px] border-[var(--vuno-border-light)]">
            {profile.role}
          </div>
        </div>
      </div>

      {/* Password change */}
      <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--vuno-border-light)' }}>
        <div className="flex items-center gap-2 mb-3">
          <LockIcon size={16} className="text-[var(--vuno-text-secondary)]" />
          <h3 className="text-[15px] font-semibold text-[var(--vuno-text)]">تغيير كلمة المرور</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="كلمة المرور الحالية" value={currentPass} onChange={setCurrentPass} type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
          <div className="hidden sm:block" />
          <Field label="كلمة المرور الجديدة" value={newPass} onChange={setNewPass} type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
          <Field label="تأكيد كلمة المرور" value={confirmPass} onChange={setConfirmPass} type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
          <div className="flex items-center gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="flex items-center gap-1.5 text-[13px] text-[var(--vuno-text-secondary)] font-medium"
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              {showPassword ? 'إخفاء' : 'إظهار'} كلمات المرور
            </button>
          </div>
          <button
            type="button"
            onClick={handleChangePassword}
            className="h-11 px-5 rounded-full self-start text-white font-semibold text-[15px] transition-transform active:scale-95 btn-primary-pill inline-flex items-center gap-2"
          >
            <CheckIcon size={18} />
            تحديث كلمة المرور
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Subscription — plan, renewal date, usage stats with progress bars
   ───────────────────────────────────────────────────────────────────────────── */

function UsageBar({ used, total, unit, label }: { used: number; total: number; unit: string; label: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const isHigh = pct >= 80;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-[var(--vuno-text)]">{label}</span>
        <span className="text-[12px] text-[var(--vuno-text-muted)] tabular-nums">
          {used} / {total} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--vuno-surface-pearl)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: isHigh ? 'var(--vuno-warning)' : 'var(--vuno-success)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function SubscriptionCard() {
  const sub = defaultSubscription;
  const statusMeta: Record<string, { label: string; color: string }> = {
    active: { label: 'مفعّل', color: 'var(--vuno-success)' },
    trial: { label: 'فترة تجريبية', color: 'var(--vuno-warning)' },
    expired: { label: 'منتهي', color: 'var(--vuno-danger)' },
  };
  const meta = statusMeta[sub.status] ?? statusMeta.active;

  return (
    <SectionCard>
      <CardHeader icon={CardIcon} title="الاشتراك والباقة" subtitle="خطة الاشتراك الحالية والاستخدام" />

      {/* Plan badge row */}
      <div
        className="rounded-[14px] p-4 mb-5"
        style={{ background: 'var(--vuno-surface-pearl)', border: '1px solid var(--vuno-border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold text-[var(--vuno-text)]">{sub.planName}</h3>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${meta.color}1A`, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            <p className="text-[13px] text-[var(--vuno-text-muted)] mt-1 flex items-center gap-1">
              <ClockIcon size={14} />
              تجديد في {formatEnglishDate(sub.renewalDate, false)}
            </p>
          </div>
          <div className="text-left">
            <span className="text-[22px] font-bold text-[var(--vuno-text)] tabular-nums">{sub.price}</span>
            <span className="text-[13px] text-[var(--vuno-text-muted)]"> ج.م / {sub.period}</span>
          </div>
        </div>
      </div>

      {/* Usage stats */}
      <div className="mb-5">
        <h4 className="text-[14px] font-semibold text-[var(--vuno-text)] mb-3">استخدام الباقة</h4>
        <div className="grid gap-4">
          {sub.usage.map(stat => (
            <UsageBar key={stat.label} used={stat.used} total={stat.total} unit={stat.unit} label={stat.label} />
          ))}
        </div>
      </div>

      {/* Upgrade button */}
      <button
        type="button"
        onClick={() => toast.info('سيتم توجيهك لصفحة الباقات قريباً')}
        className="w-full h-12 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 btn-primary-pill inline-flex items-center justify-center gap-2"
      >
        <CheckCircleIcon size={20} />
        ترقية الباقة
      </button>
    </SectionCard>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Main Profile Page
   ═════════════════════════════════════════════════════════════════════════════ */

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [branding, setBranding] = useState<StoreBranding>(defaultStoreBranding);

  const updateProfile = (patch: Partial<UserProfile>) => setProfile(prev => ({ ...prev, ...patch }));
  const updateBranding = (patch: Partial<StoreBranding>) => setBranding(prev => ({ ...prev, ...patch }));

  const handleSave = () => {
    toast.success('تم حفظ بيانات الملف الشخصي بنجاح');
  };

  const handleLogout = () => {
    toast.info('تسجيل الخروج');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between pt-2 pb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--vuno-surface-pearl)' }}>
            <ProfileIcon size={20} className="text-[var(--vuno-primary)]" />
          </div>
          <h1 className="text-[22px] font-bold text-[var(--vuno-text)] tracking-tight">الملف الشخصي</h1>
        </div>
      </motion.div>

      {/* Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid gap-4"
      >
        <StoreBrandingCard branding={branding} onChange={updateBranding} />
        <PersonalDataCard profile={profile} onChange={updateProfile} />
        <SubscriptionCard />

        {/* Save + logout */}
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-12 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 btn-primary-pill inline-flex items-center justify-center gap-2"
          >
            <CheckIcon size={20} />
            حفظ التغييرات
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="h-12 px-5 rounded-full font-semibold text-[15px] transition-transform active:scale-95 inline-flex items-center gap-2"
            style={{
              background: 'var(--vuno-surface)',
              border: '1px solid var(--vuno-border)',
              color: 'var(--vuno-danger)',
            }}
          >
            <LogoutIcon size={20} />
            خروج
          </button>
        </div>
      </motion.div>
    </div>
  );
}
