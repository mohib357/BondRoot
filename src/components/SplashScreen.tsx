import React, { useEffect } from 'react';
import { Network, Sparkles, Shield, Heart } from 'lucide-react';

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
      }, 600); // Matches .animate-splash-exit 0.6s cinematic duration
      return () => clearTimeout(timer);
    }
  }, [isExiting, onFinished]);

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-zinc-950 via-emerald-950 to-zinc-950 text-white select-none gpu-accelerated ${
        isExiting ? 'animate-splash-exit' : ''
      }`}
    >
      {/* Top Header Badge */}
      <div className="w-full flex items-center justify-between text-xs font-extrabold text-emerald-400/70 tracking-widest pt-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>BONDROOT GENEALOGY VAULT</span>
        </div>
        <div className="flex items-center space-x-1.5 text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">v1.2</span>
        </div>
      </div>

      {/* Main Generative Tree Motion Graphic */}
      <div className="flex flex-col items-center justify-center flex-1 my-auto space-y-4 max-w-md w-full relative">

        {/* SVG Canvas for Roots & Branches */}
        <div className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center">

          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none animate-pulse" />

          <svg
            viewBox="0 0 400 320"
            className="w-full h-full drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          >
            <defs>
              {/* Gold to Emerald Gradient for Path Strokes */}
              <linearGradient id="rootGoldEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="40%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>

              {/* Glowing Node Gradient */}
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#047857" />
              </radialGradient>
            </defs>

            {/* STAGE 1: ANCESTRAL SEED (0.0s - 0.8s) */}
            <circle
              cx="200"
              cy="160"
              r="8"
              fill="url(#rootGoldEmerald)"
              className="animate-seed-glow"
            />

            {/* STAGE 1: SPREADING ROOTS DOWNWARD (0.0s - 0.8s) */}
            {/* Center Main Root */}
            <path
              d="M 200 160 C 200 200, 205 240, 200 290"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-root"
            />

            {/* Left Deep Root */}
            <path
              d="M 200 160 C 175 195, 135 210, 100 250 C 75 275, 55 290, 35 310"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-root"
            />

            {/* Right Deep Root */}
            <path
              d="M 200 160 C 225 195, 265 210, 300 250 C 325 275, 345 290, 365 310"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-root"
            />

            {/* Sub-root Tendrils */}
            <path
              d="M 135 210 C 110 230, 85 240, 60 260"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-root"
            />
            <path
              d="M 265 210 C 290 230, 315 240, 340 260"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-root"
            />

            {/* STAGE 2: UPWARD TRUNK & BRANCHES (0.8s - 1.5s) */}
            {/* Trunk */}
            <path
              d="M 200 160 C 200 130, 198 105, 200 70"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-trunk"
            />

            {/* Left Outer Branch */}
            <path
              d="M 200 120 C 160 100, 120 90, 80 65 C 60 52, 45 40, 30 25"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-branches"
            />

            {/* Left Mid Branch */}
            <path
              d="M 200 100 C 175 80, 150 70, 125 45"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-branches"
            />

            {/* Right Outer Branch */}
            <path
              d="M 200 120 C 240 100, 280 90, 320 65 C 340 52, 355 40, 370 25"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-branches"
            />

            {/* Right Mid Branch */}
            <path
              d="M 200 100 C 225 80, 250 70, 275 45"
              stroke="url(#rootGoldEmerald)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className="animate-draw-branches"
            />

            {/* STAGE 2: LINEAGE MEMBER NODES (Glow Nodes at tips) */}
            <circle cx="30" cy="25" r="9" fill="url(#nodeGlow)" className="animate-node-pop-1" />
            <circle cx="125" cy="45" r="8" fill="url(#nodeGlow)" className="animate-node-pop-1" />
            <circle cx="200" cy="70" r="10" fill="url(#nodeGlow)" className="animate-node-pop-2" />
            <circle cx="275" cy="45" r="8" fill="url(#nodeGlow)" className="animate-node-pop-1" />
            <circle cx="370" cy="25" r="9" fill="url(#nodeGlow)" className="animate-node-pop-1" />

            {/* Node Center Icons */}
            <circle cx="30" cy="25" r="3.5" fill="#FFFFFF" className="animate-node-pop-2" />
            <circle cx="125" cy="45" r="3" fill="#FFFFFF" className="animate-node-pop-2" />
            <circle cx="200" cy="70" r="4" fill="#F59E0B" className="animate-node-pop-2" />
            <circle cx="275" cy="45" r="3" fill="#FFFFFF" className="animate-node-pop-2" />
            <circle cx="370" cy="25" r="3.5" fill="#FFFFFF" className="animate-node-pop-2" />
          </svg>
        </div>

        {/* STAGE 3: BRAND & TITLE REVEAL (1.5s - 2.2s) */}
        <div className="text-center space-y-2 opacity-0 animate-title-reveal">
          <div className="inline-flex items-center space-x-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              BondRoot
            </span>
          </div>

          <p className="text-xs sm:text-sm font-extrabold tracking-wide text-emerald-200/90">
            {isEnglish ? 'Tracing Ancestral Roots, Preserving Kinship Bonds' : '‘শিকড়ের সন্ধানে, রক্তের বন্ধনে’'}
          </p>
        </div>

      </div>

      {/* Bottom Progress Line & Status */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-2.5 pb-2">
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-emerald-800/50 relative">
          <div className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 rounded-full animate-progress-line" />
        </div>

        <p className="text-[11px] font-semibold text-emerald-300/80 animate-pulse">
          {isEnglish ? 'Initializing family tree & session...' : 'পারিবারিক রক্তসম্পর্ক ও ডাটাবেজ সিঙ্ক হচ্ছে...'}
        </p>
      </div>

    </div>
  );
};
