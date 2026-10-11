import React, { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    // Exactly 6 seconds display time, then dismiss to show dashboard unconditionally
    const timer = setTimeout(() => {
      onDismissRef.current();
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#f6f1e8] text-slate-900 flex flex-col items-center justify-center select-none animate-in fade-in duration-300">
      {/* Dashboard Header Logo Style */}
      <div className="w-16 h-16 rounded-2xl bg-[#181A20] border border-amber-500/40 flex items-center justify-center text-[#F0B90B] shadow-lg mb-6">
        <Zap className="w-8 h-8 text-[#F0B90B] fill-[#F0B90B]" />
      </div>

      {/* App Name & Subtitle */}
      <div className="text-center space-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            G-sqaud
          </h1>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
            V75
          </span>
        </div>
        <p className="text-xs font-mono tracking-wider text-slate-500 uppercase font-bold">
          Algorithmic Trading Bot Suite
        </p>
      </div>
    </div>
  );
};
