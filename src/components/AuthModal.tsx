import React, { useState } from 'react';
import { User, AuthResponse } from '../types/auth';
import { apiFetch, getApiBaseUrl } from '../utils/api';
import {
  Network,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ArrowRight,
  Loader2,
  Crown,
  CheckCircle2,
  AlertCircle,
  X,
  Settings,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User, token: string) => void;
  lang?: 'bn' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Server URL settings state
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => getApiBaseUrl());

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiUrl.trim()) {
      localStorage.setItem('bondroot_api_url', customApiUrl.trim());
    } else {
      localStorage.removeItem('bondroot_api_url');
    }
    setShowApiSettings(false);
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg(isEnglish ? 'Please enter email/phone and password.' : 'ইমেইল/ফোন ও পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data: AuthResponse = await res.json();
      if (data.success && data.user && data.token) {
        setSuccessMsg(isEnglish ? 'Logged in successfully!' : 'লগইন সফল হয়েছে!');
        setTimeout(() => {
          onSuccess(data.user!, data.token!);
        }, 500);
      } else {
        setErrorMsg(data.error || (isEnglish ? 'Login failed.' : 'লগইন ব্যর্থ হয়েছে।'));
      }
    } catch {
      const activeUrl = getApiBaseUrl() || 'local server';
      setErrorMsg(isEnglish ? `Network error (${activeUrl}). Please check server connection.` : `নেটওয়ার্ক সমস্যা (${activeUrl})। সার্ভার সংযোগ ও ইন্টারনেট পরীক্ষা করুন।`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMsg(isEnglish ? 'Please fill in all required fields.' : 'সব প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMsg(isEnglish ? 'Passwords do not match.' : 'পাসওয়ার্ড দুটি মেলেনি।');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg(isEnglish ? 'Password must be at least 6 characters.' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: signupEmail.trim(),
          phone_number: signupPhone.trim() || undefined,
          password: signupPassword,
        }),
      });
      const data: AuthResponse = await res.json();
      if (data.success && data.user && data.token) {
        setSuccessMsg(isEnglish ? 'Account created successfully!' : 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        setTimeout(() => {
          onSuccess(data.user!, data.token!);
        }, 500);
      } else {
        setErrorMsg(data.error || (isEnglish ? 'Signup failed.' : 'নিবন্ধনে সমস্যা হয়েছে।'));
      }
    } catch {
      const activeUrl = getApiBaseUrl() || 'local server';
      setErrorMsg(isEnglish ? `Network error (${activeUrl}). Please check server connection.` : `নেটওয়ার্ক সমস্যা (${activeUrl})। সার্ভার সংযোগ ও ইন্টারনেট পরীক্ষা করুন।`);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Super Admin Fill for developer
  const fillSuperAdminCredentials = () => {
    setTab('login');
    setIdentifier('muhibbul524@gmail.com');
    setPassword('Admin@123');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Top Hero Brand Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 text-white text-center">
          <button
            type="button"
            onClick={() => setShowApiSettings(!showApiSettings)}
            title="Configure API Server URL"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white shadow-lg mb-3 border border-white/20">
            <Network className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">BondRoot</h2>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            {isEnglish
              ? 'Secure Family Lineage & Private Kinship Portal'
              : 'সুরক্ষিত পারিবারিক বংশলতিকা ও আত্মীয়তা পোর্টাল'}
          </p>
        </div>

        {/* API Server Configuration Settings (Drawer / Collapsible) */}
        {showApiSettings && (
          <form onSubmit={handleSaveApiUrl} className="p-4 bg-amber-50 dark:bg-zinc-800/90 border-b border-amber-200 dark:border-zinc-700 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-zinc-200">
              <span>{isEnglish ? 'API Server URL Configuration' : 'সার্ভার আইপি / ইউআরএল সেটিংস'}</span>
              <button
                type="button"
                onClick={() => setShowApiSettings(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {isEnglish
                ? 'Default for Android emulator is http://10.0.2.2:3000. Set custom IP for physical devices.'
                : 'অ্যান্ড্রয়েড এমুলেটরের জন্য ডিফল্ট http://10.0.2.2:3000। রিয়েল ফোনের জন্য পিসির IP সেট করুন।'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="http://10.0.2.2:3000 or http://192.168.1.100:3000"
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-hidden"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                {isEnglish ? 'Save' : 'সংরক্ষণ'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition cursor-pointer ${
              tab === 'login'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {isEnglish ? 'Sign In (লগইন)' : 'লগইন (Sign In)'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-2xl transition cursor-pointer ${
              tab === 'signup'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {isEnglish ? 'Create Account (নিবন্ধন)' : 'নতুন অ্যাকাউন্ট (Sign Up)'}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-start space-x-2 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {isEnglish ? 'Email or Phone Number' : 'ইমেইল অথবা মোবাইল নম্বর'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. muhibbul524@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {isEnglish ? 'Password' : 'পাসওয়ার্ড'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isEnglish ? 'Sign In to Family Portal' : 'পারিবারিক পোর্টালে প্রবেশ করুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {isEnglish ? 'Full Name' : 'পূর্ণ নাম'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. তানভীর চৌধুরী / Muhibbul Islam"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Email' : 'ইমেইল'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Phone (Optional)' : 'মোবাইল নম্বর'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+88017..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Password' : 'পাসওয়ার্ড'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isEnglish ? 'Create Family Account' : 'পারিবারিক অ্যাকাউন্ট খুলুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 1-Click Developer Super Admin Shortcut */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
            <button
              type="button"
              onClick={fillSuperAdminCredentials}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 text-[11px] font-bold transition shadow-2xs cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEnglish ? 'Developer Super Admin Fast Login' : '👑 সুপার অ্যাডমিন দ্রুত লগইন (1-Click)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
