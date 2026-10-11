import React from 'react';
import { ActiveContract, MarketAsset } from '../types.ts';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface ActiveContractCardProps {
  contract: ActiveContract;
  market: MarketAsset;
}

export const ActiveContractCard: React.FC<ActiveContractCardProps> = ({
  contract,
  market,
}) => {
  const isRise = contract.contractType === 'RISE';
  const isWinning =
    isRise
      ? contract.currentSpot > contract.entrySpot
      : contract.currentSpot < contract.entrySpot;

  const spotDiff = contract.currentSpot - contract.entrySpot;
  const progressPercent = (contract.completedTicks / contract.totalTicks) * 100;

  return (
    <div className={`rounded-2xl border p-2.5 transition-all shadow-xs ${
      isWinning 
        ? 'bg-[#0ECB81]/10 border-[#0ECB81]/40 ring-1 ring-[#0ECB81]/30' 
        : 'bg-[#F6465D]/10 border-[#F6465D]/40 ring-1 ring-[#F6465D]/30'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg text-white font-bold text-xs flex items-center justify-center ${
            isRise ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
          }`}>
            {isRise ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-900">
                {contract.contractType} Contract
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {contract.totalTicks} Ticks
              </span>
            </div>
            <div className="text-[10px] text-slate-500">{contract.marketName}</div>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="text-right">
          <div className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
            isWinning ? 'bg-[#0ECB81]/25 text-[#0bb574]' : 'bg-[#F6465D]/25 text-[#F6465D]'
          }`}>
            {isWinning ? 'Winning Spot' : 'Losing Spot'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Deriv Payout: +${(contract.stake * contract.payoutRate).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Spot Comparison Grid */}
      <div className="grid grid-cols-2 gap-2 my-2 p-2 rounded-xl bg-white/90 border border-[#e6decb]">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-medium block">Entry Spot</span>
          <span className="text-xs font-bold font-mono text-slate-700">
            {contract.entrySpot.toFixed(market.decimalPlaces)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-medium block">Current Spot</span>
          <span className={`text-xs font-bold font-mono ${isWinning ? 'text-[#0bb574]' : 'text-[#F6465D]'}`}>
            {contract.currentSpot.toFixed(market.decimalPlaces)} ({spotDiff >= 0 ? '+' : ''}{spotDiff.toFixed(market.decimalPlaces)})
          </span>
        </div>
      </div>

      {/* Tick Progress Tracker */}
      <div className="mt-1.5">
        <div className="flex items-center justify-between text-[11px] mb-1 font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Tick Progress</span>
          </div>
          <span className="font-mono font-bold text-slate-800">
            Tick {contract.completedTicks} of {contract.totalTicks}
          </span>
        </div>

        <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isWinning ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Individual tick outcome markers */}
        <div className="flex items-center justify-between mt-1 px-0.5">
          {Array.from({ length: contract.totalTicks }).map((_, i) => {
            const hasPassed = i < contract.completedTicks;
            const isCurrent = i === contract.completedTicks - 1;
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full border transition-all ${
                  hasPassed
                    ? isWinning
                      ? 'bg-[#0ECB81] border-[#0bb574]'
                      : 'bg-[#F6465D] border-[#e03f54]'
                    : 'bg-stone-200 border-stone-300'
                } ${isCurrent ? 'ring-2 ring-[#F0B90B] scale-110' : ''}`}
                title={`Tick ${i + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
