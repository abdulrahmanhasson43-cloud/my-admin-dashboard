interface SignUpToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
}

/** "Already have an account? / No account?" line under the form (owner mode only). */
export default function SignUpToggle({ isSignUp, onToggle }: SignUpToggleProps) {
  return (
    <p className="text-center text-[var(--vuno-text-muted)] mt-5 text-sm">
      {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}{' '}
      <button onClick={onToggle} className="text-[var(--vuno-primary)] font-semibold hover:underline">
        {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب'}
      </button>
    </p>
  );
}
