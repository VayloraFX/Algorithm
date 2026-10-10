import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { LogEntry } from '../types.ts';
import { sound } from '../utils/sound.ts';

interface ConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
  botRunning: boolean;
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({
  logs,
  onClear,
  botRunning,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getTagColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'WIN':
        return 'text-[#0ECB81]';
      case 'LOSS':
        return 'text-[#F6465D]';
      case 'EXEC':
        return 'text-[#F0B90B]';
      case 'SIGNAL':
        return 'text-[#F0B90B]';
      case 'WARN':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 text-slate-200 select-none m-0 p-0 shrink-0">
      {/* Flat Card Header (Wide edge-to-edge) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#F0B90B]" />
          <span className="text-[11px] font-bold tracking-wider uppercase font-mono text-white">
            BOT CONSOLE
          </span>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                botRunning ? 'bg-[#0ECB81] animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{botRunning ? 'ACTIVE' : 'IDLE'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">
            {logs.length} EVENTS
          </span>
          <button
            onClick={() => {
              sound.playTap();
              onClear();
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stream Window (Concise, single-line, clean values) */}
      <div
        ref={scrollRef}
        className="h-36 overflow-y-auto px-4 py-2 font-mono text-[11px] leading-relaxed space-y-1 select-text scroll-smooth"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-[11px] font-mono">
            Ready · Waiting for bot triggers...
          </div>
        ) : (
          logs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });

            return (
              <div
                key={log.id}
                className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis hover:bg-slate-800/40 py-0.5 rounded px-1 transition-colors"
              >
                <span className="text-slate-500 shrink-0 text-[10px]">
                  {timeStr}
                </span>
                <span
                  className={`shrink-0 text-[10px] uppercase font-bold ${getTagColor(
                    log.type
                  )}`}
                >
                  [{log.type === 'EXEC' ? 'TRADE' : log.type}]
                </span>
                <span className="text-slate-200 truncate text-[11px]">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
