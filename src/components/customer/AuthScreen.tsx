'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const router = useRouter();
  const { currentUser, loginWithEmail, signupWithEmail, loginWithGoogle, updateUserProfile } = useStore();

  const [mode, setMode] = useState<'signin' | 'register' | 'onboarding'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Registration specific fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  
  const [passwordError, setPasswordError] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      if (!currentUser.phone || !currentUser.username || currentUser.phone === '') {
        setMode('onboarding');
      } else if (mode !== 'onboarding') {
        if (currentUser.role === 'admin') router.push('/admin'); else router.push('/account');
      }
    }
  }, [currentUser, router, mode]);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 5) score += 1;
    if (pwd.length > 7) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&]/.test(pwd)) score += 1;
    return score;
  };

  const validatePassword = (pwd: string) => {
    if (mode === 'signin') return true;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(pwd)) {
      setPasswordError('Password must be at least 8 characters, include an uppercase letter, a number, and a special character.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) return;
    
    setLoading(true);
    let success = false;
    if (mode === 'signin') {
      success = await loginWithEmail(email, password);
    } else {
      success = await signupWithEmail(fullName || 'New User', email, password, username, phone);
    }
    setLoading(false);

    if (success) {
      if (email.toLowerCase() === 'admin' || email.toLowerCase() === 'admin@gmail.com' || email.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      if (res.needsOnboarding) {
        setMode('onboarding');
      } else {
        router.push('/account');
      }
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) return;
    
    setLoading(true);
    updateUserProfile({ username, phone }); 
    setLoading(false);
    router.push('/account');
  };
  
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 bg-[#FAF9F6]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-sm p-8 sm:p-10 border border-stone-200 shadow-md space-y-8"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <button
            onClick={() => router.push('/')}
            className="group inline-flex flex-col items-center cursor-pointer"
          >
            <span className="font-serif-luxury text-4xl sm:text-5xl font-bold tracking-[0.2em] text-[#800020] group-hover:text-[#5c0017] transition-colors">
              DOOZY
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-semibold mt-1">
              Women's Clothing
            </span>
          </button>
        </div>

        {mode !== 'onboarding' && (
          <>
            {/* Social Authentication Buttons */}
            <div className="flex gap-4">
              <button
                id="google-signin-btn"
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={loading}
                className="w-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 py-3.5 px-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Or Use Email
              </span>
            </div>
          </>
        )}

        {/* Forms */}
        {mode === 'onboarding' ? (
          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">Username (Unique)</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="choose a username"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">Set Account Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {password.length > 0 && (
                <>
                  <div className="flex items-center gap-1 mt-1.5 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const score = getPasswordStrength(password);
                      let bgColor = 'bg-transparent';
                      if (level <= score) {
                        if (score <= 2) bgColor = 'bg-red-500';
                        else if (score <= 3) bgColor = 'bg-orange-400';
                        else if (score <= 4) bgColor = 'bg-green-500';
                        else bgColor = 'bg-green-500';
                      }
                      return <div key={level} className={`flex-1 h-full transition-colors duration-300 ${bgColor}`} />
                    })}
                  </div>
                  {getPasswordStrength(password) < 4 && (
                    <p className="text-[10px] text-stone-500 mt-1">We recommend a strong password (letters, numbers, & symbols).</p>
                  )}
                </>
              )}
              
              {passwordError && (
                <p className="text-[10px] text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] hover:bg-[#5c0017] text-white py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Processing...' : 'Complete Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">Username (Unique)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your email id"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (mode === 'register' && passwordError) validatePassword(e.target.value);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-sm text-xs text-stone-900 focus:outline-none focus:border-[#800020] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {mode === 'register' && password.length > 0 && (
                <>
                  <div className="flex items-center gap-1 mt-1.5 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const score = getPasswordStrength(password);
                      let bgColor = 'bg-transparent';
                      if (level <= score) {
                        if (score <= 2) bgColor = 'bg-red-500';
                        else if (score <= 3) bgColor = 'bg-orange-400';
                        else if (score <= 4) bgColor = 'bg-green-500';
                        else bgColor = 'bg-green-500';
                      }
                      return <div key={level} className={`flex-1 h-full transition-colors duration-300 ${bgColor}`} />
                    })}
                  </div>
                  {getPasswordStrength(password) < 4 && (
                    <p className="text-[10px] text-stone-500 mt-1">We recommend a strong password (letters, numbers, & symbols).</p>
                  )}
                </>
              )}
              
              {passwordError && mode === 'register' && (
                <p className="text-[10px] text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] hover:bg-[#5c0017] text-white py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode Toggle */}
        {mode !== 'onboarding' && (
          <div className="text-center text-xs text-stone-600">
            {mode === 'signin' ? (
              <button
                onClick={() => { setMode('register'); setPasswordError(''); }}
                className="font-bold text-[#800020] hover:underline cursor-pointer"
              >
                Create a new account (New user)
              </button>
            ) : (
              <button
                onClick={() => { setMode('signin'); setPasswordError(''); }}
                className="font-bold text-[#800020] hover:underline cursor-pointer"
              >
                Log in (Already has an account)
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
