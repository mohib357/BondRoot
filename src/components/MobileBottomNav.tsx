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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
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
          <div className={`p-1 rounded-lg ${viewMode === 'tree' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}>
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
          <div className={`p-1 rounded-lg ${viewMode === 'directory' ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''}`}>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5">{isEnglish ? 'People' : 'সদস্য'}</span>
        </button>

        {/* Center Prominent Action: Smart AI Add */}
        <button
          onClick={() => {
            triggerHaptic();
            onOpenSmartAIAdd();
          }}
          className="flex flex-col items-center justify-center -mt-4 relative group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 border-2 border-white dark:border-zinc-800 active:scale-95 transition">
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
