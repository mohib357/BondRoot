import React, { useEffect, useState } from 'react';
import { Network, Sparkles, Shield, GitFork } from 'lucide-react';

interface SplashScreenProps {
  isExiting: boolean;
  onFinished: () => void;
  lang?: 'bn' | 'en';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isExiting,
  onFinished,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        onFinished();
      }, 450); // Matches .animate-splash-exit 0.45s duration
      return () => clearTimeout(timer);
    }
  }, [isExiting, onFinished]);

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-between p-8 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white select-none gpu-accelerated ${
        isExiting ? 'animate-splash-exit' : ''
      }`}
    >
      {/* Top Subtle Watermark Header */}
      <div className="w-full flex items-center justify-between text-xs font-bold text-emerald-400/60 uppercase tracking-widest pt-2">
        <div className="flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>BondRoot Vault</span>
        </div>
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>v1.2</span>
        </div>
      </div>

      {/* Center Hero Emblem & Typography */}
      <div className="flex flex-col items-center text-center space-y-6 my-auto">

        {/* Animated Emblem Box */}
        <div className="relative group animate-logo-pulse">
          {/* Ambient Outer Glow */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-teal-400/20 blur-xl animate-pulse pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-2xl border border-white/20 backdrop-blur-xl">
            <Network className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.2] drop-shadow-md" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2 animate-in fade-in duration-700 delay-300">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 bg-clip-text text-transparent">
            BondRoot
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-emerald-200/90 max-w-xs sm:max-w-md leading-relaxed px-4">
            {isEnglish
              ? 'Preserving Ancestral Roots & Kinship Bonds'
              : 'পারিবারিক শিকড় ও সম্পর্কের ডিজিটাল মহাফেজখানা'}
          </p>
        </div>

      </div>

      {/* Bottom Progress Line & Footer */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-3 pb-4">
        {/* Progress Bar Container */}
        <div className="w-full h-1 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-800/40 relative">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 rounded-full animate-progress-line" />
        </div>

        <span className="text-[11px] font-medium text-emerald-400/80 animate-pulse">
          {isEnglish ? 'Synchronizing family lineage...' : 'বংশলতিকা ও ব্যাকএন্ড সিঙ্ক হচ্ছে...'}
        </span>
      </div>

    </div>
  );
};
