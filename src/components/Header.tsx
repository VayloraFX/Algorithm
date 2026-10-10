import React, { useState } from 'react';
import { 
  ChevronDown, 
  Wallet, 
  Check, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Layers
} from 'lucide-react';
import { MarketAsset, AccountProfile } from '../types.ts';
import { DERIV_MARKETS } from '../data/markets.ts';
import { sound } from '../utils/sound.ts';

interface HeaderProps {
  currentMarket: MarketAsset;
  onSelectMarket: (market: MarketAsset) => void;
  account: AccountProfile;
  onToggleAccountMode: (isDemo: boolean) => void;
  currentPrice: number;
  lastDiff: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMarket,
  onSelectMarket,
  account,
  onToggleAccountMode,
  currentPrice,
  lastDiff,
}) => {
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 px-4 py-2.5 bg-[#faf8f4]/95 backdrop-blur-md border-b border-[#e6decb] flex items-center justify-between shrink-0 shadow-xs">
        {/* Market Selector Pill */}
        <button
          onClick={() => {
            sound.playTap();
            setShowMarketModal(true);
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-stone-50 transition-colors border border-[#e6decb] text-left group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-[#F0B90B]/20 border border-[#F0B90B]/30 flex items-center justify-center text-[#181A20] shrink-0 font-black text-xs">
            D
          </div>
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-900 truncate block max-w-[110px]">
                {currentMarket.symbol}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </div>
            <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {currentMarket.name.replace('Index', '').trim()}
            </div>
          </div>
        </button>

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

      {/* Market Selector Modal */}
      {showMarketModal && (
        <div 
          onClick={() => setShowMarketModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div 
            className="w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900">Select Deriv Volatility Market</h3>
              </div>
              <button 
                onClick={() => {
                  sound.playTap();
                  setShowMarketModal(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md"
              >
                Done
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-3">
              Deriv Rise & Fall contracts evaluate price movement on standard ticks (1-10 ticks duration).
            </p>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {DERIV_MARKETS.map((market) => {
                const isSelected = market.symbol === currentMarket.symbol;
                return (
                  <button
                    key={market.symbol}
                    onClick={() => {
                      sound.playTap();
                      onSelectMarket(market);
                      setShowMarketModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-200 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {market.symbol.includes('1HZ') ? '1s' : 'Ix'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{market.symbol}</span>
                          <span className="text-[11px] font-normal text-slate-500">· {market.category}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{market.name}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Account Switcher Modal */}
      {showAccountModal && (
        <div 
          onClick={() => setShowAccountModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div 
            className="w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Trading Account</h3>
              </div>
              <button 
                onClick={() => {
                  sound.playTap();
                  setShowAccountModal(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {/* Demo Account */}
              <button
                onClick={() => {
                  sound.playTap();
                  onToggleAccountMode(true);
                  setShowAccountModal(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  account.isDemo
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300 shadow-xs'
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                      Deriv Virtual
                    </span>
                    <span className="text-xs font-semibold text-slate-900">VRTC{Math.floor(account.balance % 900000 + 100000)}</span>
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    ${(account.isDemo ? account.balance : 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Recommended for testing advice bot logic safely</div>
                </div>
                {account.isDemo && <Check className="w-5 h-5 text-amber-600" />}
              </button>

              {/* Real Account */}
              <button
                onClick={() => {
                  sound.playTap();
                  onToggleAccountMode(false);
                  setShowAccountModal(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  !account.isDemo
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300 shadow-xs'
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900">
                      Deriv Real USD
                    </span>
                    <span className="text-xs font-semibold text-slate-900">CR819230</span>
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    ${(!account.isDemo ? account.balance : 1248.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Live Deriv server API connection</div>
                </div>
                {!account.isDemo && <Check className="w-5 h-5 text-emerald-600" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
