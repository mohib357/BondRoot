import React from 'react';
import { GitFork, Users, Compass, Sparkles, Calendar, Plus, Bell } from 'lucide-react';
import { ViewMode } from '../types/person';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenRelFinder: () => void;
  onOpenSmartAIAdd: () => void;
  onOpenMilestones: () => void;
  onAddPerson: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  lang?: 'bn' | 'en';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  onViewModeChange,
  onOpenRelFinder,
  onOpenSmartAIAdd,
  onOpenMilestones,
  onAddPerson,
  onOpenNotifications,
  unreadNotificationCount = 0,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  // SVG viewBox dimensions: 400 wide × 60 tall, center notch at cx=200
  // Smooth cubic bezier concave dip: ~88px wide, ~30px deep
  const svgPath =
    'M0,30 L120,30 C150,30 170,0 200,0 C230,0 250,30 280,30 L400,30 L400,60 L0,60 Z';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden backdrop-blur-lg shadow-[0_-4px_16px_rgba(0,0,0,0.06)] safe-area-pb"
      style={{ height: '60px' }}>

      {/* SVG background — light mode */}
      <svg
        className="absolute inset-0 w-full h-full dark:hidden pointer-events-none"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d={svgPath} fill="white" />
      </svg>

      {/* SVG background — dark mode */}
      <svg
        className="absolute inset-0 w-full h-full hidden dark:block pointer-events-none"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d={svgPath} fill="#18181b" />
      </svg>

      {/* Nav content sits above the SVG */}
      <div className="relative z-10 flex items-center justify-around h-full px-2">

        {/* Tree View */}
        <button
          onClick={() => {
            triggerHaptic();
            onViewModeChange('tree');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            viewMode === 'tree'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <div
            className={`p-1 rounded-lg ${viewMode === 'tree' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}
            style={
              viewMode === 'tree'
                ? { boxShadow: '2px 2px 5px rgba(0,0,0,0.08), -1px -1px 4px rgba(255,255,255,0.9)' }
                : undefined
            }
          >
            <GitFork className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">{isEnglish ? 'Tree' : 'লতিকা'}</span>
        </button>

        {/* Directory */}
        <button
          onClick={() => {
            triggerHaptic();
            onViewModeChange('directory');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            viewMode === 'directory'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <div
            className={`p-1 rounded-lg ${viewMode === 'directory' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}
            style={
              viewMode === 'directory'
                ? { boxShadow: '2px 2px 5px rgba(0,0,0,0.08), -1px -1px 4px rgba(255,255,255,0.9)' }
                : undefined
            }
          >
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">{isEnglish ? 'People' : 'সদস্য'}</span>
        </button>

        {/* Center Prominent Action: Smart AI Add — floats above the notch */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenSmartAIAdd();
          }}
          className="flex flex-col items-center justify-center -mt-7 relative group"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 border-2 border-white dark:border-zinc-800 active:scale-95 transition">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 mt-0.5">
            {isEnglish ? 'AI Add' : 'AI এন্ট্রি'}
          </span>
        </button>

        {/* Kinship Finder */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenRelFinder();
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
        >
          <div className="p-1 rounded-lg">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] mt-0.5">{isEnglish ? 'Kinship' : 'সম্পর্ক'}</span>
        </button>

        {/* Notifications / Messages */}
        <button
          onClick={() => {
            triggerHaptic();
            if (onOpenNotifications) onOpenNotifications();
          }}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
        >
          <div className="p-1 rounded-lg relative">
            <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center rounded-full px-0.5 animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{isEnglish ? 'Alerts' : 'বার্তা'}</span>
        </button>

      </div>
    </nav>
  );
};
