export type TradeDirection = 'BUY' | 'SELL';

export type TradeResult = 'WIN' | 'LOSS' | 'BE';

export type TradingSession = 'ASIA' | 'LONDON' | 'NEW YORK' | 'LONDON + NEW YORK' | 'OTHER';

export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';

export type MarketCondition = 'TRENDING' | 'RANGING' | 'CHOPPY' | 'HIGH VOLATILITY' | 'LOW VOLATILITY';

export interface CustomColumnDefinition {
  id: string; // e.g. "col_trend"
  name: string; // e.g. "Kondisi Trend"
  type: 'text' | 'select' | 'number';
  options?: string[]; // e.g. ['Uptrend', 'Downtrend', 'Sideways']
  placeholder?: string;
  defaultValue?: string;
}

export interface BacktestProject {
  id: string;
  name: string; // Nama Sesi / Proyek Backtest
  description: string; // Deskripsi strategi & aturan SOP
  defaultPair?: string;
  defaultTimeframe?: Timeframe;
  defaultSession?: TradingSession;
  customColumns: CustomColumnDefinition[]; // Kolom tambahan dinamis
  createdAt: string;
  updatedAt?: string;
}

export interface TradeScreenshot {
  id: string;
  name: string;
  url: string; // Base64 data URL or Google Drive link
  type: 'before' | 'entry' | 'after' | 'other';
  driveId?: string;
}

export interface Trade {
  id: string;
  // Project / Strategy Association
  projectId?: string;
  projectName?: string;
  
  date: string; // YYYY-MM-DD (full date without time requirement)
  time?: string; // HH:mm (optional)
  pair: string;
  direction: TradeDirection;
  timeframe: Timeframe;
  session: TradingSession;
  setup: string;
  marketCondition: MarketCondition;
  
  // Price & Risk
  entry: number;
  stopLoss: number;
  takeProfit: number;
  exit: number;
  riskPercent: number; // e.g. 1.0 (%)
  riskAmount: number; // e.g. 3.0 ($)
  
  // R Metrics
  rrPlanned: number; // Reward / Risk
  rrActual: number; // Exit delta / Risk delta
  result: TradeResult;
  resultR: number; // In R multiples (+2, -1, 0, etc.)
  profitLoss: number; // Dollar amount estimate
  duration?: string; // e.g., "1h 30m"
  
  // Screenshots
  screenshotUrl?: string;
  beforeScreenshotUrl?: string;
  afterScreenshotUrl?: string;
  screenshots: TradeScreenshot[];
  
  // Notes & Quality
  notes?: string; // Keterangan tambahan default (Catatan)
  entryReason: string;
  marketContext: string;
  confirmation: string;
  mistake: string;
  emotion: string;
  lesson: string;
  tags: string[];

  // Dynamic Custom Columns Values (e.g. { "col_trend": "Uptrend", "col_conf": "Pinbar H1" })
  customValues?: Record<string, any>;
  
  // Plan Compliance
  executedToPlan: boolean;
  planViolation: boolean;
  planViolationReason?: string;
  
  // Grouping & Multi-Account
  backtestSessionId?: string; // e.g. "BT-2026-09-21-01"
  accountId: string; // "Personal", "Funded", "Demo", "Backtest"
  
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TradeFilter {
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  pair?: string;
  setup?: string;
  session?: string;
  timeframe?: string;
  direction?: string;
  result?: string;
  marketCondition?: string;
  tag?: string;
  accountId?: string;
  period?: 'today' | 'this_week' | 'this_month' | 'last_7' | 'last_30' | 'last_90' | 'all' | 'custom';
  searchQuery?: string;
  onlyViolations?: boolean;
  onlyCompliant?: boolean;
}

export interface AppSettings {
  currency: string;
  accountSize: number;
  riskPercent: number;
  defaultTimeframe: Timeframe;
  defaultSession: TradingSession;
  defaultPair: string;
  defaultSetup: string;
  gasApiUrl: string;
  activeAccount: string;
  accounts: string[];
  savedSetups: string[];
  savedPairs: string[];
  minPatternSampleSize: number;
}

export interface DailyReview {
  id: string;
  date: string;
  whatWentWell: string;
  whatWentWrong: string;
  mostCommonMistake: string;
  bestExecution: string;
  lessonLearned: string;
  tomorrowFocus: string;
  bestScreenshotUrl?: string;
  createdAt: string;
}

export interface WeeklyReview {
  id: string;
  week: string; // YYYY-Www e.g. "2026-W38"
  startDate: string;
  endDate: string;
  biggestMistake: string;
  mostCommonSetup: string;
  mostCommonError: string;
  keyLesson: string;
  notes: string;
  bestScreenshotUrl?: string;
  createdAt: string;
}

export interface MonthlyReview {
  id: string;
  month: string; // YYYY-MM
  mostUsedSetup: string;
  mostFrequentPair: string;
  mostFrequentSession: string;
  keyLessons: string;
  notes: string;
  createdAt: string;
}

export interface TradeAnalytics {
  totalTrades: number;
  wins: number;
  losses: number;
  breakEvens: number;
  winRate: number; // in %
  lossRate: number; // in %
  breakEvenRate: number; // in %
  totalR: number;
  totalProfitLoss: number;
  averageR: number;
  averageWinR: number;
  averageLossR: number;
  averageWinAmount: number;
  averageLossAmount: number;
  largestWinR: number;
  largestWinAmount: number;
  largestLossR: number;
  largestLossAmount: number;
  profitFactor: number;
  expectancyR: number;
  maxWinningStreak: number;
  maxLosingStreak: number;
  averageWinningStreak: number;
  averageLosingStreak: number;
  currentStreak: { type: 'WIN' | 'LOSS' | 'BE' | 'NONE'; count: number };
  maxDrawdownR: number;
  maxDrawdownPercent: number;
  maxDrawdownAmount: number;
  currentEquityR: number;
  peakEquityR: number;
  planComplianceRate: number;
  planViolationsCount: number;
  planCompliantTotalR: number;
  planViolationTotalR: number;
  planCompliantWinRate: number;
  planViolationWinRate: number;
  disciplinedStats: { trades: number; wins: number; losses: number; winRate: number; totalR: number; profitFactor: number; averageR: number };
  violatedStats: { trades: number; wins: number; losses: number; winRate: number; totalR: number; profitFactor: number; averageR: number };
  directionBreakdown: Record<string, { trades: number; wins: number; losses: number; winRate: number; totalR: number; profitFactor: number }>;
  setupBreakdown: Record<string, any>;
  pairBreakdown: Record<string, any>;
  sessionBreakdown: Record<string, any>;
  timeframeBreakdown: Record<string, any>;
  conditionBreakdown: Record<string, any>;
  dayOfWeekBreakdown: Record<string, any>;
  bySetup: Array<{
    setup: string;
    trades: number;
    wins: number;
    losses: number;
    be: number;
    winRate: number;
    totalR: number;
    avgR: number;
    profitFactor: number;
  }>;
  byPair: Array<{
    pair: string;
    trades: number;
    wins: number;
    losses: number;
    be: number;
    winRate: number;
    totalR: number;
    avgR: number;
    profitFactor: number;
  }>;
  bySession: Array<{
    session: string;
    trades: number;
    wins: number;
    losses: number;
    be: number;
    winRate: number;
    totalR: number;
    avgR: number;
  }>;
  byTimeframe: Array<{
    timeframe: string;
    trades: number;
    wins: number;
    losses: number;
    be: number;
    winRate: number;
    totalR: number;
    avgR: number;
  }>;
  byDayOfWeek: Array<{
    day: string;
    trades: number;
    winRate: number;
    totalR: number;
  }>;
  byHour: Array<{
    hour: string;
    trades: number;
    winRate: number;
    totalR: number;
  }>;
  byMarketCondition: Array<{
    condition: string;
    trades: number;
    winRate: number;
    totalR: number;
  }>;
  byMistake: Array<{
    mistake: string;
    count: number;
    totalLostR: number;
  }>;
  byEmotion: Array<{
    emotion: string;
    count: number;
    winRate: number;
    totalR: number;
  }>;
  equityCurve: Array<{
    tradeNumber: number;
    date: string;
    pair: string;
    resultR: number;
    cumulativeR: number;
    equityAmount: number;
  }>;
  drawdownSeries: Array<{
    tradeNumber: number;
    date: string;
    drawdownR: number;
    drawdownPercent: number;
  }>;
  monthlyStats: Array<{
    period: string;
    trades: number;
    winRate: number;
    totalR: number;
    profitLoss: number;
  }>;
  descriptiveInsights: string[];
  equityData: Array<{
    index: number;
    date: string;
    pair: string;
    resultR: number;
    cumulativeR: number;
    peakR: number;
    drawdownR: number;
  }>;
  drawdownData: Array<{
    index: number;
    date: string;
    pair: string;
    drawdownR: number;
    cumulativeR: number;
  }>;
  dailyStats: Array<{
    periodKey: string;
    label: string;
    trades: number;
    wins: number;
    losses: number;
    be: number;
    winRate: number;
    totalR: number;
    averageR: number;
    profitFactor: number | null;
  }>;
  weeklyStats: Array<{
    periodKey: string;
    label: string;
    trades: number;
    wins: number;
    losses: number;
    be: number;
    winRate: number;
    totalR: number;
    averageR: number;
    profitFactor: number | null;
  }>;
}
