import React, { useState } from 'react';
import { 
  ChevronDown, 
  Activity, 
  Zap
} from 'lucide-react';
import { AccountProfile } from '../types.ts';
import { sound } from '../utils/sound.ts';

interface HeaderProps {
  account: AccountProfile;
  onToggleAccountMode: (isDemo: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  onToggleAccountMode,
}) => {
  const [showAccountModal, setShowAccountModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 px-4 py-2.5 bg-[#faf8f4]/95 backdrop-blur-md border-b border-[#e6decb] flex items-center justify-between shrink-0 shadow-xs">
        {/* G-sqaud Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#181A20] border border-amber-500/40 flex items-center justify-center text-[#F0B90B] font-black text-xs shadow-xs">
            <Zap className="w-4 h-4 text-[#F0B90B] fill-[#F0B90B]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black tracking-tight text-slate-900">
                G-sqaud
              </span>
              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-mono">
                V75
              </span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono tracking-tighter">
              Algorithmic Bot
            </div>
          </div>
        </div>

        {/* Balance & Account Mode */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playTap();
              setShowAccountModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-[#e6decb] transition-colors text-right cursor-pointer"
          >
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${account.isDemo ? 'bg-[#F0B90B]/25 text-[#181A20]' : 'bg-[#0ECB81]/25 text-[#0bb574]'}`}>
                  {account.isDemo ? 'Demo' : 'Real'}
                </span>
                <span className="text-xs font-black font-mono text-slate-900">
                  ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{account.pingMs}ms</span>
                <span className="text-slate-300">·</span>
                <span>Deriv</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Account Mode Modal */}
      {showAccountModal && (
        <div 
          onClick={() => setShowAccountModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div 
            className="w-full sm:max-w-[340px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Account Mode</h3>
              </div>
              <button 
                onClick={() => {
                  sound.playTap();
                  setShowAccountModal(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md"
              >
                Done
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  sound.playTap();
                  onToggleAccountMode(true);
                  setShowAccountModal(false);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  account.isDemo 
                    ? 'bg-[#F0B90B]/10 border-[#F0B90B] text-slate-900 font-bold shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F0B90B]" />
                  <div className="text-left">
                    <div className="text-xs font-black">Demo Account</div>
                    <div className="text-[10px] text-slate-400">Virtual $10,000 USD funds</div>
                  </div>
                </div>
                {account.isDemo && <span className="text-xs font-bold text-[#F0B90B]">ACTIVE</span>}
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  onToggleAccountMode(false);
                  setShowAccountModal(false);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  !account.isDemo 
                    ? 'bg-[#0ECB81]/10 border-[#0ECB81] text-slate-900 font-bold shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0ECB81]" />
                  <div className="text-left">
                    <div className="text-xs font-black">Real Account</div>
                    <div className="text-[10px] text-slate-400">Live Deriv Token Trading</div>
                  </div>
                </div>
                {!account.isDemo && <span className="text-xs font-bold text-[#0bb574]">ACTIVE</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
