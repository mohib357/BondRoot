import React, { useState } from 'react';
import {
  X,
  Network,
  GitFork,
  Users,
  Compass,
  Download,
  Upload,
  Sun,
  Moon,
  Globe,
  Shield,
  Info,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Calendar,
  Lock,
  Database,
  Smartphone,
  Award,
  Crown,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { ViewMode } from '../types/person';
import { User } from '../types/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface SideNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenDataTools: () => void;
  onOpenRelFinder: () => void;
  onOpenSmartAIAdd: () => void;
  onOpenMilestones: () => void;
  onOpenPosterExport: () => void;
  onOpenDeveloperAbout?: () => void;
  onOpenSuperAdmin?: () => void;
  onOpenUserProfile?: () => void;
  onLogout?: () => void;
  authUser?: User | null;
  peopleCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
}

export const SideNavDrawer: React.FC<SideNavDrawerProps> = ({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  onOpenDataTools,
  onOpenRelFinder,
  onOpenSmartAIAdd,
  onOpenMilestones,
  onOpenPosterExport,
  onOpenDeveloperAbout,
  onOpenSuperAdmin,
  onOpenUserProfile,
  onLogout,
  authUser,
  peopleCount,
  isDarkMode,
  onToggleDarkMode,
  lang,
  onToggleLang,
}) => {
  const isEnglish = lang === 'en';
  const [showAboutPrivacy, setShowAboutPrivacy] = useState(false);

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-out Drawer Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Network className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 dark:from-amber-300 dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
                BondRoot
              </h2>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                {isEnglish ? 'Genealogy & Kinship' : 'বংশলতিকা ও পারিবারিক বন্ধন'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* User Account Profile Card */}
          {authUser && (
            <div
              onClick={() => {
                if (onOpenUserProfile) onOpenUserProfile();
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-zinc-800 dark:to-zinc-800/80 border border-emerald-200 dark:border-zinc-700 cursor-pointer neu-button hover:border-emerald-400 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {authUser.avatar_url ? (
                    <img src={authUser.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    authUser.full_name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 truncate">
                      {authUser.full_name}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                    {authUser.username ? '@' + authUser.username : authUser.email}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {authUser.role === 'super_admin' ? '👑 Super Admin' : 'Family Member'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 opacity-60" />
              </div>
            </div>
          )}

          {/* Super Admin Control Panel Link */}
          {authUser?.role === 'super_admin' && onOpenSuperAdmin && (
            <button
              onClick={() => {
                onOpenSuperAdmin();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/20 hover:from-amber-500/25 hover:to-amber-500/30 border border-amber-300 dark:border-amber-700/80 rounded-2xl text-xs font-black text-amber-950 dark:text-amber-200 transition shadow-2xs cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{isEnglish ? 'Super Admin Dashboard' : '👑 সুপার অ্যাডমিন প্যানেল'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </button>
          )}

          {/* Main Navigation */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-2">
              {isEnglish ? 'Navigation' : 'প্রধান মেনু'}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onViewModeChange('tree');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'tree'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <GitFork className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEnglish ? 'Family Tree View' : 'বংশলতিকা ভিউ'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => {
                  onViewModeChange('directory');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'directory'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEnglish ? `Directory (${peopleCount})` : `সদস্য তালিকা (${peopleCount})`}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => {
                  onViewModeChange('bonds');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'bonds'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Network className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEnglish ? 'Bond Matrix' : 'রিলেশন ম্যাট্রিক্স'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-2">
              {isEnglish ? 'Kinship & Heritage Tools' : 'আত্মীয়তা ও ঐতিহ্য টুলস'}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenRelFinder();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEnglish ? 'Kinship Finder' : 'সম্পর্ক নির্ণয়কারী'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => {
                  onOpenSmartAIAdd();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isEnglish ? 'Smart AI Add (Voice & NLP)' : 'স্মার্ট এআই এন্ট্রি'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => {
                  onOpenMilestones();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{isEnglish ? 'Family Milestones' : 'পারিবারিক স্মরণিকা'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => {
                  onOpenPosterExport();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{isEnglish ? 'Export Poster (PNG/SVG)' : 'পোস্টার এক্সপোর্ট'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Secondary Controls & Preferences */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-2">
              {isEnglish ? 'Preferences & Data' : 'সেটিংস ও ব্যাকআপ'}
            </h3>
            <div className="space-y-2">
              {/* Backup & Restore Action */}
              <button
                onClick={() => {
                  onOpenDataTools();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 border border-slate-200/80 dark:border-zinc-700 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEnglish ? 'Backup & Restore (JSON)' : 'ব্যাকআপ ও রিস্টোর (JSON)'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {/* Dark / Light Mode Toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>{isEnglish ? 'Dark Theme' : 'ডার্ক মোড'}</span>
                </span>
                <button
                  onClick={onToggleDarkMode}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isDarkMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-zinc-600 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 text-xs">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isEnglish ? 'Language' : 'ভাষা'}</span>
                </span>
                <button
                  onClick={onToggleLang}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 transition"
                >
                  {isEnglish ? 'বাংলা' : 'English'}
                </button>
              </div>

              {/* PWA In-App Install Prompt */}
              <div className="pt-1">
                <PWAInstallButton lang={lang} />
              </div>
            </div>
          </div>

          {/* Developer Profile & Mission Modal Button */}
          {onOpenDeveloperAbout && (
            <button
              onClick={() => {
                onOpenDeveloperAbout();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl text-xs font-bold text-emerald-950 dark:text-emerald-300 transition shadow-2xs"
            >
              <div className="flex items-center space-x-2.5">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isEnglish ? 'About Developer & Mission' : 'ডেভেলপার পরিচিতি ও মিশন'}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          )}

          {/* About BondRoot & Privacy Policy Accordion */}
          <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowAboutPrivacy(!showAboutPrivacy)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-zinc-300 transition"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isEnglish ? 'About & Data Privacy' : 'অ্যাপ ও ডাটা প্রাইভেসি নীতি'}</span>
              </div>
              {showAboutPrivacy ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {showAboutPrivacy && (
              <div className="p-3.5 bg-white dark:bg-zinc-900 text-[11px] text-slate-600 dark:text-zinc-400 space-y-2 border-t border-slate-200 dark:border-zinc-800 leading-relaxed">
                <p>
                  <strong>BondRoot (বন্ডরুট):</strong> বহু-প্রজন্মীয় পারিবারিক আত্মীয়তার সংযোগ রক্ষা এবং রক্তের সম্পর্কের নির্ভুল হিসাবের জন্য নির্মিত একটি আধুনিক জিনিয়ালজি প্ল্যাটফর্ম।
                </p>
                <div className="space-y-1 pt-1">
                  <div className="flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ক্লাউড ও লোকাল নিরাপত্তা:</strong> আপনার পারিবারিক তথ্য নিরাপদ Neon Serverless PostgreSQL এবং লোকাল ডিভাইসে সংরক্ষিত থাকে।</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>PWA অফলাইন সুবিধা:</strong> নেটওয়ার্ক না থাকলেও আপনার ক্যাশ করা বংশলতিকা যেকোনো সময় দেখা যাবে।</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          {authUser && onLogout && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-300 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isEnglish ? 'Sign Out (লগআউট)' : 'লগআউট (Sign Out)'}</span>
            </button>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 text-[11px] text-slate-400 dark:text-zinc-500 text-center">
          BondRoot v1.2 • Preserve Your Roots
        </div>
      </aside>
    </>
  );
};
