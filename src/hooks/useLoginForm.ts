import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/context/auth-context-value';

export type LoginMode = 'owner' | 'employee';

const SIMULATED_AUTH_DELAY_MS = 600;

/**
 * useLoginForm — everything the login screen remembers and does, shared by the
 * mobile and desktop layouts so the two can never drift apart.
 *
 * TODO(phase-3): `submit` only simulates authentication (any input signs in);
 * replace the timeout and `signIn()` with the real sign-in call.
 */
export function useLoginForm() {
  const navigate = useNavigate();
  const { branches } = useBranches();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<LoginMode>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signIn();
      navigate('/dashboard');
    }, SIMULATED_AUTH_DELAY_MS);
  };

  const title = isSignUp ? 'إنشاء حساب' : mode === 'owner' ? 'تسجيل الدخول' : 'دخول الموظف';
  const subtitle = isSignUp
    ? 'ابدأ رحلتك مع فونو'
    : mode === 'owner'
      ? 'أدخل بياناتك للوصول للوحة التحكم'
      : 'أدخل كود الموظف والفرع';

  return {
    mode, setMode,
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    isSignUp, setIsSignUp,
    employeeCode, setEmployeeCode,
    selectedBranch, setSelectedBranch,
    loading,
    branches,
    submit,
    title,
    subtitle,
    goHome: () => navigate('/'),
  };
}

export type LoginFormState = ReturnType<typeof useLoginForm>;
