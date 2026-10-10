export interface MarketAsset {
  symbol: string;
  name: string;
  category: 'synthetics' | 'forex';
  decimalPlaces: number;
  basePrice: number;
  volatility: number;
  tickTimeMs: number;
}

export interface Tick {
  epoch: number;
  quote: number;
  direction: 'up' | 'down' | 'flat';
  diff: number;
}

export type AdviceDirection = 'RISE' | 'FALL' | 'WAIT';

export interface AdviceSignal {
  direction: AdviceDirection;
  confidence: number; // 0 - 100
  strength: 'Strong' | 'Moderate' | 'Neutral';
  title: string;
  rationale: string[];
  suggestedDurationTicks: number;
  rsi: number;
  momentumScore: number;
  consecutiveCount: number;
  consecutiveDir: 'up' | 'down' | 'none';
  emaFast: number;
  emaSlow: number;
  macd: number;
  signalLine: number;
  histogram: number;
  timestamp: number;
  hasCrossoverSignal: boolean;
  crossoverEvent: 'BULLISH' | 'BEARISH' | 'NONE';
  crossoverId: string;
  ticksSinceCrossover: number;
}

export type StrategyType = 'MACD';

export interface BotConfig {
  isRunning: boolean;
  mode: 'AUTO' | 'ADVICE_ONLY';
  strategy: StrategyType;
  baseStake: number;
  currentStake: number;
  durationTicks: number;
  takeProfit: number;
  stopLoss: number;
  martingaleFactor: number;
  minConfidence: number;
  maxConsecutiveLosses: number;
  soundEnabled: boolean;
}

export interface ActiveContract {
  id: string;
  marketSymbol: string;
  marketName: string;
  contractType: 'RISE' | 'FALL';
  stake: number;
  payoutRate: number; // e.g. 0.95 (95% return)
  entrySpot: number;
  currentSpot: number;
  startEpoch: number;
  totalTicks: number;
  completedTicks: number;
  tickHistory: { quote: number; isWinning: boolean }[];
  status: 'RUNNING' | 'WON' | 'LOST';
  profit: number;
}

export interface TradeRecord {
  id: string;
  timestamp: number;
  marketSymbol: string;
  marketName: string;
  contractType: 'RISE' | 'FALL';
  entrySpot: number;
  exitSpot: number;
  stake: number;
  payout: number;
  profit: number;
  status: 'WON' | 'LOST';
  durationTicks: number;
  strategy: string;
}

export interface AccountProfile {
  isDemo: boolean;
  balance: number;
  currency: string;
  totalProfit: number;
  todayProfit: number;
  tradesCount: number;
  winsCount: number;
  lossesCount: number;
  derivToken: string;
  derivConnected: boolean;
  pingMs: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'INFO' | 'ANALYSIS' | 'SIGNAL' | 'EXEC' | 'WIN' | 'LOSS' | 'WARN';
  message: string;
  detail?: string;
}
