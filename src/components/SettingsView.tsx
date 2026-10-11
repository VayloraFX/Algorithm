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

  const [baseStakeInput, setBaseStakeInput] = useState(botConfig.baseStake.toString());
  const [takeProfitInput, setTakeProfitInput] = useState(botConfig.takeProfit.toString());
  const [stopLossInput, setStopLossInput] = useState(botConfig.stopLoss.toString());

  React.useEffect(() => {
    setBaseStakeInput(botConfig.baseStake.toString());
  }, [botConfig.baseStake]);

  React.useEffect(() => {
    setTakeProfitInput(botConfig.takeProfit.toString());
  }, [botConfig.takeProfit]);

  React.useEffect(() => {
    setStopLossInput(botConfig.stopLoss.toString());
  }, [botConfig.stopLoss]);

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

        {/* Base Stake */}
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
              value={baseStakeInput}
              onChange={(e) => {
                setBaseStakeInput(e.target.value);
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  onUpdateBotConfig({ baseStake: val, currentStake: val });
                }
              }}
              onBlur={() => {
                const val = parseFloat(baseStakeInput);
                if (isNaN(val) || val <= 0) {
                  setBaseStakeInput(botConfig.baseStake.toString());
                }
              }}
              className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/30 focus:border-[#F0B90B]"
            />
          </div>
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
                value={takeProfitInput}
                onChange={(e) => {
                  setTakeProfitInput(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    onUpdateBotConfig({ takeProfit: val });
                  }
                }}
                onBlur={() => {
                  const val = parseFloat(takeProfitInput);
                  if (isNaN(val) || val < 0) {
                    setTakeProfitInput(botConfig.takeProfit.toString());
                  }
                }}
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
                value={stopLossInput}
                onChange={(e) => {
                  setStopLossInput(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    onUpdateBotConfig({ stopLoss: val });
                  }
                }}
                onBlur={() => {
                  const val = parseFloat(stopLossInput);
                  if (isNaN(val) || val < 0) {
                    setStopLossInput(botConfig.stopLoss.toString());
                  }
                }}
                className="w-full pl-6 pr-2 py-2 rounded-xl border border-[#F6465D]/40 text-xs font-mono font-bold text-[#F6465D] bg-[#F6465D]/10 focus:outline-none focus:ring-2 focus:ring-[#F6465D]/25 focus:border-[#F6465D]"
              />
            </div>
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
