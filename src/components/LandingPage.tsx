import React, { useState } from 'react';
import {
  Network,
  GitFork,
  Sparkles,
  MessageSquare,
  Shield,
  ArrowRight,
  Heart,
  Globe,
  Sun,
  Moon,
  LogIn,
  Users,
  Compass,
  Award,
  Calendar,
  CheckCircle2,
  Lock,
  ChevronDown,
  UserPlus,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onExploreDemo: () => void;
  onOpenDeveloperAbout?: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreDemo,
  onOpenDeveloperAbout,
  lang,
  onToggleLang,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const isEnglish = lang === 'en';

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreDemo();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors relative overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">

      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Floating Glass Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-emerald-100 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Network className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                BondRoot
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 ml-2 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {isEnglish ? 'Genealogy' : 'বংশলতিকা'}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
              className="p-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isEnglish ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Login CTA */}
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isEnglish ? 'Sign In / Sign Up' : 'লগইন / সাইনআপ'}</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">

        {/* Badge Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold shadow-2xs mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>
            {isEnglish
              ? '★ Digital Vault for Ancestral Roots & Kinship Bonds'
              : '★ আপনার পারিবারিক শিকড় ও সম্পর্কের ডিজিটাল মহাফেজখানা'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-tight sm:leading-none">
          {isEnglish ? (
            <>
              Preserve Your Family Lineage &{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 bg-clip-text text-transparent">
                Kinship Bonds Forever
              </span>
            </>
          ) : (
            <>
              BondRoot — আপনার পারিবারিক শিকড় ও{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 bg-clip-text text-transparent">
                সম্পর্কের ডিজিটাল মহাফেজখানা
              </span>
            </>
          )}
        </h1>

        {/* Hero Description */}
        <p className="mt-6 text-sm sm:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl font-medium leading-relaxed">
          {isEnglish
            ? 'A modern genealogy platform designed to preserve Bengali family heritage, trace ancestral roots across generations, calculate exact respectful calling terms, and keep family memories safe in a lifetime digital vault.'
            : 'বাঙালি সমৃদ্ধ পারিবারিক সংস্কৃতি, বংশানুক্রমিক রক্তের সামাজিক বন্ধন এবং প্রজন্মের পর প্রজন্ম ধরে পূর্বপুরুষদের অমূল্য স্মৃতি ও পরিচয় সযতনে সংরক্ষণ করার জন্য নির্মিত বিশেষ প্ল্যাটফর্ম।'}
        </p>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-xl shadow-emerald-600/25 active:scale-98 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isEnglish ? 'Sign In / Sign Up to Portal' : '🟢 পোর্টালে প্রবেশ / সাইনআপ করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={scrollToFeatures}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-extrabold text-sm border border-slate-300 dark:border-zinc-700 shadow-md active:scale-98 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isEnglish ? 'Explore Features & Demo' : '⚪ ডেমো বা ফিচার এক্সপ্লোর করুন'}</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-bold text-slate-500 dark:text-zinc-400">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isEnglish ? '100% Private & Encrypted' : '১০০% গোপনীয় ও সুরক্ষিত'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-4 h-4 text-teal-600" />
            <span>{isEnglish ? 'Multi-Generational Tree' : 'বহু-প্রজন্মীয় বংশলতিকা'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{isEnglish ? 'Gemini AI Kinship Logic' : 'জেমিনাই AI আত্মীয়তা লজিক'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>{isEnglish ? 'PWA & Android Support' : 'অ্যান্ড্রয়েড ও ওয়েব সমর্থিত'}</span>
          </div>
        </div>

      </section>

      {/* Feature Highlights Grid Section */}
      <section id="features-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isEnglish ? 'Core Platform Features' : 'প্রধান ফিচার শোকেস'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 font-medium">
            {isEnglish
              ? 'Everything you need to preserve, trace, and interact with your ancestral heritage.'
              : 'আপনার পারিবারিক ইতিহাস, রক্তের সম্পর্ক ও স্মৃতি এক জায়গায় ফ্রেমবন্দি করার আধুনিক ফিচারসমূহ।'}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Feature 1: Interactive Family Tree */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <GitFork className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEnglish ? '1. Interactive Family Tree' : '🌳 ১. ভিজ্যুয়াল বংশলতিকা (Interactive Family Tree)'}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                {isEnglish
                  ? 'Multi-generational interactive family tree with root ancestor isolation, smooth zoom-pan navigation, and clear branch-by-branch generational hierarchy.'
                  : 'বহু-প্রজন্মের ইন্টারেক্টিভ বংশলতিকা, রুট অ্যানসেস্টর আইসোলেশন, স্মুথ জুম-প্যান নেভিগেশন এবং শাখা অনুযায়ী বংশানুক্রমের স্পষ্ট ভিজ্যুয়াল রূপরেখা।'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <span>{isEnglish ? 'Branch View & Zoom' : 'জুম, প্যান ও রুট ফিল্টার'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Feature 2: Gemini AI Kinship */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEnglish ? '2. Gemini AI Kinship Calculation' : '🤖 ২. AI আত্মীয়তা ও সম্বোধন নির্ণয় (Gemini AI)'}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                {isEnglish
                  ? 'Calculates exact blood kinship traversal paths between any two relatives and determines respectful Bengali calling terms (e.g., Younger Brother, Paternal Cousin).'
                  : 'যেকোনো দুই সদস্যের রক্তের যোগসূত্র ও জটিল আত্মীয়তার নিখুঁত গ্রাফ ট্রাভার্সাল এবং সামনাসামনি ডাকার সঠিক ও মিষ্টি বাংলা সম্বোধন নির্ধারণ (যেমন: স্নেহের ছোট ভাই, ফুফাতো বোন)।'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-bold">
              <span>{isEnglish ? 'Kinship Finder & Calling Terms' : 'গ্রাফ ট্রাভার্সাল ও সম্মোধন'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Feature 3: Family Chat & Memory Vault */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-teal-500/50 transition duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <MessageSquare className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEnglish ? '3. Family Chat & Memory Vault' : '💬 ৩. পারিবারিক চ্যাট ও স্মৃতি ভল্ট (Family Vault)'}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                {isEnglish
                  ? 'Private in-app messaging between family members and encrypted cloud storage for old photos, birth records, and lifetime family memories.'
                  : 'পরিবারের সদস্যদের মধ্যে ব্যক্তিগত নিরাপদ বার্তা আদান-প্রদান এবং ফটো মেমোরি ভল্টে পুরোনো ও নতুন ছবি আজীবন অক্ষুণ্ন রাখা।'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-teal-700 dark:text-teal-400 font-bold">
              <span>{isEnglish ? 'In-App Messages & Photos' : 'সিকিউর চ্যাট ও ফটো গ্যালারি'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Feature 4: Cloud Sync & Security */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEnglish ? '4. Lifetime Cloud Sync & Privacy' : '🛡️ ৪. সম্পূর্ণ নিরাপদ ও ক্লাউড সিঙ্ক (Neon Storage)'}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                {isEnglish
                  ? 'Serverless Neon PostgreSQL cloud synchronization, offline caching, and individual privacy controls to keep your family lineage 100% private.'
                  : 'ক্লাউড সার্ভারলেস ডাটাবেজ সিঙ্ক, এনক্রিপ্টেড ব্যাকআপ এবং ব্যক্তিনির্দিষ্ট প্রাইভেসি কন্ট্রোল যা আপনার পারিবারিক তথ্য রাখে সম্পূর্ণ নিরাপদ।'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold">
              <span>{isEnglish ? 'Encrypted PostgreSQL Storage' : 'সার্ভারলেস ক্লাউড সেফটি'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>

      </section>

      {/* Why BondRoot? Section */}
      <section className="py-16 bg-gradient-to-b from-emerald-900 via-teal-950 to-emerald-950 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isEnglish ? 'Mission & Values' : 'উদ্দেশ্য ও মূল্যবোধ'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              {isEnglish ? 'Why Choose BondRoot?' : 'কেন BondRoot ব্যবহার করবেন?'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-2">
              {isEnglish
                ? 'Bringing families closer together in a fast-changing modern world.'
                : 'ব্যস্ত আধুনিক জীবনে হারিয়ে যাওয়া পারিবারিক শিকড় ও ঐতিহ্যকে ধরে রাখার ডিজিটাল প্রয়াস।'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Value 1 */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                ১
              </div>
              <h3 className="text-base font-bold text-emerald-200">
                {isEnglish ? 'Reviving Lost Connections' : 'হারিয়ে যাওয়া আত্মীয়তার পুনরুজ্জীবন'}
              </h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                {isEnglish
                  ? 'Reconnect distant relatives and cousins who have scattered across cities and countries into a single shared digital tree.'
                  : 'আধুনিক জীবনযাত্রায় দূরে সরে যাওয়া আত্মীয়-স্বজন ও কাজিনদের আবার একই পরিচিত পারিবারিক সীমানায় যুক্ত করা।'}
              </p>
            </div>

            {/* Value 2 */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black">
                ২
              </div>
              <h3 className="text-base font-bold text-teal-200">
                {isEnglish ? 'Connecting Youth to Roots' : 'নতুন প্রজন্মকে শিকড়ের সাথে পরিচয়'}
              </h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                {isEnglish
                  ? 'Help young family members learn about their ancestors, lineage background, and respectful Bengali family protocols.'
                  : 'ছোটদের ও নতুন প্রজন্মকে রক্তের সম্পর্ক, পূর্বপুরুষের পরিচয় এবং পারিবারিক আদব-কায়দা ও সম্মোধনের সাথে পরিচয় করানো।'}
              </p>
            </div>

            {/* Value 3 */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black">
                ৩
              </div>
              <h3 className="text-base font-bold text-amber-200">
                {isEnglish ? 'Digital Memory Preservation' : 'জীবন্ত স্মৃতির ডিজিটাল ফ্রেম'}
              </h3>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                {isEnglish
                  ? 'Keep marriage records, milestone events, and generational photographs safe for generations to come.'
                  : 'জন্ম, বিয়ে, পারিবারিক অনুষ্ঠান ও স্মরণীয় স্মৃতির ছবিগুলোকে আজীবন অক্ষুণ্ন ও সুরক্ষিত রাখা।'}
              </p>
            </div>

          </div>

          {/* Bottom CTA on Why Section */}
          <div className="mt-12 text-center">
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition cursor-pointer"
            >
              <span>{isEnglish ? 'Start Building Your Family Tree' : 'আপনার বংশলতিকা তৈরি শুরু করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer & Developer Intro Section */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Left Footer Info */}
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">BondRoot Platform</p>
              <p className="text-[11px] text-slate-500">
                {isEnglish
                  ? 'Digital Ancestral Vault & Kinship Graph Engine'
                  : 'পারিবারিক রক্তের সম্পর্ক ও বংশলতিকা সংরক্ষণের ডিজিটাল প্ল্যাটফর্ম'}
              </p>
            </div>
          </div>

          {/* Center Developer Badge */}
          <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-slate-200">Lead Architect & Creator:</strong> Muhibbul Islam
            </span>
            {onOpenDeveloperAbout && (
              <button
                onClick={onOpenDeveloperAbout}
                className="text-emerald-400 hover:underline font-bold ml-1"
              >
                {isEnglish ? 'Contact' : 'যোগাযোগ'}
              </button>
            )}
          </div>

          {/* Right Copyright */}
          <div className="text-center md:text-right text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} BondRoot. All rights reserved.</p>
            <p className="mt-0.5 text-emerald-400/80">Preserve Your Roots • Build Your Legacy</p>
          </div>

        </div>
      </footer>

    </div>
  );
};
