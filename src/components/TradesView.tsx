import React, { useState } from 'react';
import { TradeRecord, AccountProfile } from '../types.ts';
import { 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface TradesViewProps {
  trades: TradeRecord[];
  account: AccountProfile;
  onClearHistory: () => void;
}

export const TradesView: React.FC<TradesViewProps> = ({
  trades,
  account,
  onClearHistory,
}) => {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');

  const filteredTrades = trades.filter((t) => {
    if (filter === 'won') return t.status === 'WON';
    if (filter === 'lost') return t.status === 'LOST';
    return true;
  });

  const winRate = trades.length > 0
    ? ((trades.filter((t) => t.status === 'WON').length / trades.length) * 100).toFixed(1)
    : '0.0';

  const totalStaked = trades.reduce((acc, t) => acc + t.stake, 0);
  const netProfit = trades.reduce((acc, t) => acc + t.profit, 0);

  return (
    <div className="px-4 py-3 space-y-3.5 pb-8 min-h-full">
      {/* Performance Summary Card */}
      <div className="bg-white rounded-2xl border border-[#e6decb] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F0B90B]/20 text-[#181A20] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Trade Performance</h2>
              <div className="text-[11px] text-slate-500">Deriv Rise & Fall Contract Log</div>
            </div>
          </div>
          {trades.length > 0 && (
            <button
              onClick={() => {
                sound.playTap();
                onClearHistory();
              }}
              className="text-[11px] text-slate-400 hover:text-[#F6465D] flex items-center gap-1 p-1 cursor-pointer"
              title="Clear Trade History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Net P&L</span>
            <span className={`text-base font-extrabold font-mono ${
              netProfit >= 0 ? 'text-[#0bb574]' : 'text-[#F6465D]'
            }`}>
              {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
            </span>
          </div>

          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Win Rate</span>
            <span className="text-base font-extrabold font-mono text-slate-900">
              {winRate}%
            </span>
          </div>

          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Total Trades</span>
            <span className="text-sm font-bold font-mono text-slate-800">
              {trades.length} ({trades.filter(t => t.status === 'WON').length}W · {trades.filter(t => t.status === 'LOST').length}L)
            </span>
          </div>

          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Volume Staked</span>
            <span className="text-sm font-bold font-mono text-slate-800">
              ${totalStaked.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Segmented Filter Control */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Filter Contracts:</span>
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200/60">
            {(['all', 'won', 'lost'] as const).map((tab) => {
              const active = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    sound.playTap();
                    setFilter(tab);
                  }}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-[#181A20] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="space-y-2">
        {filteredTrades.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 p-8 text-center text-slate-400 shadow-xs">
            <TrendingUp className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
            <div className="text-xs font-bold text-slate-600">No Contract Logs Found</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Start the Auto Bot to automatically build your journal.
            </div>
          </div>
        ) : (
          filteredTrades.map((t) => {
            const isWon = t.status === 'WON';
            const isRise = t.contractType === 'RISE';
            const spotDiff = t.exitSpot - t.entrySpot;

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-[#e6decb] p-3.5 shadow-xs transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg text-white font-bold text-xs ${
                      isRise ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                    }`}>
                      {isRise ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900">
                          {t.contractType}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] font-semibold text-slate-600">
                          {t.marketSymbol}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {t.durationTicks} Ticks
                      </div>
                    </div>
                  </div>

                  {/* Outcome Profit Badge */}
                  <div className="text-right">
                    <div className={`text-xs font-black font-mono ${
                      isWon ? 'text-[#0bb574]' : 'text-[#F6465D]'
                    }`}>
                      {isWon ? '+' : ''}${t.profit.toFixed(2)} USD
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isWon ? 'bg-[#0ECB81]/15 text-[#0bb574]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Spot Execution Numbers */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Entry Spot</span>
                    <span className="font-mono font-bold text-slate-700">{t.entrySpot.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Exit Spot</span>
                    <span className="font-mono font-bold text-slate-700">{t.exitSpot.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Stake</span>
                    <span className="font-mono font-bold text-slate-700">${t.stake.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
