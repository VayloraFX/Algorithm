import React from 'react';
import { AdviceSignal } from '../types.ts';
import { TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

interface AdviceCardProps {
  signal: AdviceSignal;
  botRunning: boolean;
  minConfidence: number;
}

export const AdviceCard: React.FC<AdviceCardProps> = ({
  signal,
  botRunning,
  minConfidence,
}) => {
  const isRise = signal.direction === 'RISE';
  const isFall = signal.direction === 'FALL';
  const isWait = signal.direction === 'WAIT';

  const theme = isRise
    ? {
        bg: 'bg-[#0ECB81]/10',
        border: 'border-[#0ECB81]/35',
        accentText: 'text-[#0bb574]',
        badgeBg: 'bg-[#0ECB81]',
        badgeText: 'text-white',
        statusBg: 'bg-[#0ECB81]/20 text-[#0bb574]',
      }
    : isFall
    ? {
        bg: 'bg-[#F6465D]/10',
        border: 'border-[#F6465D]/35',
        accentText: 'text-[#F6465D]',
        badgeBg: 'bg-[#F6465D]',
        badgeText: 'text-white',
        statusBg: 'bg-[#F6465D]/20 text-[#F6465D]',
      }
    : {
        bg: 'bg-white',
        border: 'border-[#e6decb]',
        accentText: 'text-slate-600',
        badgeBg: 'bg-slate-400',
        badgeText: 'text-white',
        statusBg: 'bg-stone-100 text-stone-600',
      };

  const meetsThreshold = !isWait && signal.confidence >= minConfidence && signal.hasCrossoverSignal;
  const reasonText = signal.rationale[0] || 'Confluence scanning in progress';

  return (
    <div className={`rounded-xl border ${theme.border} ${theme.bg} p-2.5 transition-all shadow-xs`}>
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Direction Icon + Compact Details */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg ${theme.badgeBg} ${theme.badgeText} flex items-center justify-center shrink-0 shadow-xs`}>
            {isRise ? (
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            ) : isFall ? (
              <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Clock className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-900 truncate">
                {signal.title}
              </span>
              <span className={`text-xs font-black font-mono ${theme.accentText}`}>
                {signal.hasCrossoverSignal ? `${signal.confidence}%` : '50%'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Optimal Expiry: {signal.suggestedDurationTicks} Ticks · {reasonText}
            </div>
          </div>
        </div>

        {/* Right: Status Badge */}
        <div className="shrink-0 text-right">
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm block ${
            botRunning && meetsThreshold
              ? 'bg-[#0ECB81] text-white shadow-xs'
              : theme.statusBg
          }`}>
            {botRunning ? (meetsThreshold ? '1 Order Ready' : 'Monitoring') : 'Standby'}
          </span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
            {signal.hasCrossoverSignal ? 'Signal Active' : 'No Signal'}
          </span>
        </div>
      </div>
    </div>
  );
};
