import React, { useMemo } from 'react';
import { Tick, MarketAsset, ActiveContract } from '../types.ts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickChartProps {
  ticks: Tick[];
  market: MarketAsset;
  activeContract: ActiveContract | null;
}

export const TickChart: React.FC<TickChartProps> = ({
  ticks,
  market,
  activeContract,
}) => {
  const currentTick = ticks[ticks.length - 1];
  const prevTick = ticks[ticks.length - 2];

  const chartData = useMemo(() => {
    if (ticks.length < 2) return null;

    const visibleTicks = ticks.slice(-28);
    const quotes = visibleTicks.map((t) => t.quote);
    if (activeContract) {
      quotes.push(activeContract.entrySpot);
    }

    const min = Math.min(...quotes);
    const max = Math.max(...quotes);
    const range = max - min || 1;
    const padding = range * 0.15;
    const yMin = min - padding;
    const yMax = max + padding;
    const yRange = yMax - yMin;

    const width = 380;
    const height = 150;

    const points = visibleTicks.map((t, idx) => {
      const x = (idx / (visibleTicks.length - 1)) * (width - 24) + 12;
      const y = height - ((t.quote - yMin) / yRange) * (height - 30) - 15;
      return { x, y, tick: t };
    });

    // Create SVG path
    const pathD = points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      return `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    // Area fill
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    let entryY: number | null = null;
    if (activeContract) {
      entryY = height - ((activeContract.entrySpot - yMin) / yRange) * (height - 30) - 15;
    }

    return {
      points,
      pathD,
      areaD,
      yMin,
      yMax,
      entryY,
      width,
      height,
    };
  }, [ticks, activeContract]);

  if (!currentTick || !chartData) {
    return (
      <div className="h-44 bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-center text-xs text-slate-400">
        Streaming Deriv Ticks...
      </div>
    );
  }

  const isUp = currentTick.direction === 'up';
  const isDown = currentTick.direction === 'down';
  const priceColor = isUp ? 'text-[#0bb574]' : isDown ? 'text-[#F6465D]' : 'text-slate-800';

  return (
    <div className="bg-white rounded-2xl border border-[#e6decb] p-3.5 shadow-xs relative overflow-hidden">
      {/* Top Bar inside chart: Price & Meta */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-extrabold font-mono tracking-tight ${priceColor}`}>
              {currentTick.quote.toFixed(market.decimalPlaces)}
            </span>
            <div className={`flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
              isUp ? 'bg-[#0ECB81]/15 text-[#0bb574]' : isDown ? 'bg-[#F6465D]/15 text-[#F6465D]' : 'bg-stone-50 text-stone-600'
            }`}>
              {isUp ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : isDown ? <TrendingDown className="w-3 h-3 mr-0.5 inline" /> : null}
              {currentTick.diff >= 0 ? '+' : ''}{currentTick.diff.toFixed(market.decimalPlaces)}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Deriv Tick Feed · Every {market.tickTimeMs / 1000}s
          </div>
        </div>

        {/* Contract In-flight marker badge */}
        {activeContract ? (
          <div className={`px-2 py-1 rounded-lg text-right ${
            activeContract.contractType === 'RISE' ? 'bg-[#0ECB81]/15 text-[#0bb574] border border-[#0ECB81]/30' : 'bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30'
          }`}>
            <div className="text-[9px] uppercase font-bold tracking-wider">
              {activeContract.contractType} Contract Active
            </div>
            <div className="text-xs font-mono font-bold">
              Tick {activeContract.completedTicks}/{activeContract.totalTicks}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-pulse" />
            <span>Live Ticks</span>
          </div>
        )}
      </div>

      {/* SVG Tick Chart */}
      <div className="relative w-full h-[120px] select-none">
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={chartData.areaD} fill="url(#tickGradient)" />

          {/* Grid lines */}
          <line x1="0" y1="20" x2={chartData.width} y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1="0" y1="75" x2={chartData.width} y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />
          <line x1="0" y1="130" x2={chartData.width} y2="130" stroke="#f1f5f9" strokeDasharray="3 3" />

          {/* Active Contract Entry Spot baseline line */}
          {chartData.entryY !== null && (
            <>
              <line
                x1="0"
                y1={chartData.entryY}
                x2={chartData.width}
                y2={chartData.entryY}
                stroke={activeContract?.contractType === 'RISE' ? '#059669' : '#e11d48'}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x="6"
                y={Math.max(12, chartData.entryY - 4)}
                fill={activeContract?.contractType === 'RISE' ? '#059669' : '#e11d48'}
                fontSize="9"
                fontWeight="700"
                fontFamily="monospace"
              >
                Entry Spot: {activeContract?.entrySpot.toFixed(market.decimalPlaces)}
              </text>
            </>
          )}

          {/* Main tick path */}
          <path
            d={chartData.pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Individual Tick points */}
          {chartData.points.slice(-12).map((pt, i) => {
            const isLatest = i === chartData.points.slice(-12).length - 1;
            const dotColor = pt.tick.direction === 'up' ? '#10b981' : pt.tick.direction === 'down' ? '#ef4444' : '#64748b';
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={isLatest ? 4 : 2}
                fill={isLatest ? dotColor : '#ffffff'}
                stroke={dotColor}
                strokeWidth={isLatest ? 2 : 1.5}
                className={isLatest ? 'animate-pulse' : ''}
              />
            );
          })}
        </svg>
      </div>

      {/* Mini footer of tick stream */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>Recent Ticks:</span>
          <div className="flex items-center gap-0.5">
            {ticks.slice(-8).map((t, i) => (
              <span
                key={i}
                className={`w-1.5 h-3.5 rounded-xs inline-block ${
                  t.direction === 'up' ? 'bg-emerald-500' : t.direction === 'down' ? 'bg-rose-500' : 'bg-slate-300'
                }`}
                title={`Spot: ${t.quote.toFixed(market.decimalPlaces)}`}
              />
            ))}
          </div>
        </div>
        <div className="font-mono text-slate-400">
          L: {chartData.yMin.toFixed(market.decimalPlaces)} · H: {chartData.yMax.toFixed(market.decimalPlaces)}
        </div>
      </div>
    </div>
  );
};
