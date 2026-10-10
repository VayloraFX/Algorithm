/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MarketAsset, 
  Tick, 
  AdviceSignal, 
  BotConfig, 
  ActiveContract, 
  TradeRecord, 
  AccountProfile,
  StrategyType,
  LogEntry
} from './types.ts';
import { DERIV_MARKETS } from './data/markets.ts';
import { analyzeAdvice } from './utils/adviceEngine.ts';
import { sound } from './utils/sound.ts';
import { MobileFrame } from './components/MobileFrame.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { BotCockpit } from './components/BotCockpit.tsx';
import { TradesView } from './components/TradesView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

export default function App() {
  const [currentMarket, setCurrentMarket] = useState<MarketAsset>(DERIV_MARKETS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('bot');

  // Account State
  const [account, setAccount] = useState<AccountProfile>({
    isDemo: true,
    balance: 10000.00,
    currency: 'USD',
    totalProfit: 0,
    todayProfit: 0,
    tradesCount: 0,
    winsCount: 0,
    lossesCount: 0,
    derivToken: '',
    derivConnected: false,
    pingMs: 28,
  });

  // Bot Configuration
  const [botConfig, setBotConfig] = useState<BotConfig>({
    isRunning: false,
    mode: 'AUTO',
    strategy: 'MACD',
    baseStake: 2.00,
    currentStake: 2.00,
    durationTicks: 5,
    takeProfit: 50.00,
    stopLoss: 25.00,
    martingaleFactor: 2.0,
    minConfidence: 75,
    maxConsecutiveLosses: 3,
    soundEnabled: true,
  });

  // Active Contract in flight
  const [activeContract, setActiveContract] = useState<ActiveContract | null>(null);
  const lastExecutedCrossoverIdRef = useRef<string>('');
  const lastContractFinishedRef = useRef<number>(0);

  // Trades journal
  const [trades, setTrades] = useState<TradeRecord[]>([
    {
      id: 'trade-demo-1',
      timestamp: Date.now() - 360000,
      marketSymbol: '1HZ75V',
      marketName: 'Volatility 75 (1s) Index',
      contractType: 'RISE',
      entrySpot: 94810.20,
      exitSpot: 94819.50,
      stake: 2.00,
      payout: 3.90,
      profit: 1.90,
      status: 'WON',
      durationTicks: 5,
      strategy: 'Auto Engine',
    },
    {
      id: 'trade-demo-2',
      timestamp: Date.now() - 180000,
      marketSymbol: '1HZ75V',
      marketName: 'Volatility 75 (1s) Index',
      contractType: 'FALL',
      entrySpot: 94830.40,
      exitSpot: 94821.10,
      stake: 2.00,
      payout: 3.90,
      profit: 1.90,
      status: 'WON',
      durationTicks: 5,
      strategy: 'Auto Engine',
    },
  ]);

  // Real-time Console Logs (Clean, concise values - No strategy names revealed)
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: Date.now() - 2000,
      type: 'INFO',
      message: 'Deriv Auto Pilot ready · Volatility 75 (1s)',
    },
    {
      id: 'log-init-2',
      timestamp: Date.now() - 500,
      type: 'SIGNAL',
      message: 'Engine calibrated · Min confidence 75%',
    },
  ]);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs((prev) => {
      const entry: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        type,
        message,
      };
      return [entry, ...prev.slice(0, 49)];
    });
  }, []);

  // Market Ticks Stream (50 ticks history for accurate 12/26 EMA stabilization)
  const [ticks, setTicks] = useState<Tick[]>(() => {
    const initial: Tick[] = [];
    let p = DERIV_MARKETS[0].basePrice;
    const now = Date.now();
    for (let i = 50; i >= 0; i--) {
      const delta = (Math.random() - 0.49) * DERIV_MARKETS[0].volatility * 0.4;
      p += delta;
      initial.push({
        epoch: now - i * 1000,
        quote: Number(p.toFixed(DERIV_MARKETS[0].decimalPlaces)),
        direction: delta >= 0 ? 'up' : 'down',
        diff: Number(delta.toFixed(DERIV_MARKETS[0].decimalPlaces)),
      });
    }
    return initial;
  });

  // Real-time Advice Signal
  const [signal, setSignal] = useState<AdviceSignal>(() =>
    analyzeAdvice(ticks, botConfig.strategy)
  );

  // Reset ticks when market changes
  const handleSelectMarket = (market: MarketAsset) => {
    setCurrentMarket(market);
    lastExecutedCrossoverIdRef.current = '';
    let p = market.basePrice;
    const now = Date.now();
    const newTicks: Tick[] = [];
    for (let i = 50; i >= 0; i--) {
      const delta = (Math.random() - 0.49) * market.volatility * 0.4;
      p += delta;
      newTicks.push({
        epoch: now - i * 1000,
        quote: Number(p.toFixed(market.decimalPlaces)),
        direction: delta >= 0 ? 'up' : 'down',
        diff: Number(delta.toFixed(market.decimalPlaces)),
      });
    }
    setTicks(newTicks);
    setSignal(analyzeAdvice(newTicks, botConfig.strategy));
    addLog('INFO', `Switched to ${market.symbol} (${market.name})`);
  };

  // Execute a Deriv Rise or Fall contract
  const executeTrade = useCallback(
    (type: 'RISE' | 'FALL') => {
      if (activeContract || ticks.length === 0) return;

      const currentPrice = ticks[ticks.length - 1].quote;
      const stake = botConfig.currentStake;

      // Check balance
      if (account.balance < stake) {
        addLog('WARN', `Low balance ($${account.balance.toFixed(2)}) · Pausing`);
        setBotConfig((prev) => ({ ...prev, isRunning: false }));
        return;
      }

      // Deduct stake from balance
      setAccount((prev) => ({
        ...prev,
        balance: prev.balance - stake,
      }));

      const newContract: ActiveContract = {
        id: `contract-${Date.now()}`,
        marketSymbol: currentMarket.symbol,
        marketName: currentMarket.name,
        contractType: type,
        stake: stake,
        payoutRate: 0.95,
        entrySpot: currentPrice,
        currentSpot: currentPrice,
        startEpoch: Date.now(),
        totalTicks: botConfig.durationTicks,
        completedTicks: 0,
        tickHistory: [{ quote: currentPrice, isWinning: false }],
        status: 'RUNNING',
        profit: 0,
      };

      addLog('EXEC', `Opened ${type} @ ${currentPrice.toFixed(currentMarket.decimalPlaces)} · $${stake.toFixed(2)} (${botConfig.durationTicks}t)`);

      sound.playTradeTrigger(type);
      setActiveContract(newContract);
    },
    [activeContract, ticks, botConfig.currentStake, botConfig.durationTicks, account.balance, currentMarket, addLog]
  );

  // Ticks Stream Interval & Contract Engine
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate ping slightly
      setAccount((prev) => ({
        ...prev,
        pingMs: 24 + Math.floor(Math.random() * 12),
      }));

      setTicks((prevTicks) => {
        if (prevTicks.length === 0) return prevTicks;
        const lastTick = prevTicks[prevTicks.length - 1];

        // Brownian motion with mean reversion tendency
        const drift = (Math.random() - 0.495) * currentMarket.volatility * 0.35;
        const nextPrice = Number((lastTick.quote + drift).toFixed(currentMarket.decimalPlaces));
        const diff = Number((nextPrice - lastTick.quote).toFixed(currentMarket.decimalPlaces));
        const dir = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';

        const newTick: Tick = {
          epoch: Date.now(),
          quote: nextPrice,
          direction: dir,
          diff: diff,
        };

        const updated = [...prevTicks.slice(-80), newTick];
        const newSig = analyzeAdvice(updated, botConfig.strategy);
        setSignal(newSig);

        // Check active contract tick progression
        setActiveContract((curr) => {
          if (!curr || curr.status !== 'RUNNING') return curr;

          const completed = curr.completedTicks + 1;
          const isWinCurrent =
            curr.contractType === 'RISE'
              ? nextPrice > curr.entrySpot
              : nextPrice < curr.entrySpot;

          const updatedHistory = [
            ...curr.tickHistory,
            { quote: nextPrice, isWinning: isWinCurrent },
          ];

          if (completed >= curr.totalTicks) {
            // Contract Completed!
            const won = isWinCurrent;
            const payout = won ? curr.stake * (1 + curr.payoutRate) : 0;
            const profit = won ? curr.stake * curr.payoutRate : -curr.stake;

            // Trigger sound & log outcome
            if (won) {
              sound.playWin();
              addLog('WIN', `WON +$${profit.toFixed(2)} USD · Exit ${nextPrice.toFixed(currentMarket.decimalPlaces)}`);
            } else {
              sound.playLoss();
              addLog('LOSS', `LOST -$${curr.stake.toFixed(2)} USD · Exit ${nextPrice.toFixed(currentMarket.decimalPlaces)}`);
            }

            // Update Account & Martingale
            setAccount((acc) => {
              const newBal = acc.balance + payout;
              const newToday = acc.todayProfit + profit;
              return {
                ...acc,
                balance: newBal,
                todayProfit: newToday,
                totalProfit: acc.totalProfit + profit,
                tradesCount: acc.tradesCount + 1,
                winsCount: acc.winsCount + (won ? 1 : 0),
                lossesCount: acc.lossesCount + (won ? 0 : 1),
              };
            });

            // Log trade
            const record: TradeRecord = {
              id: curr.id,
              timestamp: Date.now(),
              marketSymbol: curr.marketSymbol,
              marketName: curr.marketName,
              contractType: curr.contractType,
              entrySpot: curr.entrySpot,
              exitSpot: nextPrice,
              stake: curr.stake,
              payout: payout,
              profit: profit,
              status: won ? 'WON' : 'LOST',
              durationTicks: curr.totalTicks,
              strategy: 'Auto Engine',
            };
            setTrades((prevTrades) => [record, ...prevTrades]);

            // Adjust Martingale stake
            setBotConfig((b) => {
              let nextStake = b.baseStake;
              if (!won && b.martingaleFactor > 1) {
                nextStake = Number((curr.stake * b.martingaleFactor).toFixed(2));
                addLog('WARN', `Martingale step: Stake $${nextStake.toFixed(2)} USD`);
              }

              // Check Risk bounds
              const currentTotalProfit = account.todayProfit + profit;
              if (currentTotalProfit >= b.takeProfit || currentTotalProfit <= -b.stopLoss) {
                addLog('WARN', `Target limit reached ($${currentTotalProfit.toFixed(2)}) · Bot paused`);
                return {
                  ...b,
                  isRunning: false,
                  currentStake: b.baseStake,
                };
              }

              return {
                ...b,
                currentStake: nextStake,
              };
            });

            lastContractFinishedRef.current = Date.now();
            return null; // Contract ended
          }

          return {
            ...curr,
            completedTicks: completed,
            currentSpot: nextPrice,
            tickHistory: updatedHistory,
          };
        });

        return updated;
      });
    }, currentMarket.tickTimeMs);

    return () => clearInterval(interval);
  }, [currentMarket, botConfig.strategy, botConfig.takeProfit, botConfig.stopLoss, account.todayProfit]);

  // Automated Bot Trigger: strictly executes ONE order per fresh crossover signal. If no signal, no trade.
  useEffect(() => {
    if (!botConfig.isRunning) return;

    // Strict Rule: If no signal or direction is WAIT, NO TRADE!
    if (!signal.hasCrossoverSignal || signal.direction === 'WAIT' || !signal.crossoverId) {
      return;
    }

    // Strict Rule: Exactly ONE order per crossover signal!
    if (signal.crossoverId === lastExecutedCrossoverIdRef.current) {
      return;
    }

    // If an active contract is already running, register this crossover as handled to avoid delayed duplicate execution
    if (activeContract) {
      lastExecutedCrossoverIdRef.current = signal.crossoverId;
      return;
    }

    // Cooldown check after previous contract finished
    const timeSinceLast = Date.now() - lastContractFinishedRef.current;
    if (timeSinceLast < 800) return;

    // Check confidence threshold
    if (signal.confidence >= botConfig.minConfidence) {
      lastExecutedCrossoverIdRef.current = signal.crossoverId;
      addLog('SIGNAL', `Signal triggered: ${signal.direction} [${signal.confidence}%] · 1 order per crossover`);
      executeTrade(signal.direction as 'RISE' | 'FALL');
    }
  }, [
    botConfig.isRunning,
    activeContract,
    signal.hasCrossoverSignal,
    signal.crossoverId,
    signal.direction,
    signal.confidence,
    botConfig.minConfidence,
    executeTrade,
    addLog,
  ]);

  // Demo balance reset
  const handleResetBalance = () => {
    setAccount((prev) => ({
      ...prev,
      balance: prev.isDemo ? 10000.00 : 1500.00,
      todayProfit: 0,
      totalProfit: 0,
      tradesCount: 0,
      winsCount: 0,
      lossesCount: 0,
    }));
    setBotConfig((prev) => ({
      ...prev,
      currentStake: prev.baseStake,
    }));
  };

  const currentPrice = ticks.length > 0 ? ticks[ticks.length - 1].quote : currentMarket.basePrice;
  const lastDiff = ticks.length > 0 ? ticks[ticks.length - 1].diff : 0;

  return (
    <MobileFrame>
      {/* Mobile Top App Header (Firmly sticky pinned at top) */}
      <Header
        currentMarket={currentMarket}
        onSelectMarket={handleSelectMarket}
        account={account}
        onToggleAccountMode={(isDemo) =>
          setAccount((prev) => ({
            ...prev,
            isDemo,
            balance: isDemo ? 10000.00 : 1248.50,
          }))
        }
        currentPrice={currentPrice}
        lastDiff={lastDiff}
      />

      {/* Screen Content based on active bottom tab (Exclusively scrollable middle viewport) */}
      <main className="flex-1 overflow-y-auto overscroll-contain relative bg-[#f6f1e8] min-h-0 w-full">
        {activeTab === 'bot' && (
          <BotCockpit
            currentMarket={currentMarket}
            ticks={ticks}
            signal={signal}
            botConfig={botConfig}
            onUpdateBotConfig={(updates) => {
              if (updates.isRunning !== undefined) {
                addLog(
                  updates.isRunning ? 'INFO' : 'WARN',
                  updates.isRunning
                    ? `Auto Pilot started · 1 order per crossover`
                    : 'Auto Pilot paused · Standby'
                );
              }
              setBotConfig((prev) => ({ ...prev, ...updates }));
            }}
            activeContract={activeContract}
            account={account}
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        )}

        {activeTab === 'trades' && (
          <TradesView
            trades={trades}
            account={account}
            onClearHistory={() => setTrades([])}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            botConfig={botConfig}
            onUpdateBotConfig={(updates) => setBotConfig((prev) => ({ ...prev, ...updates }))}
            account={account}
            onUpdateAccount={(updates) => setAccount((prev) => ({ ...prev, ...updates }))}
            onResetBalance={handleResetBalance}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Firmly sticky pinned at bottom) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        botRunning={botConfig.isRunning}
      />
    </MobileFrame>
  );
}
