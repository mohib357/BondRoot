import React, { useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/auth';
import { apiFetch, getApiBaseUrl, DEFAULT_LIVE_API_URL } from '../utils/api';
import {
  Network,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Crown,
  ArrowRight,
  Settings,
  RotateCcw,
  X,
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

  // Login form states with Remember Me pre-fill
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Pre-fill remembered identifier from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('bondroot_remembered_identifier');
    if (saved) {
      setIdentifier(saved);
      setRememberMe(true);
    }
  }, []);

  // Signup form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username availability validation states
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);

  // Debounced Username Check
  useEffect(() => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!clean || clean.length < 3) {
      setUsernameAvailable(null);
      setUsernameMsg(clean ? (isEnglish ? 'Username must be at least 3 chars' : 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।') : null);
      return;
    }

    setUsernameChecking(true);
    setUsernameMsg(null);
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameAvailable(true);
          setUsernameMsg(isEnglish ? 'Username available!' : 'ইউজারনেম খালি রয়েছে');
        } else {
          setUsernameAvailable(false);
          setUsernameMsg(data.error || (isEnglish ? 'Username taken' : 'এই ইউজারনেমটি ইতোমধ্যে ব্যবহৃত হয়েছে'));
        }
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, isEnglish]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Server URL settings state
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => getApiBaseUrl());

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiUrl.trim() && customApiUrl.trim() !== DEFAULT_LIVE_API_URL) {
      localStorage.setItem('bondroot_api_url', customApiUrl.trim());
    } else {
      localStorage.removeItem('bondroot_api_url');
    }
    setShowApiSettings(false);
    setErrorMsg(null);
  };

  const handleResetApiUrl = () => {
    localStorage.removeItem('bondroot_api_url');
    setCustomApiUrl(DEFAULT_LIVE_API_URL);
    setShowApiSettings(false);
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg(isEnglish ? 'Please enter Username/Email/Phone and password.' : 'ইউজারনেম/ইমেইল/ফোন ও পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Save or clear Remember Me
    if (rememberMe) {
      localStorage.setItem('bondroot_remembered_identifier', identifier.trim());
    } else {
      localStorage.removeItem('bondroot_remembered_identifier');
    }

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
        }, 400);
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
    if (!fullName.trim()) {
      setErrorMsg(isEnglish ? 'Full Name is required.' : 'পূর্ণ নাম দেওয়া আবশ্যক।');
      return;
    }

    if (!signupEmail.trim() && !signupPhone.trim()) {
      setErrorMsg(isEnglish ? 'At least one contact method (Email OR Phone Number) is required.' : 'কমপক্ষে একটি ইমেইল অথবা মোবাইল নম্বর দিতে হবে।');
      return;
    }

    if (usernameAvailable === false) {
      setErrorMsg(isEnglish ? 'Please choose an available username.' : 'সঠিক ও খালি ইউজারনেম নির্বাচন করুন।');
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
          username: username.trim() || undefined,
          email: signupEmail.trim() || undefined,
          phone_number: signupPhone.trim() || undefined,
          gender,
          password: signupPassword,
        }),
      });
      const data: AuthResponse = await res.json();
      if (data.success && data.user && data.token) {
        setSuccessMsg(isEnglish ? 'Account created successfully!' : 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        setTimeout(() => {
          onSuccess(data.user!, data.token!);
        }, 400);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-emerald-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 relative my-auto">
        
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
                ? 'Default Live Server: https://bondroot.onrender.com'
                : 'ডিফল্ট লাইভ সার্ভার: https://bondroot.onrender.com'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="https://bondroot.onrender.com"
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-hidden"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                {isEnglish ? 'Save' : 'সংরক্ষণ'}
              </button>
              <button
                type="button"
                onClick={handleResetApiUrl}
                title="Reset to Live Server"
                className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs hover:bg-slate-300 transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isEnglish ? 'Reset' : 'রিসেট'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab Switcher — Neumorphic Sliding Pill */}
        <div className="relative flex bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1.5 mx-4 mt-4 mb-0 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.06),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]">
          <div
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-white dark:bg-zinc-700 shadow-md transition-transform duration-200 ease-out"
            style={{ transform: tab === 'login' ? 'translateX(3px)' : 'translateX(calc(100% + 6px))' }}
          />
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`relative z-10 flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-colors duration-150 cursor-pointer ${
              tab === 'login'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            {isEnglish ? 'Sign In (লগইন)' : 'লগইন (Sign In)'}
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMsg(null); }}
            className={`relative z-10 flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-colors duration-150 cursor-pointer ${
              tab === 'signup'
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-500 dark:text-zinc-400'
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
                  {isEnglish ? 'Username, Email, or Phone' : 'ইউজারনেম / ইমেইল / ফোন নম্বর'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. muhibbul524@gmail.com / muhibbul524"
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
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded-md cursor-pointer"
                  />
                  <span>{isEnglish ? 'Remember Me' : 'মনে রাখুন'}</span>
                </label>
                <button
                  type="button"
                  onClick={fillSuperAdminCredentials}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline text-[11px] font-bold cursor-pointer"
                >
                  {isEnglish ? 'Forgot Password?' : 'পাসওয়ার্ড ভুলে গেছেন?'}
                </button>
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

              {/* Social Login Section (Sign In tab only) */}
              <div className="pt-3 space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
                  <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-black tracking-wider text-slate-400 dark:text-zinc-500 uppercase whitespace-nowrap">
                    OR CONTINUE WITH
                  </span>
                  <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleLogin}
                    title="Continue with Google"
                    className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={handleLogin}
                    title="Continue with Facebook"
                    className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-4.873-12-10.875-12S2.25 5.446 2.25 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H9.078v-3.47h3.297V9.43c0-3.253 1.934-5.05 4.901-5.05 1.42 0 2.903.254 2.903.254v3.193h-1.637c-1.611 0-2.114.998-2.114 2.023v2.428h3.601l-.575 3.47h-3.026v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* 1. Full Name */}
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

              {/* 2. Username with Real-Time Availability Validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {isEnglish ? 'Username' : 'ইউজারনেম'}
                  </label>
                  {usernameMsg && (
                    <span className={`text-[10px] font-bold ${usernameAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {usernameMsg}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs font-extrabold">@</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. muhibbul524"
                    className="w-full pl-8 pr-10 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {usernameChecking && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                    {!usernameChecking && usernameAvailable === true && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {!usernameChecking && usernameAvailable === false && <XCircle className="w-4 h-4 text-rose-500" />}
                  </div>
                </div>
              </div>

              {/* 3. Email & Phone Number (Flexible: at least 1 required) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Email Address' : 'ইমেইল এড্রেস'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Phone Number' : 'মোবাইল নম্বর'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+8801700000000"
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Gender (Segmented Radio) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {isEnglish ? 'Gender' : 'লিঙ্গ'}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      gender === 'male' ? 'bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {isEnglish ? 'Male' : 'পুরুষ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      gender === 'female' ? 'bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {isEnglish ? 'Female' : 'নারী'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('other')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      gender === 'other' ? 'bg-white dark:bg-zinc-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {isEnglish ? 'Other' : 'অন্যান্য'}
                  </button>
                </div>
              </div>

              {/* 5. Password & Confirm Password (Inputs with Eye Toggles) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Password' : 'পাসওয়ার্ড'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    {isEnglish ? 'Confirm Password' : 'পাসওয়ার্ড নিশ্চিত'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 6. Submit Button: Create Family Account */}
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
