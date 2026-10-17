import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeOffIcon, ArrowLeftIcon, LockIcon, StoreIcon } from '@/components/icons';
import type { LoginFormState } from '@/hooks/useLoginForm';

/**
 * The two layouts differ in a handful of details only; everything else is the
 * same form, so it lives here once.
 *  - mobile: plain fields, a lone "forgot password" link, fills the screen height
 *  - desktop: fields cross-fade between modes, "remember me" next to the link
 */
export type LoginFormVariant = 'mobile' | 'desktop';

interface LoginFormProps {
  form: LoginFormState;
  variant: LoginFormVariant;
}

const LABEL = 'block text-xs font-medium text-[var(--vuno-text-secondary)] mb-1.5';
const INPUT =
  'w-full px-4 py-3 rounded-xl border border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)] text-sm focus:border-[var(--vuno-primary)] transition-colors outline-none';
const INPUT_CENTERED = `${INPUT} text-center text-lg tracking-widest`;

function ForgotPasswordLink() {
  return (
    <button type="button" className="text-xs font-medium text-[var(--vuno-primary)] hover:underline">
      نسيت كلمة المرور؟
    </button>
  );
}

function OwnerFields({ form, variant }: LoginFormProps) {
  const { email, setEmail, password, setPassword, showPassword, setShowPassword, isSignUp } = form;
  return (
    <>
      <div>
        <label className={LABEL}>البريد الإلكتروني</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="example@email.com"
          className={INPUT}
          required
        />
      </div>
      <div>
        <label className={LABEL}>كلمة المرور</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${INPUT} pl-11`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)] p-1"
          >
            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
      </div>
      {isSignUp && (
        <div>
          <label className={LABEL}>تأكيد كلمة المرور</label>
          <input type="password" placeholder="••••••••" className={INPUT} required />
        </div>
      )}
      {!isSignUp &&
        (variant === 'desktop' ? (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-[var(--vuno-primary)]" />
              <span className="text-xs text-[var(--vuno-text-secondary)]">تذكرني</span>
            </label>
            <ForgotPasswordLink />
          </div>
        ) : (
          <div className="text-left">
            <ForgotPasswordLink />
          </div>
        ))}
    </>
  );
}

function EmployeeFields({ form, variant }: LoginFormProps) {
  const { branches, selectedBranch, setSelectedBranch, employeeCode, setEmployeeCode, password, setPassword } = form;
  const NoticeIcon = variant === 'desktop' ? StoreIcon : LockIcon;
  return (
    <>
      <div>
        <label className={LABEL}>الفرع</label>
        <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className={INPUT}>
          {branches
            .filter(b => b.status === 'active')
            .map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
        </select>
      </div>
      <div>
        <label className={LABEL}>كود الموظف</label>
        <input
          type="text"
          value={employeeCode}
          onChange={e => setEmployeeCode(e.target.value)}
          placeholder="أدخل كود الموظف"
          className={INPUT_CENTERED}
          required
        />
      </div>
      <div>
        <label className={LABEL}>{variant === 'desktop' ? 'الرقم السري (4 أرقام)' : 'الرقم السري'}</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••"
          maxLength={4}
          className={INPUT_CENTERED}
          required
        />
      </div>
      <div
        className="flex items-center gap-2 p-3 rounded-xl"
        style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)' }}
      >
        <NoticeIcon size={14} className="text-[var(--vuno-primary)] flex-shrink-0" />
        <p className="text-[11px] text-[var(--vuno-text-secondary)]">دخول الموظف يقتصر على نقطة البيع والفواتير فقط</p>
      </div>
    </>
  );
}

/** Wraps a mode's fields in a cross-fade (desktop only). */
function FadeIn({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {children}
    </motion.div>
  );
}

/** The sign-in / sign-up form, used by both the mobile and the desktop login layouts. */
export default function LoginForm({ form, variant }: LoginFormProps) {
  const { mode, isSignUp, loading, submit } = form;
  const fields =
    mode === 'owner' ? <OwnerFields form={form} variant={variant} /> : <EmployeeFields form={form} variant={variant} />;

  return (
    <form onSubmit={submit} className={variant === 'mobile' ? 'space-y-4 flex-1' : 'space-y-4'}>
      {variant === 'desktop' ? (
        <AnimatePresence mode="wait">
          <FadeIn id={mode === 'owner' ? 'owner-form' : 'employee-form'}>{fields}</FadeIn>
        </AnimatePresence>
      ) : (
        fields
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'var(--vuno-primary)' }}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري الدخول...
          </>
        ) : (
          <>
            {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            <ArrowLeftIcon size={16} />
          </>
        )}
      </button>
    </form>
  );
}
