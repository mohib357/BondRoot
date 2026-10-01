import React from 'react';
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
  CheckCircle2,
  Lock,
  ChevronRight,
  Award,
  Layers,
  UserPlus,
  Play,
  Share2,
} from 'lucide-react';

import { PublicModalType } from './PublicLegalModal';
import { FeatureSpotlightKey } from './FeatureSpotlightModal';

interface LandingPageProps {
  onOpenAuth: () => void;
  onExploreDemo: () => void;
  onOpenDeveloperAbout?: () => void;
  onOpenLegal?: (type: PublicModalType) => void;
  onOpenFeatureSpotlight?: (key: FeatureSpotlightKey) => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreDemo,
  onOpenDeveloperAbout,
  onOpenLegal,
  onOpenFeatureSpotlight,
  lang,
  onToggleLang,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const isEnglish = lang === 'en';

  const scrollToDemo = () => {
    const el = document.getElementById('demo-tree-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreDemo();
    }
  };

  // ── TEST: Real-time deploy verification (remove after confirmed) ──
  const [deployInfo, setDeployInfo] = React.useState<{ server_started_at?: string; message?: string } | null>(null);
  React.useEffect(() => {
    fetch('/api/test/deploy-ping')
      .then(r => r.json())
      .then(d => setDeployInfo(d))
      .catch(() => setDeployInfo({ message: '❌ Server ping failed' }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors relative overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── TEST BANNER — real-time deploy check (remove after confirmed) ── */}
      {deployInfo && (
        <div className="w-full bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-bold text-center py-2 px-4 z-50">
          {deployInfo.message}
          {deployInfo.server_started_at && (
            <span className="ml-2 opacity-80">
              Server চালু হয়েছে: {new Date(deployInfo.server_started_at).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}
            </span>
          )}
        </div>
      )}

      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* 1. Header (Clean & Premium) */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo + Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 border border-white/20">
              <Network className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 dark:from-amber-300 dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
              BondRoot
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
              className="p-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 transition cursor-pointer neu-button"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-2xs cursor-pointer neu-button"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isEnglish ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Login Button */}
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-95 rounded-xl shadow-md shadow-emerald-700/20 dark:shadow-emerald-900/40 transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isEnglish ? 'Login' : 'লগইন'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section (Styled as a Grand Hero Texture Card) */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] bg-lineage-pattern border border-emerald-200/70 dark:border-emerald-900/60 shadow-2xl shadow-emerald-500/5 dark:shadow-emerald-900/20 neu-panel relative overflow-hidden text-center flex flex-col items-center">

          {/* Ambient Glowing Background Orbs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-400/10 dark:bg-amber-400/12 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/05 dark:bg-teal-400/08 rounded-full blur-3xl pointer-events-none" />

          {/* Genealogical Branch SVG Overlay — more intricate */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl sm:rounded-[2.5rem]">
            <svg className="absolute w-full h-full opacity-[0.07] dark:opacity-[0.13]" viewBox="0 0 900 480" fill="none" preserveAspectRatio="xMidYMid slice">
              {/* Main trunk */}
              <path d="M 450 480 L 450 280" stroke="#10B981" strokeWidth="2.5" />
              {/* Primary branches */}
              <path d="M 450 280 Q 300 240 180 200" stroke="#10B981" strokeWidth="2" strokeDasharray="5 4" />
              <path d="M 450 280 Q 600 240 720 200" stroke="#10B981" strokeWidth="2" strokeDasharray="5 4" />
              {/* Secondary branches left */}
              <path d="M 180 200 Q 110 170 60 140" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 5" />
              <path d="M 180 200 Q 200 165 230 130" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 5" />
              {/* Secondary branches right */}
              <path d="M 720 200 Q 790 170 840 140" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 5" />
              <path d="M 720 200 Q 700 165 670 130" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 5" />
              {/* Tertiary left-left */}
              <path d="M 60 140 Q 30 110 20 80" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              <path d="M 60 140 Q 80 110 100 80" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              {/* Tertiary left-right */}
              <path d="M 230 130 Q 210 100 200 65" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              <path d="M 230 130 Q 260 100 280 70" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              {/* Tertiary right-left */}
              <path d="M 670 130 Q 640 100 620 70" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              <path d="M 670 130 Q 690 100 700 65" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              {/* Tertiary right-right */}
              <path d="M 840 140 Q 820 110 800 80" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              <path d="M 840 140 Q 870 110 880 80" stroke="#14B8A6" strokeWidth="1" strokeDasharray="3 5" />
              {/* Central root node */}
              <circle cx="450" cy="280" r="6" fill="#10B981" />
              {/* Level-1 nodes */}
              <circle cx="180" cy="200" r="5" fill="#10B981" />
              <circle cx="720" cy="200" r="5" fill="#10B981" />
              {/* Level-2 nodes */}
              <circle cx="60" cy="140" r="4" fill="#F59E0B" />
              <circle cx="230" cy="130" r="4" fill="#F59E0B" />
              <circle cx="670" cy="130" r="4" fill="#F59E0B" />
              <circle cx="840" cy="140" r="4" fill="#F59E0B" />
              {/* Level-3 nodes */}
              <circle cx="20"  cy="80"  r="3" fill="#14B8A6" />
              <circle cx="100" cy="80"  r="3" fill="#14B8A6" />
              <circle cx="200" cy="65"  r="3" fill="#14B8A6" />
              <circle cx="280" cy="70"  r="3" fill="#14B8A6" />
              <circle cx="620" cy="70"  r="3" fill="#14B8A6" />
              <circle cx="700" cy="65"  r="3" fill="#14B8A6" />
              <circle cx="800" cy="80"  r="3" fill="#14B8A6" />
              <circle cx="880" cy="80"  r="3" fill="#14B8A6" />
            </svg>

            {/* Subtle noise/grain texture overlay (SVG filter) */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.025] dark:opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <filter id="heroNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#heroNoise)" />
            </svg>
          </div>

          {/* Card Content Layer */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Brand Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 text-xs font-extrabold shadow-2xs mb-5 animate-in fade-in duration-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 dark:from-amber-300 dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent font-black">
                BondRoot
              </span>
            </div>

            {/* Powerful Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl leading-snug sm:leading-tight">
              {isEnglish ? (
                <>Your Family Story, Relationships & Lineage — All in One Place</>
              ) : (
                <>“আপনার পরিবারের গল্প, সম্পর্ক ও বংশলতিকা—এক জায়গায়”</>
              )}
            </h1>

            {/* Meaningful Subtitle */}
            <p className="mt-4 text-xs sm:text-base text-slate-600 dark:text-zinc-300 max-w-2xl font-medium leading-relaxed">
              {isEnglish
                ? 'Preserve, discover, and pass down your family connections across generations for the future.'
                : 'প্রজন্ম থেকে প্রজন্মে আপনার পরিবারের সম্পর্ক সংরক্ষণ করুন, খুঁজে বের করুন এবং ভবিষ্যৎ প্রজন্মের জন্য রেখে যান।'}
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              {/* Primary CTA */}
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl text-white font-black text-sm active:scale-98 transition cursor-pointer neu-btn-primary shadow-lg shadow-emerald-600/20"
              >
                <span>{isEnglish ? '🌳 Get Started — Free' : '🌳 শুরু করুন — বিনামূল্যে'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={scrollToDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl active:scale-98 transition cursor-pointer neu-btn-secondary"
              >
                <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                <span>{isEnglish ? 'View Demo Family' : '▶ ডেমো পরিবার দেখুন'}</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Family Tree Visual Preview */}
      <section id="demo-tree-preview" className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl neu-panel relative overflow-hidden">

          {/* Section Badge */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                {isEnglish ? 'Interactive Family Lineage Graph Preview' : 'বংশলতিকা ও সম্পর্কের ভিজ্যুয়াল ডেমো'}
              </h3>
            </div>
            <button
              onClick={onExploreDemo}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isEnglish ? 'Open Interactive Mode' : 'ইন্টারেক্টিভ ডেমো খুলুন'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sample Lineage Hierarchy Tree */}
          <div className="flex flex-col items-center space-y-6 text-xs sm:text-sm">

            {/* Generation 1: Grandparents */}
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-zinc-800 dark:to-zinc-800/90 border border-emerald-300 dark:border-emerald-700/80 font-bold text-slate-900 dark:text-white shadow-xs neu-button text-center">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                  {isEnglish ? 'Grandparents' : '১ম প্রজন্ম (দাদা / দাদি)'}
                </span>
                <span>মুহম্মদ আব্দুর রহিম (১৯৩৫)</span>
              </div>
            </div>

            {/* Connector Line */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-400 to-teal-600" />

            {/* Generation 2: Parents & Uncles */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-slate-800 dark:text-zinc-200 shadow-2xs text-center neu-button">
                <span className="text-[10px] text-teal-600 dark:text-teal-400 block font-semibold">
                  {isEnglish ? 'Father' : 'বাবা'}
                </span>
                <span>আব্দুল্লাহ হোসেন</span>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-slate-800 dark:text-zinc-200 shadow-2xs text-center neu-button">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">
                  {isEnglish ? 'Uncle' : 'চাচা'}
                </span>
                <span>আব্দুর রহমান</span>
              </div>
            </div>

            {/* Connector Line */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-teal-500 to-emerald-600" />

            {/* Generation 3: Children / Cousins */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 font-extrabold text-emerald-950 dark:text-emerald-200 shadow-xs text-center neu-button">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">
                  {isEnglish ? 'You' : 'সদস্য A'}
                </span>
                <span>তানভীর চৌধুরী (১৯৯৮)</span>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-700 font-extrabold text-teal-950 dark:text-teal-200 shadow-xs text-center neu-button">
                <span className="text-[10px] text-teal-700 dark:text-teal-300 block">
                  {isEnglish ? 'Cousin' : 'সদস্য B'}
                </span>
                <span>কামাল হোসেন (২০০২)</span>
              </div>
            </div>

          </div>

          {/* Relationship Calculation Example Card */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 dark:from-zinc-800/90 dark:via-zinc-800 dark:to-zinc-800/90 border border-amber-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs neu-inset">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white block text-xs sm:text-sm">
                  {isEnglish ? 'Tanvir ↔ Kamal Hossain' : '“তানভীর ↔ কামাল হোসেন”'}
                </span>
                <span className="text-slate-600 dark:text-zinc-300 font-medium">
                  {isEnglish
                    ? 'Paternal Cousin (Son of grandfather’s brother\'s son) | Calling: Younger Brother'
                    : '“দাদার ভাইয়ের ছেলের ছেলে (চাচাতো ভাই) | সম্বোধন: স্নেহের ছোট ভাই”'}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] shrink-0">
              {isEnglish ? 'Auto Calculated' : 'স্বয়ংক্রিয় সম্পর্ক নির্ণয়'}
            </span>
          </div>

        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
            {isEnglish ? 'Core Platform Features' : 'প্রধান ফিচারসমূহ'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">
            {isEnglish
              ? 'Everything required to preserve, discover, and organize your lineage.'
              : 'পারিবারিক রক্তসম্পর্ক ও ইতিহাস সুসংগঠিত রাখার প্রয়োজনীয় চার মূল ফিচার।'}
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Interactive Family Tree */}
          <div
            onClick={() => onOpenFeatureSpotlight?.('tree')}
            className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-lg hover:border-emerald-500/60 transition duration-150 flex flex-col justify-between neu-button group cursor-pointer"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
                <GitFork className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEnglish ? 'Interactive Family Tree' : '🌳 ভিজ্যুয়াল বংশলতিকা'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {isEnglish
                  ? 'Multi-generational interactive family tree with root ancestor filtering and clear generational hierarchy.'
                  : 'বহু-প্রজন্মের ইন্টারেক্টিভ ট্রি, রুট অ্যানসেস্টর ফিল্টারিং এবং স্পষ্ট সম্পর্কচিত্র।'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <span>{isEnglish ? 'Interactive Tree' : 'ইন্টারেক্টিভ ট্রি'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Smart Relationship Finder */}
          <div
            onClick={() => onOpenFeatureSpotlight?.('kinship')}
            className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-lg hover:border-purple-500/60 transition duration-150 flex flex-col justify-between neu-button group cursor-pointer"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-3">
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEnglish ? 'Smart Relationship Finder' : '🧬 স্মার্ট সম্পর্ক নির্ণয়'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {isEnglish
                  ? 'Instant graph traversal for blood/marital relations and exact respectful calling terms.'
                  : 'যেকোনো দুই সদস্যের রক্তের বা বৈবাহিক সম্পর্কের যোগসূত্র এবং সামনাসামনি ডাকার সঠিক সম্বোধন।'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-400">
              <span>{isEnglish ? 'Relationship Graph' : 'সম্পর্ক ট্রাভার্সাল'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Family Vault */}
          <div
            onClick={() => onOpenFeatureSpotlight?.('vault')}
            className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-lg hover:border-teal-500/60 transition duration-150 flex flex-col justify-between neu-button group cursor-pointer"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEnglish ? 'Family Vault & Chat' : '🔐 পারিবারিক মেমোরি ভল্ট'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {isEnglish
                  ? 'Private member messaging, milestone events, and encrypted storage for family photographs.'
                  : 'পরিবারের গোপনীয় বার্তা, স্মরণীয় ঘটনা এবং জীবনবৃত্তান্ত নিরাপদে সংরক্ষণ।'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-teal-700 dark:text-teal-400">
              <span>{isEnglish ? 'Secure Storage' : 'নিরাপদ ভল্ট'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Privacy First */}
          <div
            onClick={() => onOpenFeatureSpotlight?.('privacy')}
            className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-lg hover:border-amber-500/60 transition duration-150 flex flex-col justify-between neu-button group cursor-pointer"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEnglish ? 'Privacy First Protection' : '🛡️ সম্পূর্ণ প্রাইভেসি ফার্স্ট'}
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {isEnglish
                  ? 'Complete control over individual profile visibility and lifetime lineage security.'
                  : 'আপনার পারিবারিক তথ্যের সম্পূর্ণ নিয়ন্ত্রণ এবং আজীবন সুরক্ষার নিশ্চয়তা।'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <span>{isEnglish ? 'Encrypted Security' : 'ব্যক্তিগত গোপনীয়তা'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>

      </section>

      {/* 5. Relationship Finder Value Highlight Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-2xl relative overflow-hidden neu-panel">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                {isEnglish ? 'Intelligent Kinship Graph Engine' : 'স্মার্ট আত্মীয়তা অ্যালগরিদম'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black">
                {isEnglish
                  ? 'Select Any 2 Members to Trace Their Kinship Path'
                  : '“যেকোনো দুইজন সদস্য নির্বাচন করুন এবং তাদের মধ্যকার পারিবারিক সম্পর্ক ও সম্পূর্ণ সম্পর্কের পথ দেখুন।”'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
                {isEnglish
                  ? 'BondRoot algorithms calculate step-by-step ancestral paths and direct Bengali respectful calling terms.'
                  : 'বন্ডরুটের বিশেষ সম্পর্কের অ্যালগরিদম ধাপে ধাপে বংশলতিকার প্রতিটি মাধ্যম চিহ্নিত করে রক্তের দূরবর্তী সম্পর্কও স্পষ্ট করে দেয়।'}
              </p>
            </div>

            <button
              onClick={onOpenAuth}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-lg shrink-0 active:scale-95 transition cursor-pointer neu-button"
            >
              {isEnglish ? 'Try Kinship Engine' : 'সম্পর্ক ট্রাই করুন'}
            </button>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section (4 Concise Connected Steps) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
            {isEnglish ? 'How BondRoot Works' : 'কীভাবে কাজ করে'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-medium">
            {isEnglish ? '4 simple steps to organize your complete family lineage.' : 'সহজ ৪টি ধাপে গড়ে তুলুন আপনার ডিজিটাল বংশলতিকা।'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">

          {/* Step 1 */}
          <div className="p-5 rounded-2xl neu-card text-center sm:text-left transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-lg flex items-center justify-center font-mono mb-3 border border-emerald-300 dark:border-emerald-700">
              01
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {isEnglish ? 'Start Your Family' : 'পরিবার শুরু করুন'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed font-medium">
              {isEnglish ? 'Create your account & add root ancestor.' : 'অ্যাকাউন্ট খুলুন এবং মূল পূর্বপুরুষ নির্ধারণ করুন।'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl neu-card text-center sm:text-left transition">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-black text-lg flex items-center justify-center font-mono mb-3 border border-teal-300 dark:border-teal-700">
              02
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {isEnglish ? 'Add Members' : 'সদস্য যোগ করুন'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed font-medium">
              {isEnglish ? 'Add parents, children, spouses & siblings.' : 'পিতামাতা, সন্তান, জীবনসঙ্গী ও ভাইবোন যুক্ত করুন।'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl neu-card text-center sm:text-left transition">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-black text-lg flex items-center justify-center font-mono mb-3 border border-purple-300 dark:border-purple-700">
              03
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {isEnglish ? 'Connect Bonds' : 'সম্পর্ক তৈরি করুন'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed font-medium">
              {isEnglish ? 'Auto-sync reciprocal bloodline connections.' : 'স্বয়ংক্রিয়ভাবে দ্বিপাক্ষিক রক্তের যোগসূত্র তৈরি হবে।'}
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl neu-card text-center sm:text-left transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black text-lg flex items-center justify-center font-mono mb-3 border border-amber-300 dark:border-amber-700">
              04
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {isEnglish ? 'Find Kinship' : 'যেকোনো সম্পর্ক খুঁজে দেখুন'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1.5 leading-relaxed font-medium">
              {isEnglish ? 'Trace exact calling terms between any two relatives.' : 'যেকোনো দুই সদস্যের মধ্যকার বাংলা সম্বোধন দেখুন।'}
            </p>
          </div>

        </div>
      </section>

      {/* 7. Why BondRoot (Emotional & Professional) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 neu-panel">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-black">
              {isEnglish ? 'Why Choose BondRoot?' : 'কেন BondRoot ব্যবহার করবেন?'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isEnglish ? 'Built to preserve Bengali family heritage and kinship ties.' : 'বাঙালি পরিবারের আবেগ, ঐতিহ্য ও শিকড় সংরক্ষণের অঙ্গীকার।'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center md:text-left">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 neu-button">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto md:mx-0">
                🌳
              </div>
              <h4 className="font-bold text-sm text-emerald-300">
                {isEnglish ? 'Preserving Family Roots' : 'পরিবারের শিকড় সংরক্ষণ'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isEnglish
                  ? 'Keep complete multi-generational lineage records organized in a lifetime digital vault.'
                  : 'বহু-প্রজন্মের পারিবারিক শিকড় ও ঐতিহ্য সযতনে ফ্রেমবন্দি রাখার স্থায়ী ডিজিটাল ব্যবস্থা।'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 neu-button">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto md:mx-0">
                🤝
              </div>
              <h4 className="font-bold text-sm text-teal-300">
                {isEnglish ? 'Introducing Youth to Kinship' : 'নতুন প্রজন্মকে আত্মীয়তার সাথে পরিচয় করানো'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isEnglish
                  ? 'Help children learn exact respectful Bengali calling terms for distant cousins and uncles.'
                  : 'ছোটদের ও নতুন প্রজন্মকে পারিবারিক আত্মীয়তার গভীরতা ও সম্মোধনের সাথে পরিচয় করানো।'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 neu-button">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto md:mx-0">
                🕊️
              </div>
              <h4 className="font-bold text-sm text-amber-300">
                {isEnglish ? 'Legacy for Future Generations' : 'পরিবারের ইতিহাস ভবিষ্যৎ প্রজন্মের জন্য রেখে যাওয়া'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isEnglish
                  ? 'Pass down authentic family photos, bios, and lineage milestones for decades to come.'
                  : 'পূর্বপুরুষদের ছবি, গল্প ও স্মরণীয় ঘটনা ভবিষ্যৎ প্রজন্মের জন্য ডিজিটালি অক্ষুণ্ন রাখা।'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Simplified Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-900 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">

          <div>
            <span className="font-black text-slate-200 text-sm block">BondRoot</span>
            <span className="text-[11px] text-emerald-400/90 font-medium">
              “Preserve Your Roots • Build Your Legacy”
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-4 text-[11px] font-semibold text-slate-400">
            <button
              onClick={() => onOpenLegal?.('privacy')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              {isEnglish ? 'Privacy' : 'গোপনীয়তা'}
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegal?.('terms')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              {isEnglish ? 'Terms' : 'শর্তাবলী'}
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegal?.('help')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              {isEnglish ? 'Help' : 'সাহায্য'}
            </button>
          </div>

        </div>

        {/* Subtle Creator Credit */}
        <div className="max-w-5xl mx-auto pt-6 mt-6 border-t border-slate-900 text-center text-[10px] text-slate-600">
          <span>Created with ❤️ by Muhibbul Islam • BondRoot Platform v1.2</span>
        </div>
      </footer>

    </div>
  );
};
