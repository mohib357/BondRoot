import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC<{ lang?: 'bn' | 'en' }> = ({ lang = 'bn' }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/50 animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-200" />
      <span>
        {lang === 'en'
          ? 'Offline Mode — Local family tree cached'
          : 'অফলাইন মোড — সংরক্ষিত লোকাল ডেটা সক্রিয়'}
      </span>
    </div>
  );
};
