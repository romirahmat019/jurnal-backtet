import { Trade, AppSettings, DailyReview, WeeklyReview, MonthlyReview, BacktestProject } from '../types/trade';
import { SAMPLE_DEMO_TRADES } from '../data/sampleTrades';

const STORAGE_KEYS = {
  TRADES: 'fbj_trades_v1',
  PROJECTS: 'fbj_projects_v1',
  ACTIVE_PROJECT_ID: 'fbj_active_project_id_v1',
  SETTINGS: 'fbj_settings_v1',
  DAILY_REVIEWS: 'fbj_daily_reviews_v1',
  WEEKLY_REVIEWS: 'fbj_weekly_reviews_v1',
  MONTHLY_REVIEWS: 'fbj_monthly_reviews_v1',
  DEMO_LOADED: 'fbj_demo_loaded_v1',
};

export const DEFAULT_PROJECTS: BacktestProject[] = [
  {
    id: 'proj_ema_pullback',
    name: 'Scalping Gold M15 EMA Pullback',
    description: 'Strategi trend following pullback moving average EMA 9 & 21 pada XAUUSD. Konfirmasi rejection di dynamic S&R sebelum entri.',
    defaultPair: 'XAUUSD',
    defaultTimeframe: 'M15',
    defaultSession: 'LONDON',
    customColumns: [
      {
        id: 'col_trend',
        name: 'Kondisi Trend',
        type: 'select',
        options: ['Uptrend Kuat', 'Downtrend Kuat', 'Sideways / Konsolidasi'],
      },
      {
        id: 'col_rejection',
        name: 'Pola Rejection Candle',
        type: 'select',
        options: ['Pinbar / Hammer', 'Bullish/Bearish Engulfing', 'Doji Retest', 'Breakout Momentum'],
      },
      {
        id: 'col_htf_bias',
        name: 'HTF Bias (H1/H4)',
        type: 'select',
        options: ['Bullish', 'Bearish', 'Netral / Ranging'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj_smc_sweep',
    name: 'EURUSD SMC Asian Sweep & CHoCH',
    description: 'Backtest likuiditas Asia High/Low yang disapu saat London Open. Entry sesudah terjadi Change of Character (CHoCH) di M5 dengan target 1:3 RR.',
    defaultPair: 'EURUSD',
    defaultTimeframe: 'M5',
    defaultSession: 'LONDON',
    customColumns: [
      {
        id: 'col_sweep_type',
        name: 'Tipe Sweep Likuiditas',
        type: 'select',
        options: ['Asia Session High', 'Asia Session Low', 'Previous Day High (PDH)', 'Previous Day Low (PDL)'],
      },
      {
        id: 'col_choch',
        name: 'Konfirmasi CHoCH M5',
        type: 'select',
        options: ['Valid Body Close', 'Wick Sweep Saja', 'Aggressive Market Shift'],
      },
      {
        id: 'col_fvg',
        name: 'Fair Value Gap (FVG)',
        type: 'select',
        options: ['FVG Bersih / Diskon', 'FVG Terisi Sebagian', 'Tanpa FVG (Direct Mitigate)'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: '$',
  accountSize: 300,
  riskPercent: 1.0,
  defaultTimeframe: 'M15',
  defaultSession: 'LONDON',
  defaultPair: 'XAUUSD',
  defaultSetup: 'EMA 9/21 Pullback',
  gasApiUrl: '',
  activeAccount: 'Backtest Account',
  accounts: ['Backtest Account', 'Personal Account', 'Funded Account', 'Demo Account'],
  savedSetups: [
    'EMA 9/21 Pullback',
    'Breakout',
    'Structure Break',
    'Liquidity Sweep',
    'Support Resistance',
    'Trend Continuation',
    'Reversal',
  ],
  savedPairs: [
    'XAUUSD',
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'AUDUSD',
    'USDCAD',
    'USDCHF',
    'NZDUSD',
    'GBPJPY',
    'EURJPY',
    'BTCUSD',
  ],
  minPatternSampleSize: 10,
};

export class StorageService {
  static getTrades(): Trade[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRADES);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load trades from storage', e);
      return [];
    }
  }

  static saveTrades(trades: Trade[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
    } catch (e) {
      console.error('Failed to save trades to storage', e);
    }
  }

  static addTrade(trade: Trade): Trade[] {
    const trades = this.getTrades();
    const updated = [trade, ...trades];
    this.saveTrades(updated);
    return updated;
  }

  static updateTrade(trade: Trade): Trade[] {
    const trades = this.getTrades();
    const index = trades.findIndex(t => t.id === trade.id);
    if (index !== -1) {
      trades[index] = { ...trade, updatedAt: new Date().toISOString() };
      this.saveTrades(trades);
    }
    return trades;
  }

  static saveTrade(trade: Trade): Trade[] {
    const trades = this.getTrades();
    const index = trades.findIndex(t => t.id === trade.id);
    if (index !== -1) {
      return this.updateTrade(trade);
    } else {
      return this.addTrade(trade);
    }
  }

  static isDemoActive(): boolean {
    return this.isDemoLoaded();
  }

  static loadDemoData(): Trade[] {
    const existingTrades = this.getTrades();
    // Prepend demo trades avoiding duplicate IDs
    const existingIds = new Set(existingTrades.map(t => t.id));
    const toAdd = SAMPLE_DEMO_TRADES.filter(t => !existingIds.has(t.id));
    const combined = [...toAdd, ...existingTrades];
    this.saveTrades(combined);
    this.setDemoLoaded(true);
    return combined;
  }

  static clearDemoData(): Trade[] {
    const trades = this.getTrades();
    const nonDemo = trades.filter(t => !t.isDemo);
    this.saveTrades(nonDemo);
    this.setDemoLoaded(false);
    return nonDemo;
  }

  static deleteTrade(id: string): Trade[] {
    const trades = this.getTrades().filter(t => t.id !== id);
    this.saveTrades(trades);
    return trades;
  }

  static clearAllTrades(): void {
    localStorage.removeItem(STORAGE_KEYS.TRADES);
    localStorage.removeItem(STORAGE_KEYS.DEMO_LOADED);
  }

  static isDemoLoaded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.DEMO_LOADED) === 'true';
  }

  static setDemoLoaded(loaded: boolean): void {
    if (loaded) {
      localStorage.setItem(STORAGE_KEYS.DEMO_LOADED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.DEMO_LOADED);
    }
  }

  static getSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  // Reviews storage
  static getDailyReviews(): DailyReview[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_REVIEWS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveDailyReview(review: DailyReview): DailyReview[] {
    const list = this.getDailyReviews();
    const idx = list.findIndex(r => r.date === review.date);
    if (idx >= 0) list[idx] = review;
    else list.unshift(review);
    localStorage.setItem(STORAGE_KEYS.DAILY_REVIEWS, JSON.stringify(list));
    return list;
  }

  static getWeeklyReviews(): WeeklyReview[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_REVIEWS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveWeeklyReview(review: WeeklyReview): WeeklyReview[] {
    const list = this.getWeeklyReviews();
    const idx = list.findIndex(r => r.week === review.week);
    if (idx >= 0) list[idx] = review;
    else list.unshift(review);
    localStorage.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, JSON.stringify(list));
    return list;
  }

  static getMonthlyReviews(): MonthlyReview[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_REVIEWS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveMonthlyReview(review: MonthlyReview): MonthlyReview[] {
    const list = this.getMonthlyReviews();
    const idx = list.findIndex(r => r.month === review.month);
    if (idx >= 0) list[idx] = review;
    else list.unshift(review);
    localStorage.setItem(STORAGE_KEYS.MONTHLY_REVIEWS, JSON.stringify(list));
    return list;
  }

  // Backtest Projects & Custom Strategies
  static getProjects(): BacktestProject[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!raw) {
        // Initialize with default projects
        this.saveProjects(DEFAULT_PROJECTS);
        return DEFAULT_PROJECTS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
    } catch (e) {
      console.error('Failed to load projects from storage', e);
      return DEFAULT_PROJECTS;
    }
  }

  static saveProjects(projects: BacktestProject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to storage', e);
    }
  }

  static saveProject(project: BacktestProject): BacktestProject[] {
    const projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.unshift(project);
    }
    this.saveProjects(projects);
    return projects;
  }

  static deleteProject(projectId: string): BacktestProject[] {
    const projects = this.getProjects().filter(p => p.id !== projectId);
    this.saveProjects(projects);
    return projects;
  }

  static getActiveProjectId(): string {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
      if (id) return id;
      const projects = this.getProjects();
      return projects.length > 0 ? projects[0].id : '';
    } catch {
      return '';
    }
  }

  static setActiveProjectId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    } catch (e) {
      console.error('Failed to set active project id', e);
    }
  }
}
