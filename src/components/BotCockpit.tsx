import React from 'react';
import { 
  Play, 
  Pause
} from 'lucide-react';
import { 
  MarketAsset, 
  AdviceSignal, 
  BotConfig, 
  ActiveContract, 
  AccountProfile,
  LogEntry
} from '../types.ts';
import { TickChart } from './TickChart.tsx';
import { AdviceCard } from './AdviceCard.tsx';
import { ActiveContractCard } from './ActiveContractCard.tsx';
import { ConsoleLog } from './ConsoleLog.tsx';
import { sound } from '../utils/sound.ts';

interface BotCockpitProps {
  currentMarket: MarketAsset;
  ticks: any[];
  signal: AdviceSignal;
  botConfig: BotConfig;
  onUpdateBotConfig: (updates: Partial<BotConfig>) => void;
  activeContract: ActiveContract | null;
  account: AccountProfile;
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const BotCockpit: React.FC<BotCockpitProps> = ({
  currentMarket,
  ticks,
  signal,
  botConfig,
  onUpdateBotConfig,
  activeContract,
  account,
  logs,
  onClearLogs,
}) => {
  const toggleBot = () => {
    sound.playTap();
    onUpdateBotConfig({ isRunning: !botConfig.isRunning });
  };

  const winRate = account.tradesCount > 0 
    ? ((account.winsCount / account.tradesCount) * 100).toFixed(0) 
    : '0';

  return (
    <div className="min-h-full flex flex-col justify-between">
      <div className="px-4 pt-3 space-y-3 flex-1 pb-3">
        {/* Redesigned Bot Control Deck (Authentic Binance Action Engine) */}
        <div className={`rounded-2xl p-3.5 border transition-all ${
          botConfig.isRunning
            ? 'bg-[#0ECB81]/10 border-[#0ECB81]/40 ring-1 ring-[#0ECB81]/25 shadow-xs'
            : 'bg-white border-[#e6decb] shadow-xs'
        }`}>
          {/* Top Meta Line */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  botConfig.isRunning ? 'bg-[#0ECB81] animate-ping' : 'bg-slate-400'
                }`}
              />
              <span className={`text-xs font-black tracking-wider uppercase ${
                botConfig.isRunning ? 'text-[#0bb574]' : 'text-slate-700'
              }`}>
                {botConfig.isRunning ? 'Auto Pilot Active' : 'Auto Pilot Standby'}
              </span>
            </div>

            <div className="text-[10px] font-mono font-bold text-slate-500">
              ${botConfig.currentStake.toFixed(2)} USD · {botConfig.durationTicks} Ticks
            </div>
          </div>

          {/* Full-Width Binance Button */}
          <button
            onClick={toggleBot}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer ${
              botConfig.isRunning
                ? 'bg-[#F6465D] hover:bg-[#e03f54] text-white shadow-md shadow-[#F6465D]/25'
                : 'bg-[#F0B90B] hover:bg-[#e0ab08] text-[#181A20] shadow-md shadow-[#F0B90B]/25'
            }`}
          >
            {botConfig.isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white text-white" />
                <span className="tracking-wide uppercase font-extrabold">Pause Auto Pilot</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#181A20] text-[#181A20]" />
                <span className="tracking-wide uppercase font-black text-[#181A20]">Start Auto Pilot</span>
              </>
            )}
          </button>
        </div>

        {/* Live Tick Chart */}
        <TickChart
          ticks={ticks}
          market={currentMarket}
          activeContract={activeContract}
        />

        {/* Active Contract OR Live Compact Advice Card */}
        {activeContract ? (
          <ActiveContractCard contract={activeContract} market={currentMarket} />
        ) : (
          <AdviceCard
            signal={signal}
            botRunning={botConfig.isRunning}
            minConfidence={botConfig.minConfidence}
          />
        )}

        {/* Session Quick Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl border border-[#e6decb] p-2.5 text-center shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Session P&L</span>
            <span className={`text-xs font-bold font-mono ${
              account.todayProfit >= 0 ? 'text-[#0bb574]' : 'text-[#F6465D]'
            }`}>
              {account.todayProfit >= 0 ? '+' : ''}${account.todayProfit.toFixed(2)}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#e6decb] p-2.5 text-center shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Win Rate</span>
            <span className="text-xs font-bold font-mono text-slate-800">
              {winRate}%
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#e6decb] p-2.5 text-center shadow-xs">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Trades (W/L)</span>
            <span className="text-xs font-bold font-mono text-slate-800">
              {account.winsCount}W · {account.lossesCount}L
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Flat Console Log: Joins seamlessly with the bottom navbar with 0 space */}
      <ConsoleLog
        logs={logs}
        onClear={onClearLogs}
        botRunning={botConfig.isRunning}
      />
    </div>
  );
};
