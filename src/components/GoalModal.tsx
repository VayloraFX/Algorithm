import React from 'react';
import { Trophy, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface GoalModalProps {
  isProfit: boolean;
  amount: number;
  targetAmount: number;
  onClose: () => void;
  onResetSession: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isProfit,
  amount,
  targetAmount,
  onClose,
  onResetSession,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full sm:max-w-[380px] bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 flex flex-col items-center text-center relative overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Background Accent Glow */}
        <div className={`absolute -top-20 -left-20 w-44 h-44 rounded-full blur-3xl opacity-15 ${
          isProfit ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />
        <div className={`absolute -bottom-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-15 ${
          isProfit ? 'bg-amber-400' : 'bg-rose-500'
        }`} />

        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isProfit ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500' : 'bg-rose-500'}`} />

        {/* Icon Header with Confetti Effect */}
        <div className="relative mb-3 mt-1">
          {isProfit && (
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          )}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${
            isProfit 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {isProfit ? (
              <Trophy className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-rose-600" />
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">
            {isProfit ? '🎉 Session Milestone Reached 🎉' : 'Risk Management Trigger'}
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
            {isProfit ? 'Congratulations!' : 'Stop Loss Limit Hit'}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 px-1 leading-relaxed">
            {isProfit
              ? `You successfully reached your take profit target of $${targetAmount.toFixed(2)}. Amazing session performance!`
              : `Session stop loss of $${targetAmount.toFixed(2)} was reached. Bot has safely paused to protect capital.`}
          </p>
        </div>

        {/* Financial Summary Card */}
        <div className={`w-full p-4 rounded-2xl mb-6 flex items-center justify-between border shadow-xs ${
          isProfit 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700' 
            : 'bg-rose-50/80 border-rose-200 text-rose-700'
        }`}>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total P&L</span>
            <span className="text-xs font-medium text-slate-600">Volatility 75 Index</span>
          </div>
          <span className="text-lg font-mono font-black">
            {amount >= 0 ? '+' : ''}${amount.toFixed(2)} USD
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              sound.playTap();
              onResetSession();
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-950" />
            <span className="uppercase tracking-wide">Reset Session & Continue</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Review Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
