import React, { useState } from 'react';
import { BotConfig, AccountProfile } from '../types.ts';
import { 
  Sliders, 
  Key, 
  RefreshCw, 
  Check, 
  Cpu
} from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface SettingsViewProps {
  botConfig: BotConfig;
  onUpdateBotConfig: (updates: Partial<BotConfig>) => void;
  account: AccountProfile;
  onUpdateAccount: (updates: Partial<AccountProfile>) => void;
  onResetBalance: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  botConfig,
  onUpdateBotConfig,
  account,
  onUpdateAccount,
  onResetBalance,
}) => {
  const [tokenInput, setTokenInput] = useState(account.derivToken);
  const [isSavedToken, setIsSavedToken] = useState(false);

  const handleSaveToken = () => {
    sound.playTap();
    onUpdateAccount({
      derivToken: tokenInput,
      derivConnected: tokenInput.trim().length > 5,
    });
    setIsSavedToken(true);
    setTimeout(() => setIsSavedToken(false), 2000);
  };

  return (
    <div className="px-4 py-3 space-y-3.5 pb-8 min-h-full">
      {/* Bot Execution & Risk Controls */}
      <div className="bg-white rounded-2xl border border-[#e6decb] p-4 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F0B90B]/20 text-[#181A20] flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Bot Risk Management</h2>
            <div className="text-[11px] text-slate-500">Parameters for Rise & Fall Execution</div>
          </div>
        </div>

        {/* Base Stake & Duration */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Base Stake (USD)
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-400">$</span>
              <input
                type="number"
                min="0.35"
                max="5000"
                step="0.5"
                value={botConfig.baseStake}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 1;
                  onUpdateBotConfig({ baseStake: val, currentStake: val });
                }}
                className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/30 focus:border-[#F0B90B]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Duration (Ticks)
            </label>
            <div className="flex items-center gap-1">
              {[1, 3, 5, 10].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    sound.playTap();
                    onUpdateBotConfig({ durationTicks: t });
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                    botConfig.durationTicks === t
                      ? 'bg-[#F0B90B] border-[#F0B90B] text-[#181A20] font-black shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold'
                  }`}
                >
                  {t}t
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Martingale Factor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700">
              Martingale Recovery Multiplier
            </label>
            <span className="text-[11px] font-mono font-bold text-[#b38600]">
              {botConfig.martingaleFactor === 1 ? 'Disabled (1.0x)' : `${botConfig.martingaleFactor}x`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { val: 1.0, label: 'Off' },
              { val: 1.5, label: '1.5x' },
              { val: 2.0, label: '2.0x' },
              { val: 2.2, label: '2.2x' },
            ].map((m) => (
              <button
                key={m.label}
                onClick={() => {
                  sound.playTap();
                  onUpdateBotConfig({ martingaleFactor: m.val });
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  botConfig.martingaleFactor === m.val
                    ? 'bg-[#181A20] border-[#181A20] text-[#F0B90B]'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Multiplies stake after a loss to recover drawdowns; resets to base stake on a win.
          </p>
        </div>

        {/* Take Profit & Stop Loss */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-bold text-[#0bb574] block mb-1">
              Take Profit Target
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs font-bold text-[#0bb574]">$</span>
              <input
                type="number"
                min="5"
                max="10000"
                step="5"
                value={botConfig.takeProfit}
                onChange={(e) => onUpdateBotConfig({ takeProfit: parseFloat(e.target.value) || 20 })}
                className="w-full pl-6 pr-2 py-2 rounded-xl border border-[#0ECB81]/40 text-xs font-mono font-bold text-[#0bb574] bg-[#0ECB81]/10 focus:outline-none focus:ring-2 focus:ring-[#0ECB81]/25 focus:border-[#0ECB81]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#F6465D] block mb-1">
              Stop Loss Limit
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs font-bold text-[#F6465D]">$</span>
              <input
                type="number"
                min="5"
                max="10000"
                step="5"
                value={botConfig.stopLoss}
                onChange={(e) => onUpdateBotConfig({ stopLoss: parseFloat(e.target.value) || 15 })}
                className="w-full pl-6 pr-2 py-2 rounded-xl border border-[#F6465D]/40 text-xs font-mono font-bold text-[#F6465D] bg-[#F6465D]/10 focus:outline-none focus:ring-2 focus:ring-[#F6465D]/25 focus:border-[#F6465D]"
              />
            </div>
          </div>
        </div>

        {/* Minimum Confidence Slider */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[11px] font-bold text-slate-700">Min. Signal Confidence</span>
            <span className="font-mono font-bold text-slate-900">{botConfig.minConfidence}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="92"
            step="1"
            value={botConfig.minConfidence}
            onChange={(e) => onUpdateBotConfig({ minConfidence: parseInt(e.target.value) })}
            className="w-full accent-[#F0B90B] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>60% (Moderate Filter)</span>
            <span>92% (High Filter)</span>
          </div>
        </div>
      </div>

      {/* Deriv API Token Integration */}
      <div className="bg-white rounded-2xl border border-[#e6decb] p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Deriv Account Connection</h2>
            <div className="text-[11px] text-slate-500">API Token for Live & Virtual Accounts</div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Deriv API Token
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="password"
              placeholder="e.g. 1a2b3c4d5e6f7g8"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/30 focus:border-[#F0B90B]"
            />
            {/* Binance Button */}
            <button
              onClick={handleSaveToken}
              className="px-4 py-2 rounded-xl bg-[#F0B90B] hover:bg-[#e0ab08] text-[#181A20] text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              {isSavedToken ? <Check className="w-3.5 h-3.5 text-[#181A20]" /> : null}
              <span>{isSavedToken ? 'Saved' : 'Save'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Generate an API token with 'Read' and 'Trade' permissions in your Deriv Account Settings.
          </p>
        </div>

        {/* Demo reset button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Reset Demo Balance</span>
            <span className="text-[10px] text-slate-400">Restore default $10,000.00 USD</span>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onResetBalance();
            }}
            className="px-3 py-1.5 rounded-xl border border-[#e6decb] hover:bg-[#F0B90B]/15 hover:border-[#F0B90B] text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tech Architecture Badge */}
      <div className="bg-[#f0ebe0] rounded-2xl border border-[#e2d9c8] p-3.5 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
          <Cpu className="w-3.5 h-3.5 text-[#181A20]" />
          <span>Deriv High-Frequency Engine</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Enforcing 1 order per crossover signal rule · Zero duplicate orders · 60fps tick processing.
        </p>
      </div>
    </div>
  );
};
