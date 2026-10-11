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
  LogEntry
} from './types.ts';
import { DERIV_MARKETS } from './data/markets.ts';
import { analyzeAdvice } from './utils/adviceEngine.ts';
import { sound } from './utils/sound.ts';
import { MobileFrame } from './components/MobileFrame.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { BotCockpit } from './components/BotCockpit.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { GoalModal } from './components/GoalModal.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { LoginRegisterView } from './components/LoginRegisterView.tsx';
import { SupportView } from './components/SupportView.tsx';

interface StoredUserData {
  account: AccountProfile;
  trades: TradeRecord[];
  password: string;
}

const STORAGE_USERS_KEY = 'gsquad_multi_users_v1';
const STORAGE_CURRENT_EMAIL_KEY = 'gsquad_current_email_v1';

export default function App() {
  // Multi-user storage initialization
  const [allUsers, setAllUsers] = useState<Record<string, StoredUserData>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    // Default initial demo user
    const defaultEmail = 'alex.morgan@gsquad.trade';
    const initialUsers: Record<string, StoredUserData> = {
      [defaultEmail]: {
        password: 'password123',
        account: {
          name: 'Alex Morgan',
          email: defaultEmail,
          joinDate: '2026-01-15',
          subscriptionActive: false,
          subscriptionDate: '',
          isDemo: true,
          balance: 10000.00,
          currency: 'USD',
          totalProfit: 0,
          todayProfit: 0,
          tradesCount: 2,
          winsCount: 2,
          lossesCount: 0,
          derivToken: '',
          derivConnected: false,
          pingMs: 28,
        },
        trades: [
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
        ],
      },
    };
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  });

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    try {
      const savedEmail = localStorage.getItem(STORAGE_CURRENT_EMAIL_KEY);
      if (savedEmail && allUsers[savedEmail]) {
        return savedEmail;
      }
    } catch (e) {
      console.error(e);
    }
    return null; // Prompt login if no current user logged in
  });

  // Fixed to Volatility 75 Index (R_75) as requested
  const [currentMarket, setCurrentMarket] = useState<MarketAsset>(DERIV_MARKETS[1]);
  const [activeTab, setActiveTab] = useState<NavTab>('bot');
  const [showSplash, setShowSplash] = useState(true);
  const [goalPopup, setGoalPopup] = useState<{
    show: boolean;
    isProfit: boolean;
    amount: number;
    target: number;
  } | null>(null);

  // Active User Account Profile & Trades derived from currentUserEmail
  const currentUserData = currentUserEmail ? allUsers[currentUserEmail] : null;

  const [account, setAccount] = useState<AccountProfile>(() => {
    if (currentUserData) return currentUserData.account;
    return {
      name: 'Guest',
      email: '',
      joinDate: new Date().toISOString().split('T')[0],
      subscriptionActive: false,
      subscriptionDate: '',
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
    };
  });

  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    if (currentUserData) return currentUserData.trades;
    return [];
  });

  // Sync account & trades when currentUserEmail changes
  useEffect(() => {
    if (currentUserEmail && allUsers[currentUserEmail]) {
      setAccount(allUsers[currentUserEmail].account);
      setTrades(allUsers[currentUserEmail].trades);
      localStorage.setItem(STORAGE_CURRENT_EMAIL_KEY, currentUserEmail);
    } else {
      localStorage.removeItem(STORAGE_CURRENT_EMAIL_KEY);
    }
  }, [currentUserEmail]);

  // Save users to localStorage whenever account or trades update
  useEffect(() => {
    if (!currentUserEmail) return;
    setAllUsers((prev) => {
      const updated = {
        ...prev,
        [currentUserEmail]: {
          ...(prev[currentUserEmail] || { password: 'password123' }),
          account,
          trades,
        },
      };
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [account, trades, currentUserEmail]);

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
    minConfidence: 90,
    maxConsecutiveLosses: 3,
    soundEnabled: true,
  });

  // Active Contract in flight
  const [activeContract, setActiveContract] = useState<ActiveContract | null>(null);
  const lastExecutedCrossoverIdRef = useRef<string>('');
  const lastContractFinishedRef = useRef<number>(0);

  // Real-time Console Logs
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

  // Market Ticks Stream
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

  // Authentication handlers
  const handleRegisterUser = (email: string, name: string, pass: string): boolean => {
    if (allUsers[email]) {
      return false; // Already exists
    }
    const newUserRecord: StoredUserData = {
      password: pass,
      account: {
        name,
        email,
        joinDate: new Date().toISOString().split('T')[0],
        subscriptionActive: false,
        subscriptionDate: '',
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
        pingMs: 25,
      },
      trades: [],
    };
    const updated = { ...allUsers, [email]: newUserRecord };
    setAllUsers(updated);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
    return true;
  };

  const handleAuthenticate = (email: string, pass: string): boolean => {
    const user = allUsers[email];
    if (user && user.password === pass) {
      return true;
    }
    return false;
  };

  const handleLoginSuccess = (email: string) => {
    setCurrentUserEmail(email);
    setShowSplash(true);
    addLog('INFO', `Logged in as ${email}`);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    setBotConfig((prev) => ({ ...prev, isRunning: false }));
    addLog('INFO', 'User signed out securely');
  };

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

      addLog('EXEC', `Opened ${type} contract · Stake $${stake.toFixed(2)} (${botConfig.durationTicks}t)`);

      sound.playTradeTrigger(type);
      setActiveContract(newContract);
    },
    [activeContract, ticks, botConfig.currentStake, botConfig.durationTicks, account.balance, currentMarket, addLog]
  );

  // Ticks Stream Interval & Contract Engine
  useEffect(() => {
    const interval = setInterval(() => {
      setAccount((prev) => ({
        ...prev,
        pingMs: 24 + Math.floor(Math.random() * 12),
      }));

      setTicks((prevTicks) => {
        if (prevTicks.length === 0) return prevTicks;
        const lastTick = prevTicks[prevTicks.length - 1];

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
            const won = isWinCurrent;
            const payout = won ? curr.stake * (1 + curr.payoutRate) : 0;
            const profit = won ? curr.stake * curr.payoutRate : -curr.stake;

            if (won) {
              sound.playWin();
              addLog('WIN', `WON +$${profit.toFixed(2)} USD · Exit ${nextPrice.toFixed(currentMarket.decimalPlaces)}`);
            } else {
              sound.playLoss();
              addLog('LOSS', `LOST -$${curr.stake.toFixed(2)} USD · Exit ${nextPrice.toFixed(currentMarket.decimalPlaces)}`);
            }

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

            setBotConfig((b) => {
              let nextStake = b.baseStake;
              if (!won && b.martingaleFactor > 1) {
                nextStake = Number((curr.stake * b.martingaleFactor).toFixed(2));
                addLog('WARN', `Martingale step: Stake $${nextStake.toFixed(2)} USD`);
              }

              const currentTotalProfit = account.todayProfit + profit;
              if (currentTotalProfit >= b.takeProfit) {
                addLog('WARN', `Take profit target reached ($${currentTotalProfit.toFixed(2)}) · Bot paused`);
                setGoalPopup({
                  show: true,
                  isProfit: true,
                  amount: currentTotalProfit,
                  target: b.takeProfit,
                });
                return {
                  ...b,
                  isRunning: false,
                  currentStake: b.baseStake,
                };
              }
              if (currentTotalProfit <= -b.stopLoss) {
                addLog('WARN', `Stop loss limit reached ($${currentTotalProfit.toFixed(2)}) · Bot paused`);
                setGoalPopup({
                  show: true,
                  isProfit: false,
                  amount: currentTotalProfit,
                  target: b.stopLoss,
                });
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
            return null;
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

  // Automated Bot Trigger
  useEffect(() => {
    if (!botConfig.isRunning) return;

    if (!signal.hasCrossoverSignal || signal.direction === 'WAIT' || !signal.crossoverId) {
      return;
    }

    if (signal.crossoverId === lastExecutedCrossoverIdRef.current) {
      return;
    }

    if (activeContract) {
      lastExecutedCrossoverIdRef.current = signal.crossoverId;
      return;
    }

    const timeSinceLast = Date.now() - lastContractFinishedRef.current;
    if (timeSinceLast < 800) return;

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

  // Market scanning logs when bot is running
  useEffect(() => {
    if (!botConfig.isRunning) return;

    const messages = [
      'Market scanning · Analyzing price structure...',
      'Scanning market stream · Calculating MACD momentum...',
      'Evaluating exponential moving average crossover structure...',
      'Market scanning · Checking signal confidence...',
      'Analyzing tick velocity and trend structure...',
      'Scanning market volatility and momentum patterns...',
    ];

    const scanInterval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      addLog('SIGNAL', randomMsg);
    }, 650);

    return () => clearInterval(scanInterval);
  }, [botConfig.isRunning, addLog]);

  const handleResetSession = () => {
    setAccount((prev) => ({
      ...prev,
      todayProfit: 0,
    }));
    setBotConfig((prev) => ({
      ...prev,
      currentStake: prev.baseStake,
    }));
    addLog('INFO', 'Session P&L reset to $0.00');
  };

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

  // If user is not logged in, render LoginRegisterView
  if (!currentUserEmail) {
    return (
      <LoginRegisterView
        onLoginSuccess={handleLoginSuccess}
        getAllUsers={() => allUsers}
        onRegisterUser={handleRegisterUser}
        onAuthenticate={handleAuthenticate}
      />
    );
  }

  return (
    <>
      {showSplash && (
        <SplashScreen onDismiss={() => setShowSplash(false)} />
      )}
      <MobileFrame>
        {/* Mobile Top App Header */}
        <Header
          account={account}
          onToggleAccountMode={(isDemo) =>
            setAccount((prev) => ({
              ...prev,
              isDemo,
              balance: isDemo ? 10000.00 : 1248.50,
            }))
          }
        />

        {/* Screen Content */}
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

          {activeTab === 'profile' && (
            <ProfileView
              account={account}
              trades={trades}
              onResetBalance={handleResetBalance}
              onUpdateAccount={(updates) => setAccount((prev) => ({ ...prev, ...updates }))}
              onLogout={handleLogout}
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

          {activeTab === 'support' && (
            <SupportView onBack={() => setActiveTab('bot')} />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          botRunning={botConfig.isRunning}
        />

        {/* Goal / Stop Loss Reached Popup Modal */}
        {goalPopup?.show && (
          <GoalModal
            isProfit={goalPopup.isProfit}
            amount={goalPopup.amount}
            targetAmount={goalPopup.target}
            onClose={() => setGoalPopup(null)}
            onResetSession={handleResetSession}
          />
        )}
      </MobileFrame>
    </>
  );
}
