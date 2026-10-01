import React from 'react';
import {
  GitFork,
  Users,
  Network,
  Compass,
  Download,
  Plus,
  Globe,
  Sparkles,
  Sun,
  Moon,
  Printer,
  Calendar,
  Menu,
  Bell,
  Crown,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { ViewMode } from '../types/person';
import { User } from '../types/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddPerson: () => void;
  onOpenRelFinder: () => void;
  onOpenDataTools: () => void;
  onOpenSmartAIAdd?: () => void;
  onOpenLineageInsights?: () => void;
  onOpenPosterExport?: () => void;
  onOpenMilestones?: () => void;
  onOpenSideDrawer?: () => void;
  onOpenNotifications?: () => void;
  onOpenSuperAdmin?: () => void;
  onLogout?: () => void;
  authUser?: User | null;
  unreadNotificationCount?: number;
  peopleCount: number;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onAddPerson,
  onOpenRelFinder,
  onOpenDataTools,
  onOpenSmartAIAdd,
  onOpenLineageInsights,
  onOpenPosterExport,
  onOpenMilestones,
  onOpenSideDrawer,
  onOpenNotifications,
  onOpenSuperAdmin,
  onLogout,
  authUser,
  unreadNotificationCount = 0,
  peopleCount,
  lang,
  onToggleLang,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const isEnglish = lang === 'en';

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-emerald-100 dark:border-zinc-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger Menu & Logo Brand */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {onOpenSideDrawer && (
              <button
                onClick={onOpenSideDrawer}
                title={isEnglish ? 'Open Navigation Drawer' : 'মেনু ড্রয়ার খুলুন'}
                className="p-2 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Network className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  BondRoot
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {isEnglish ? 'Genealogy' : 'বংশলতিকা'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block">
                {isEnglish
                  ? 'Preserving ancestral roots & kinship bonds'
                  : 'পারিবারিক সম্পর্ক ও বংশলতিকা নির্ণয়'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Glassmorphism Pill) */}
          <div className="hidden sm:flex items-center bg-slate-100/90 dark:bg-zinc-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80">
            <button
              onClick={() => onViewModeChange('tree')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>{isEnglish ? 'Tree View' : 'বংশলতিকা'}</span>
            </button>
            <button
              onClick={() => onViewModeChange('directory')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                viewMode === 'directory'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isEnglish ? `People (${peopleCount})` : `সদস্য (${peopleCount})`}</span>
            </button>
            <button
              onClick={() => onViewModeChange('bonds')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                viewMode === 'bonds'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>{isEnglish ? 'Bond Matrix' : 'রিলেশন ম্যাট্রিক্স'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* PWA In-App Install Prompt */}
            <div className="hidden sm:block">
              <PWAInstallButton lang={lang} />
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="hidden sm:flex p-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              title={isEnglish ? 'Switch to Bangla' : 'Switch to English'}
              className="inline-flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isEnglish ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Poster Export */}
            {onOpenPosterExport && (
              <button
                onClick={onOpenPosterExport}
                title={isEnglish ? 'Export Poster / PDF' : 'পোস্টার / ভেক্টর এক্সপোর্ট'}
                className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-white/70 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-slate-100 transition shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                <span>{isEnglish ? 'Poster' : 'পোস্টার'}</span>
              </button>
            )}

            {/* Family Milestones */}
            {onOpenMilestones && (
              <button
                onClick={onOpenMilestones}
                title={isEnglish ? 'Family Milestones' : 'পারিবারিক স্মরণিকা'}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{isEnglish ? 'Events' : 'স্মরণিকা'}</span>
              </button>
            )}

            {/* Kinship Finder */}
            <button
              onClick={onOpenRelFinder}
              title={isEnglish ? 'Kinship Finder' : 'সম্পর্ক অনুসন্ধান'}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-white/70 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-slate-100 transition cursor-pointer shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isEnglish ? 'Kinship' : 'সম্পর্ক'}</span>
            </button>

            {/* Smart AI Add */}
            {onOpenSmartAIAdd && (
              <button
                onClick={onOpenSmartAIAdd}
                title={isEnglish ? 'Smart AI Member Entry' : 'স্মার্ট এআই মেম্বার এন্ট্রি'}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isEnglish ? 'Smart AI Add' : 'স্মার্ট AI'}</span>
              </button>
            )}

            {/* Super Admin Control Panel Button */}
            {authUser?.role === 'super_admin' && onOpenSuperAdmin && (
              <button
                onClick={onOpenSuperAdmin}
                title="Developer Super Admin Panel"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black text-amber-900 dark:text-amber-200 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 dark:from-amber-900/80 dark:to-amber-950/80 border border-amber-400 dark:border-amber-700/80 rounded-xl shadow-md shadow-amber-500/15 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden sm:inline">Super Admin</span>
              </button>
            )}

            {/* Notification Bell */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                title={isEnglish ? 'Family Notifications' : 'পারিবারিক নোটিফিকেশন'}
                className="relative p-2 text-slate-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-white/70 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-xl transition cursor-pointer shadow-2xs"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full px-1 shadow-md animate-pulse">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Badge & Logout */}
            {authUser && (
              <div className="flex items-center space-x-1.5 pl-1">
                <div
                  title={`${authUser.full_name} (${authUser.role})`}
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-black text-xs flex items-center justify-center shadow-xs border border-emerald-300/40"
                >
                  {authUser.full_name[0]}
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title={isEnglish ? 'Sign Out' : 'লগআউট'}
                    className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Data Tools */}
            <button
              onClick={onOpenDataTools}
              title={isEnglish ? 'Backup & Restore Data' : 'ব্যাকআপ ও তথ্য রিস্টোর'}
              className="p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-xl transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Add Person */}
            <button
              onClick={onAddPerson}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{isEnglish ? 'Add Person' : 'সদস্য যোগ'}</span>
              <span className="sm:hidden">{isEnglish ? 'Add' : 'যোগ'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
