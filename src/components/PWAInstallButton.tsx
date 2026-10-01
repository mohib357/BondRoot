import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

interface PWAInstallButtonProps {
  lang?: 'bn' | 'en';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang = 'bn' }) => {
  const isEnglish = lang === 'en';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition cursor-pointer"
        title={isEnglish ? 'Install BondRoot as App' : 'অ্যাপ হিসেবে ইনস্টল করুন'}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isEnglish ? 'Install App' : 'অ্যাপ ইনস্টল'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-white/70 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isEnglish ? 'Install on iOS' : 'আইওএস-এ ইনস্টল'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{isEnglish ? 'Install on iPhone / iPad' : 'আইফোনে ইনস্টল করার নিয়ম'}</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed space-y-2">
                ১. Safari ব্রাউজারের নিচের <strong>Share (শেয়ার)</strong> আইকনে চাপুন।<br />
                ২. নিচে স্ক্রোল করে <strong>'Add to Home Screen'</strong> (হোম স্ক্রিনে যোগ করুন) নির্বাচন করুন।<br />
                ৩. উপরে ডানে <strong>Add</strong> চাপলেই BondRoot আপনার ফোনে একটি পূর্ণাঙ্গ অ্যাপ হিসেবে সেট হয়ে যাবে।
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold transition shadow-xs"
              >
                {isEnglish ? 'Got it' : 'ঠিক আছে'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
