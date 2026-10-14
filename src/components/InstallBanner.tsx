import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, Monitor } from 'lucide-react';

interface InstallBannerProps {
  onInstallClick: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  onInstallClick,
  isInstallable,
  isInstalled
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running as an installed PWA or dismissed, don't show
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white text-xs py-2.5 px-4 shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Download className="w-4 h-4 text-white animate-bounce" />
          </div>
          <div>
            <span className="font-bold block sm:inline">
              تسطيب تطبيق النظام المحاسبي على جهازك
            </span>
            <span className="text-emerald-100 hidden sm:inline mr-2 text-[11px]">
              (يعمل كتطبيق هاتف أو كمبيوتر مستقل، بدون إنترنت وفائق السرعة)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mr-auto sm:mr-0">
          <button
            onClick={onInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>تسطيب التطبيق الآن</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
