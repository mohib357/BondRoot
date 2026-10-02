import React from 'react';
import {
  Network,
  GitFork,
  Sparkles,
  MessageSquare,
  Mail,
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
import SocialLinksGrid from './SocialLinksGrid';

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

// ── Landing Bottom Nav — Full-width curvy notch active indicator ──
interface LandingBottomNavProps {
  isEnglish: boolean;
  activePage: 'home' | 'about' | 'login' | 'lang';
  setActivePage: (p: 'home' | 'about' | 'login' | 'lang') => void;
  onToggleLang: () => void;
  isDarkMode: boolean;
}

const LandingBottomNav: React.FC<LandingBottomNavProps> = ({
  isEnglish, activePage, setActivePage, onToggleLang
}) => {
  // Sync nav highlight with parent activePage
  const [active, setActive] = React.useState<'home' | 'lang' | 'about' | 'login'>(activePage);
  React.useEffect(() => {
    if (activePage === 'home' || activePage === 'about' || activePage === 'login' || activePage === 'lang') {
      setActive(activePage);
    }
  }, [activePage]);

  const ITEMS = [
    { id: 'home' as const,  label: isEnglish ? 'Home'    : 'হোম',     onClick: () => { setActive('home'); setActivePage('home'); const el = document.getElementById('landing-page-top'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); try { window.scrollTo({top:0,left:0,behavior:'smooth'}); document.documentElement.scrollTo({top:0,left:0,behavior:'smooth'}); document.body.scrollTo({top:0,left:0,behavior:'smooth'}); } catch { window.scrollTo(0,0); } } },
    { id: 'lang' as const,  label: isEnglish ? 'Language': 'ভাষা',    onClick: () => { setActive('lang'); setActivePage('lang'); } },
    { id: 'about' as const, label: isEnglish ? 'About'   : 'পরিচিতি', onClick: () => { setActive('about'); setActivePage('about'); } },
    { id: 'login' as const, label: isEnglish ? 'Login'   : 'লগইন',    onClick: () => { setActive('login'); setActivePage('login'); } },
  ];

  const ICONS: Record<string, React.ReactNode> = {
    home: (<svg width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/></svg>),
    lang: (<svg width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg>),
    about: (<svg width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>),
    login: (<svg width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>),
  };

  const activeIdx = ITEMS.findIndex(i => i.id === active);

  // Build SVG smooth concave cutout curve (Notch)
  function buildNotchPath(W: number, H: number, R: number, idx: number, total: number): string { // H=72
    const cx = ((idx >= 0 ? idx : 0) + 0.5) * (W / total);
    const nW = 40;
    return `M 0,20 L ${cx - nW},20 C ${cx - 22},20 ${cx - 16},0 ${cx},0 C ${cx + 16},0 ${cx + 22},20 ${cx + nW},20 L ${W},20 L ${W},${H} L 0,${H} Z`;
  }

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="relative" style={{height: 72}}>

        {/* SVG nav bar background with curvy notch */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 72"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{filter:"drop-shadow(0 -3px 8px rgba(16,185,129,0.12)) drop-shadow(0 2px 6px rgba(0,0,0,0.10))"}}>
          <path
            d={buildNotchPath(400, 72, 16, activeIdx, 4)}
            className="fill-white dark:fill-zinc-900"
          />
        </svg>

        {/* Nav items */}
        <div className="absolute inset-0 flex items-end justify-around" style={{paddingBottom: 8}}>
          {ITEMS.map((item, idx) => {
            const isAct = active === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex-1 flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90 cursor-pointer select-none relative"
              >
                {isAct ? (
                  <div
                    className="absolute flex flex-col items-center"
                    style={{bottom: 8, left:"50%", transform:"translateX(-50%)"}}
                  >
                    <div
                      className="w-13 h-13 rounded-full flex items-center justify-center border-[3px] border-white dark:border-zinc-900"
                      style={{
                        width: 52, height: 52,
                        background: 'linear-gradient(145deg,#34d399 0%,#059669 50%,#047857 100%)',
                        boxShadow: '0 6px 18px rgba(5,150,105,0.55), 0 2px 6px rgba(5,150,105,0.25), inset 0 1px 0 rgba(255,255,255,0.28)',
                        marginBottom: 1,
                      }}
                    >
                      <span className="text-white">{ICONS[item.id]}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{item.label}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-0.5 py-1">
                    <span className="text-slate-400 dark:text-zinc-500">{ICONS[item.id]}</span>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500 whitespace-nowrap">{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

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

  // Page-switch state — controls which sub-page is visible
  const [activePage, setActivePage] = React.useState<'home' | 'about' | 'login' | 'lang'>('home');

  // Smooth Scroll to Top Helper (Works across all Android WebViews & Browsers)
  const scrollToTop = React.useCallback(() => {
    const topEl = document.getElementById('landing-page-top');
    if (topEl && typeof topEl.scrollIntoView === 'function') {
      topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  // Handle Page Changes with Browser History (Android Back Button) & Smooth Scroll to Top
  const handlePageChange = React.useCallback((targetPage: 'home' | 'about' | 'login' | 'lang') => {
    if (targetPage === 'home') {
      scrollToTop();
    }
    if (targetPage !== activePage) {
      if (targetPage !== 'home') {
        window.history.pushState({ page: targetPage }, '');
      }
      setActivePage(targetPage);
      if (targetPage === 'home') {
        setTimeout(scrollToTop, 50);
      }
    }
  }, [activePage, scrollToTop]);

  // Android Hardware Back Button Handler (popstate listener)
  React.useEffect(() => {
    const handlePopState = () => {
      setActivePage('home');
      scrollToTop();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollToTop]);

  // Quick message state
  const [directMessage, setDirectMessage] = React.useState('');
  const [msgSending, setMsgSending] = React.useState(false);
  const [msgSentSuccess, setMsgSentSuccess] = React.useState(false);
  const [showQuickForm, setShowQuickForm] = React.useState(false);

  const scrollToDemo = () => {
    const el = document.getElementById('demo-tree-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreDemo();
    }
  };


  return (
    <div className="min-h-screen bg-[#eef7f2] dark:bg-[#060e0a] text-slate-900 dark:text-zinc-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <div id="landing-page-top" className="absolute top-0 left-0 w-px h-px pointer-events-none" />


      {/* ── Page content with smooth transitions ── */}
      {/* Home page */}
      <div style={{display: activePage === 'home' ? 'block' : 'none'}}>

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

          {/* Header Right — only dark mode toggle */}
          <div className="flex items-center">
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all active:scale-90 cursor-pointer neu-button"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section (Styled as a Grand Hero Texture Card) */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] bg-lineage-pattern border border-emerald-300/60 dark:border-emerald-800/50 shadow-[0_8px_32px_rgba(16,185,129,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative overflow-hidden text-center flex flex-col items-center">

          {/* Ambient Glowing Background Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-300/30 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none orb-float-1" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-300/25 dark:bg-amber-500/18 rounded-full blur-3xl pointer-events-none orb-float-2" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-teal-300/18 dark:bg-teal-400/12 rounded-full blur-3xl pointer-events-none orb-float-3" />
          <div className="absolute top-4 right-6 w-20 h-20 border-2 border-dashed border-emerald-300/35 dark:border-emerald-700/40 rounded-full spin-ring pointer-events-none hidden sm:block" />
          <div className="absolute bottom-6 left-8 w-14 h-14 border border-dashed border-amber-300/30 dark:border-amber-700/35 rounded-full pointer-events-none hidden sm:block" style={{animation:'slowRotate 14s linear infinite reverse'}} />

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
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-3xl leading-snug sm:leading-tight text-shimmer">
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
              <button onClick={onOpenAuth} className="w-full sm:w-auto btn-glossy-primary text-sm">
                <span>{isEnglish ? '🌳 Get Started — Free' : '🌳 শুরু করুন — বিনামূল্যে'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary CTA */}
              <button onClick={scrollToDemo} className="w-full sm:w-auto btn-glossy-secondary text-sm">
                <Play className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
                <span>{isEnglish ? 'View Demo Family' : 'ডেমো পরিবার দেখুন'}</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Family Tree Visual Preview */}
      <section id="demo-tree-preview" className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full bg-mesh-mint">
        <div className="p-6 sm:p-8 section-card relative overflow-hidden">

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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <span>{isEnglish ? 'Open Interactive Demo' : 'ইন্টারেক্টিভ ডেমো খুলুন'}</span>
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-features-section">

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
              <div className="w-11 h-11 rounded-2xl icon-wrap-emerald flex items-center justify-center mb-3 text-emerald-700 dark:text-emerald-300">
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
              <div className="w-11 h-11 rounded-2xl icon-wrap-purple flex items-center justify-center mb-3 text-purple-700 dark:text-purple-300">
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
              <div className="w-11 h-11 rounded-2xl icon-wrap-teal flex items-center justify-center mb-3 text-teal-700 dark:text-teal-300">
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
              <div className="w-11 h-11 rounded-2xl icon-wrap-amber flex items-center justify-center mb-3 text-amber-700 dark:text-amber-300">
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
        <div className="p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden" style={{background:'linear-gradient(135deg,#064e3b 0%,#065f46 35%,#0f766e 65%,#047857 100%)',boxShadow:'0 20px 60px rgba(5,150,105,0.40),0 8px 20px rgba(0,0,0,0.30)',border:'1px solid rgba(52,211,153,0.20)'}}>
          <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'radial-gradient(circle, rgba(110,231,183,0.18) 1px, transparent 1px)',backgroundSize:'20px 20px'}} />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none orb-float-1" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none orb-float-2" />
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
              className="btn-glossy-amber text-xs sm:text-sm shrink-0"
            >
              {isEnglish ? 'Try Kinship Engine' : 'সম্পর্ক ট্রাই করুন'}
            </button>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section (4 Concise Connected Steps) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full bg-steps-section">
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
            <div className="w-10 h-10 rounded-xl icon-wrap-emerald text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center font-mono mb-3">
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
            <div className="w-10 h-10 rounded-xl icon-wrap-teal text-teal-800 dark:text-teal-300 font-black text-sm flex items-center justify-center font-mono mb-3">
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
            <div className="w-10 h-10 rounded-xl icon-wrap-purple text-purple-800 dark:text-purple-300 font-black text-sm flex items-center justify-center font-mono mb-3">
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
            <div className="w-10 h-10 rounded-xl icon-wrap-amber text-amber-800 dark:text-amber-300 font-black text-sm flex items-center justify-center font-mono mb-3">
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
        <div className="p-8 rounded-3xl text-white relative overflow-hidden" style={{background:'linear-gradient(145deg, #0f172a 0%, #111827 40%, #0c1a16 100%)', border:'1px solid rgba(52,211,153,0.12)', boxShadow:'0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)'}}>
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{backgroundImage:'radial-gradient(circle, rgba(52,211,153,0.5) 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
          <div className="absolute -top-16 right-0 w-48 h-48 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none orb-float-3" />
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-black">
              {isEnglish ? 'Why Choose BondRoot?' : 'কেন BondRoot ব্যবহার করবেন?'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isEnglish ? 'Built to preserve Bengali family heritage and kinship ties.' : 'বাঙালি পরিবারের আবেগ, ঐতিহ্য ও শিকড় সংরক্ষণের অঙ্গীকার।'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center md:text-left">

            <div className="p-5 rounded-2xl space-y-3 hover:scale-[1.02] transition-all duration-150"
              style={{background:'linear-gradient(135deg,#ecfdf5 0%,#d1fae5 60%,#a7f3d0 100%)',border:'1px solid rgba(16,185,129,0.28)',boxShadow:'5px 5px 16px rgba(16,185,129,0.15),-5px -5px 14px rgba(255,255,255,0.95)'}}>
              <div className="w-10 h-10 rounded-xl icon-wrap-emerald flex items-center justify-center mx-auto md:mx-0 text-lg">🌳</div>
              <h4 className="font-extrabold text-sm text-emerald-800">{isEnglish ? 'Preserving Family Roots' : 'পরিবারের শিকড় সংরক্ষণ'}</h4>
              <p className="text-xs text-emerald-900/70 leading-relaxed">{isEnglish ? 'Keep complete multi-generational lineage records in a lifetime digital vault.' : 'বহু-প্রজন্মের পারিবারিক শিকড় ও ঐতিহ্য সযতনে ফ্রেমবন্দি রাখার স্থায়ী ডিজিটাল ব্যবস্থা।'}</p>
            </div>

            <div className="p-5 rounded-2xl space-y-3 hover:scale-[1.02] transition-all duration-150"
              style={{background:'linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 60%,#99f6e4 100%)',border:'1px solid rgba(20,184,166,0.28)',boxShadow:'5px 5px 16px rgba(20,184,166,0.15),-5px -5px 14px rgba(255,255,255,0.95)'}}>
              <div className="w-10 h-10 rounded-xl icon-wrap-teal flex items-center justify-center mx-auto md:mx-0 text-lg">🤝</div>
              <h4 className="font-extrabold text-sm text-teal-800">{isEnglish ? 'Introducing Youth to Kinship' : 'নতুন প্রজন্মকে আত্মীয়তার সাথে পরিচয় করানো'}</h4>
              <p className="text-xs text-teal-900/70 leading-relaxed">{isEnglish ? 'Help children learn respectful Bengali calling terms for distant relatives.' : 'ছোটদের ও নতুন প্রজন্মকে পারিবারিক আত্মীয়তার গভীরতা ও সম্মোধনের সাথে পরিচয় করানো।'}</p>
            </div>

            <div className="p-5 rounded-2xl space-y-3 hover:scale-[1.02] transition-all duration-150"
              style={{background:'linear-gradient(135deg,#fffbeb 0%,#fef3c7 60%,#fde68a 100%)',border:'1px solid rgba(245,158,11,0.28)',boxShadow:'5px 5px 16px rgba(245,158,11,0.15),-5px -5px 14px rgba(255,255,255,0.95)'}}>
              <div className="w-10 h-10 rounded-xl icon-wrap-amber flex items-center justify-center mx-auto md:mx-0 text-lg">🕊️</div>
              <h4 className="font-extrabold text-sm text-amber-800">{isEnglish ? 'Legacy for Future Generations' : 'পরিবারের ইতিহাস ভবিষ্যৎ প্রজন্মের জন্য রেখে যাওয়া'}</h4>
              <p className="text-xs text-amber-900/70 leading-relaxed">{isEnglish ? 'Pass down authentic family photos, bios, and lineage milestones for decades.' : 'পূর্বপুরুষদের ছবি, গল্প ও স্মরণীয় ঘটনা ভবিষ্যৎ প্রজন্মের জন্য ডিজিটালি অক্ষুণ্ন রাখা।'}</p>
            </div>

          </div>
        </div>
      </section>

      </div>{/* end home page */}

      {/* ── About Page ── */}
      <div style={{display: activePage === 'about' ? 'flex' : 'none', flexDirection:'column'}} className="min-h-screen bg-[#eef7f2] dark:bg-[#060e0a]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent">BondRoot</span>
            <div className="ml-auto">
              <button onClick={onToggleDarkMode} className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 transition-all active:scale-90 cursor-pointer neu-button">
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 pb-28 max-w-xl mx-auto w-full space-y-4">

          {/* Mission Card */}
          <div className="section-card p-5 space-y-3 mt-2">
            <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span>{isEnglish ? 'The Vision Behind BondRoot' : 'বন্ডরুট (BondRoot)-এর পেছনের গল্প ও উদ্দেশ্য'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
              {isEnglish
                ? 'BondRoot was crafted with a heartfelt purpose: to protect multi-generational family ties, cherish departed ancestors, and resolve intricate kinship relationships with mathematical certainty. In an era of rapid urbanization, BondRoot ensures future generations never forget their true roots.'
                : 'আধুনিক নগরায়ন ও ব্যস্ততার যুগে আমাদের পারিবারিক শিকড় এবং পূর্বপুরুষের স্মৃতি যেন হারিয়ে না যায়—সেই মহৎ উদ্দেশ্যেই বন্ডরুট (BondRoot) নির্মিত। রক্তের সম্পর্কের সূক্ষ্ম হিসাব, নির্ভুল বাংলা সামাজিক সম্বোধন এবং পারিবারিক স্মৃতিবিজড়িত মুহূর্তগুলোকে ডিজিটাল ভল্টে চিরস্থায়ী করে রাখাই এই প্ল্যাটফর্মের মূল লক্ষ্য।'}
            </p>
          </div>

          {/* Developer Card */}
          <div className="section-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg border-4 border-white dark:border-zinc-700"
                style={{boxShadow: '6px 6px 18px rgba(99,102,241,0.45), -4px -4px 12px rgba(255,255,255,0.88)'}}
              >
                MI
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Muhibbul Islam</h2>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Lead Architect & Full-Stack Engineer
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Full-Stack Engineer • Kinship Graph Systems
                </p>
              </div>
            </div>

            <p className="text-xs italic text-indigo-800 dark:text-indigo-300 leading-relaxed border-l-2 border-indigo-400 pl-3">
              "বন্ডরুট নির্মাণের পেছনে আমার লক্ষ্য — বাঙালি পারিবারিক বন্ধন, ইতিহাস ও ঐতিহ্যকে ডিজিটাল জগতে চিরকালের জন্য সংরক্ষণ করা।"
            </p>

            {/* Circular 3D Neumorphic Social / Contact Button Grid */}
            <SocialLinksGrid
              isEnglish={isEnglish}
              onMessageClick={() => setShowQuickForm(!showQuickForm)}
            />

              {/* Inline Quick Message Input Form */}
              {showQuickForm && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-2 animate-in fade-in duration-150">
                  {msgSentSuccess ? (
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>আপনার বার্তা সরাসরি ডেভেলপারকে পাঠানো হয়েছে! ধন্যবাদ।</span>
                    </div>
                  ) : (
                    <>
                      <textarea
                        rows={3}
                        placeholder="ডেভেলপারকে সরাসরি মতামত বা বার্তা লিখুন..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={directMessage}
                        onChange={(e) => setDirectMessage(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={msgSending || !directMessage.trim()}
                        onClick={async () => {
                          if (!directMessage.trim()) return;
                          setMsgSending(true);
                          try {
                            await fetch('/api/feedback', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: 'Guest User', message: directMessage }),
                            });
                          } catch (e) {
                            console.warn('Feedback notice:', e);
                          } finally {
                            setMsgSending(false);
                            setMsgSentSuccess(true);
                            setDirectMessage('');
                            setTimeout(() => setMsgSentSuccess(false), 4000);
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold active:scale-95 transition cursor-pointer disabled:opacity-50"
                      >
                        {msgSending ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান ✉️'}
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      {/* ── Language Settings Page (In-Page View) ── */}
      <div style={{display: activePage === 'lang' ? 'flex' : 'none', flexDirection:'column'}} className="min-h-screen bg-[#eef7f2] dark:bg-[#060e0a]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent">BondRoot</span>
            <div className="ml-auto">
              <button onClick={onToggleDarkMode} className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 transition-all active:scale-90 cursor-pointer neu-button">
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 pb-28 max-w-md mx-auto w-full">
          <div className="section-card p-6 w-full space-y-5">

            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <Globe className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isEnglish ? 'Language & Display Settings' : 'ভাষা ও ডিসপ্লে সেটিংস'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isEnglish
                  ? 'Select your preferred display language for BondRoot'
                  : 'BondRoot অ্যাপের পছন্দের ডিসপ্লে ভাষা নির্বাচন করুন'}
              </p>
            </div>

            {/* Language Selection Options */}
            <div className="space-y-3 pt-2">

              {/* Bangla Option */}
              <button
                type="button"
                onClick={() => {
                  if (isEnglish) onToggleLang();
                }}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                  !isEnglish
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-emerald-300'
                }`}
                style={{boxShadow: '4px 4px 10px rgba(0,0,0,0.05), -2px -2px 8px rgba(255,255,255,0.8)'}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-black text-sm flex items-center justify-center">
                    🇧🇩
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">বাংলা (Bangla)</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">বাঙালি পরিবারের জন্য স্বাভাবিক ও প্রাঞ্জল বাংলা পরিবেশ</p>
                  </div>
                </div>
                {!isEnglish && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </button>

              {/* English Option */}
              <button
                type="button"
                onClick={() => {
                  if (!isEnglish) onToggleLang();
                }}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                  isEnglish
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-emerald-300'
                }`}
                style={{boxShadow: '4px 4px 10px rgba(0,0,0,0.05), -2px -2px 8px rgba(255,255,255,0.8)'}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-black text-sm flex items-center justify-center">
                    🌐
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">English</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">International English language interface</p>
                  </div>
                </div>
                {isEnglish && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </button>

            </div>

            {/* Quick Helper Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-500 dark:text-zinc-400 text-center">
              <span>{isEnglish ? 'Language changes apply instantly across the entire application.' : 'ভাষা নির্বাচন সাথে সাথে পুরো অ্যাপে প্রয়োগ হবে।'}</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Login Page ── */}
      <div style={{display: activePage === 'login' ? 'flex' : 'none', flexDirection:'column'}} className="min-h-screen bg-[#eef7f2] dark:bg-[#060e0a]">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent">BondRoot</span>
            <div className="ml-auto">
              <button onClick={onToggleDarkMode} className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 transition-all active:scale-90 cursor-pointer neu-button">
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-28">
          <div className="section-card p-8 w-full max-w-sm space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/30">
                <Network className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{isEnglish ? 'Welcome Back' : 'স্বাগতম'}</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{isEnglish ? 'Sign in to your BondRoot account' : 'আপনার BondRoot অ্যাকাউন্টে প্রবেশ করুন'}</p>
            </div>
            <button
              onClick={() => { onOpenAuth(); }}
              className="w-full btn-glossy-primary text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{isEnglish ? 'Open In-Page Sign In / Sign Up' : 'লগইন / নতুন অ্যাকাউন্ট খুলুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Landing Bottom Nav (mobile only, 4 items with active state) ── */}
      <LandingBottomNav
        isEnglish={isEnglish}
        activePage={activePage}
        setActivePage={handlePageChange}
        onToggleLang={onToggleLang}
        isDarkMode={isDarkMode}
      />

      {/* Spacer for bottom nav on mobile */}
      <div className="h-20 sm:hidden" />

      {/* 8. Simplified Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 pb-28 sm:pb-10 px-4 sm:px-6 lg:px-8 border-t border-slate-900 mt-auto">
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
