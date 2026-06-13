import { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    if (email === 'admin@packsy.com' && password === 'admin123') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onLogin();
      }, 1000);
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F5C443] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 16-9 5-9-5" /><path d="m21 8-9 5-9-5" />
              <line x1="12" x2="12" y1="13" y2="21" />
              <polyline points="3 8 12 3 21 8" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">Packsy Admin</h1>
          <p className="text-[#8E8E93] text-sm mt-1">لوحة تحكم المشرف</p>
        </div>

        {/* Card */}
        <div className="bg-[#2C2C2E] rounded-2xl p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[#8E8E93] text-xs font-medium mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="admin@packsy.com"
              className="w-full bg-[#3A3A3C] text-white text-sm rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#F5C443] transition-colors placeholder:text-[#636366]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#8E8E93] text-xs font-medium mb-2">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className="w-full bg-[#3A3A3C] text-white text-sm rounded-xl px-4 py-3 pr-12 outline-none border border-transparent focus:border-[#F5C443] transition-colors placeholder:text-[#636366]"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636366] hover:text-[#8E8E93]"
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" x2="23" y1="1" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#FF5757] text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Button */}
          <motion.button
            onClick={handleLogin}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full bg-[#F5C443] text-[#1C1C1E] font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                جارٍ الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </motion.button>
        </div>

        {/* Hint */}
        <p className="text-center text-[#636366] text-xs mt-4">
          admin@packsy.com / admin123
        </p>
      </motion.div>
    </div>
  );
}
