import React, { useState } from 'react';
import { Headphones, ArrowLeft, RefreshCw, AlertCircle, MessageSquare } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface SupportViewProps {
  onBack: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const widgetUrl = 'https://embed.tawk.to/6acbd7f45184fb34c4a61537/1k4m475a8';

  const handleRefresh = () => {
    sound.playTap();
    setIsLoading(true);
    setHasError(false);
    setRetryKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-[#faf8f4] animate-in fade-in duration-200 select-none pb-14">
      {/* Support Header */}
      <div className="px-4 py-3 bg-white border-b border-[#e6decb] flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playTap();
              onBack();
            }}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#e6decb] flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-[#F0B90B]" />
              <h2 className="text-sm font-black text-slate-900 tracking-tight">G-sqaud Support</h2>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live agents online · Tawk.to secure chat
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#e6decb] text-slate-600 transition-colors cursor-pointer"
          title="Reload Chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat iframe Container */}
      <div className="flex-1 relative w-full bg-white overflow-hidden flex flex-col">
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#faf8f4] p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/20 border border-[#F0B90B]/40 flex items-center justify-center animate-spin">
              <MessageSquare className="w-5 h-5 text-[#181A20]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Connecting to Support...</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Establishing secure connection with tawk.to inbox</p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-900">Connection Failed</h3>
              <p className="text-[10px] text-slate-500 max-w-[240px]">
                Unable to load the support chat service. Please check your internet connection and try again.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-[#181A20] text-[#F0B90B] font-bold text-xs hover:bg-black transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        <iframe
          key={retryKey}
          src={widgetUrl}
          title="G-sqaud Support Chat"
          className="w-full h-full border-0 flex-1"
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          allow="microphone; camera; geolocation; clipboard-write"
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-stone-100 border-t border-[#e6decb] text-center shrink-0">
        <p className="text-[9px] text-slate-500 font-mono">
          🔒 Secure End-to-End Encrypted Support Channel · G-sqaud Trading Suite
        </p>
      </div>
    </div>
  );
};
