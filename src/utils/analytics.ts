import { Trade, TradeAnalytics } from '../types/trade';

export interface PerformanceSummary {
  totalTrades: number;
  wins: number;
  losses: number;
  be: number;
  winRate: number; // percentage, e.g. 58.3
  lossRate: number; // percentage
  beRate: number;
  totalR: number; // sum of resultR
  averageR: number;
  averageWinR: number;
  averageLossR: number;
  profitFactor: number | null; // null if no losses, displays as 'N/A'
  expectancy: number; // in R
  maxWinningStreak: number;
  maxLosingStreak: number;
  currentStreak: { type: 'WIN' | 'LOSS' | 'BE' | 'NONE'; count: number };
  avgWinningStreak: number;
  avgLosingStreak: number;
  maxDrawdownR: number;
  currentEquityR: number;
  peakEquityR: number;
  totalProfitLoss: number; // in $ currency
}

export interface PeriodStats {
  periodKey: string; // Date, Week (e.g. 2026-W38), or Month (e.g. 2026-09)
  label: string;
  trades: number;
  wins: number;
  losses: number;
  be: number;
  winRate: number;
  totalR: number;
  averageR: number;
  profitFactor: number | null;
}

export interface GroupedStats {
  name: string;
  trades: number;
  wins: number;
  losses: number;
  be: number;
  winRate: number;
  totalR: number;
  averageR: number;
  profitFactor: number | null;
  avgRR?: number;
  maxLosingStreak?: number;
}

export interface HistoricalPattern {
  id: string;
  pair: string;
  setup: string;
  session: string;
  timeframe: string;
  direction: string;
  marketCondition: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalR: number;
  averageR: number;
  profitFactor: number | null;
}

/**
 * Calculates high-level performance metrics across a list of trades
 */
export function calculatePerformanceSummary(trades: Trade[]): PerformanceSummary {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      be: 0,
      winRate: 0,
      lossRate: 0,
      beRate: 0,
      totalR: 0,
      averageR: 0,
      averageWinR: 0,
      averageLossR: 0,
      profitFactor: null,
      expectancy: 0,
      maxWinningStreak: 0,
      maxLosingStreak: 0,
      currentStreak: { type: 'NONE', count: 0 },
      avgWinningStreak: 0,
      avgLosingStreak: 0,
      maxDrawdownR: 0,
      currentEquityR: 0,
      peakEquityR: 0,
      totalProfitLoss: 0,
    };
  }

  const totalTrades = trades.length;
  let wins = 0;
  let losses = 0;
  let be = 0;
  let grossWinningR = 0;
  let grossLosingR = 0;
  let totalR = 0;
  let totalProfitLoss = 0;

  trades.forEach(t => {
    const r = Number(t.resultR) || 0;
    totalR += r;
    totalProfitLoss += Number(t.profitLoss) || 0;

    if (t.result === 'WIN') {
      wins++;
      grossWinningR += r > 0 ? r : 0;
    } else if (t.result === 'LOSS') {
      losses++;
      grossLosingR += Math.abs(r < 0 ? r : 0);
    } else {
      be++;
    }
  });

  const winRate = Number(((wins / totalTrades) * 100).toFixed(1));
  const lossRate = Number(((losses / totalTrades) * 100).toFixed(1));
  const beRate = Number(((be / totalTrades) * 100).toFixed(1));
  const averageR = Number((totalR / totalTrades).toFixed(2));
  const averageWinR = wins > 0 ? Number((grossWinningR / wins).toFixed(2)) : 0;
  const averageLossR = losses > 0 ? Number((grossLosingR / losses).toFixed(2)) : 0;

  // Profit Factor: Gross Winning R / Absolute Gross Losing R
  // Section 19: Jika belum ada loss, jangan tampilkan Infinity. Tampilkan null / 'N/A'
  const profitFactor = grossLosingR > 0
    ? Number((grossWinningR / grossLosingR).toFixed(2))
    : (grossWinningR > 0 ? null : 0);

  // Expectancy = (Win Rate / 100 * Average Win R) - (Loss Rate / 100 * Average Loss R)
  const expectancy = Number(
    (((winRate / 100) * averageWinR) - ((lossRate / 100) * averageLossR)).toFixed(2)
  );

  // Streaks & Drawdown calculation chronologically
  const sorted = [...trades].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  let maxWinningStreak = 0;
  let maxLosingStreak = 0;
  let currentWinningStreak = 0;
  let currentLosingStreak = 0;

  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];

  let currentStreakType: 'WIN' | 'LOSS' | 'BE' | 'NONE' = 'NONE';
  let currentStreakCount = 0;

  let cumulativeR = 0;
  let peakR = 0;
  let maxDrawdownR = 0;

  sorted.forEach((trade) => {
    const r = Number(trade.resultR) || 0;
    cumulativeR += r;
    if (cumulativeR > peakR) {
      peakR = cumulativeR;
    }
    const currentDrawdown = peakR - cumulativeR;
    if (currentDrawdown > maxDrawdownR) {
      maxDrawdownR = currentDrawdown;
    }

    if (trade.result === 'WIN') {
      currentWinningStreak++;
      if (currentLosingStreak > 0) {
        lossStreaks.push(currentLosingStreak);
        currentLosingStreak = 0;
      }
      if (currentWinningStreak > maxWinningStreak) {
        maxWinningStreak = currentWinningStreak;
      }
    } else if (trade.result === 'LOSS') {
      currentLosingStreak++;
      if (currentWinningStreak > 0) {
        winStreaks.push(currentWinningStreak);
        currentWinningStreak = 0;
      }
      if (currentLosingStreak > maxLosingStreak) {
        maxLosingStreak = currentLosingStreak;
      }
    } else {
      // BE resets streak
      if (currentWinningStreak > 0) winStreaks.push(currentWinningStreak);
      if (currentLosingStreak > 0) lossStreaks.push(currentLosingStreak);
      currentWinningStreak = 0;
      currentLosingStreak = 0;
    }
  });

  if (currentWinningStreak > 0) winStreaks.push(currentWinningStreak);
  if (currentLosingStreak > 0) lossStreaks.push(currentLosingStreak);

  const lastTrade = sorted[sorted.length - 1];
  if (lastTrade) {
    currentStreakType = lastTrade.result;
    let count = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].result === lastTrade.result) {
        count++;
      } else {
        break;
      }
    }
    currentStreakCount = count;
  }

  const avgWinningStreak = winStreaks.length > 0
    ? Number((winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length).toFixed(1))
    : 0;

  const avgLosingStreak = lossStreaks.length > 0
    ? Number((lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length).toFixed(1))
    : 0;

  return {
    totalTrades,
    wins,
    losses,
    be,
    winRate,
    lossRate,
    beRate,
    totalR: Number(totalR.toFixed(2)),
    averageR,
    averageWinR,
    averageLossR,
    profitFactor,
    expectancy,
    maxWinningStreak,
    maxLosingStreak,
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    avgWinningStreak,
    avgLosingStreak,
    maxDrawdownR: Number(maxDrawdownR.toFixed(2)),
    currentEquityR: Number(cumulativeR.toFixed(2)),
    peakEquityR: Number(peakR.toFixed(2)),
    totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
  };
}

/**
 * Calculates cumulative equity curve points
 */
export function calculateEquityCurve(trades: Trade[]): { index: number; date: string; pair: string; resultR: number; cumulativeR: number; peakR: number; drawdownR: number }[] {
  if (!trades || trades.length === 0) return [];

  const sorted = [...trades].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.time || '').localeCompare(b.time || '');
  });

  let cumulativeR = 0;
  let peakR = 0;

  return sorted.map((t, idx) => {
    const r = Number(t.resultR) || 0;
    cumulativeR = Number((cumulativeR + r).toFixed(2));
    if (cumulativeR > peakR) peakR = cumulativeR;
    const drawdownR = Number((peakR - cumulativeR).toFixed(2));

    return {
      index: idx + 1,
      date: t.date,
      pair: t.pair,
      resultR: r,
      cumulativeR,
      peakR,
      drawdownR,
    };
  });
}

/**
 * Groups and calculates daily performance
 */
export function calculateDailyPerformance(trades: Trade[]): PeriodStats[] {
  const map: Record<string, Trade[]> = {};
  trades.forEach(t => {
    const key = t.date;
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });

  const keys = Object.keys(map).sort();
  return keys.map(key => {
    const dayTrades = map[key];
    const summary = calculatePerformanceSummary(dayTrades);
    return {
      periodKey: key,
      label: key,
      trades: summary.totalTrades,
      wins: summary.wins,
      losses: summary.losses,
      be: summary.be,
      winRate: summary.winRate,
      totalR: summary.totalR,
      averageR: summary.averageR,
      profitFactor: summary.profitFactor,
    };
  });
}

/**
 * Groups and calculates weekly performance
 */
export function calculateWeeklyPerformance(trades: Trade[]): PeriodStats[] {
  const map: Record<string, Trade[]> = {};

  trades.forEach(t => {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) return;
    // ISO week format YYYY-Www
    const weekKey = getISOWeekKey(d);
    if (!map[weekKey]) map[weekKey] = [];
    map[weekKey].push(t);
  });

  const keys = Object.keys(map).sort();
  return keys.map(key => {
    const weekTrades = map[key];
    const summary = calculatePerformanceSummary(weekTrades);
    return {
      periodKey: key,
      label: `Week ${key.replace(/^.*-W/, '')}`,
      trades: summary.totalTrades,
      wins: summary.wins,
      losses: summary.losses,
      be: summary.be,
      winRate: summary.winRate,
      totalR: summary.totalR,
      averageR: summary.averageR,
      profitFactor: summary.profitFactor,
    };
  });
}

/**
 * Groups and calculates monthly performance
 */
export function calculateMonthlyPerformance(trades: Trade[]): PeriodStats[] {
  const map: Record<string, Trade[]> = {};

  trades.forEach(t => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!map[monthKey]) map[monthKey] = [];
    map[monthKey].push(t);
  });

  const keys = Object.keys(map).sort();
  return keys.map(key => {
    const mTrades = map[key];
    const summary = calculatePerformanceSummary(mTrades);
    return {
      periodKey: key,
      label: formatMonthLabel(key),
      trades: summary.totalTrades,
      wins: summary.wins,
      losses: summary.losses,
      be: summary.be,
      winRate: summary.winRate,
      totalR: summary.totalR,
      averageR: summary.averageR,
      profitFactor: summary.profitFactor,
    };
  });
}

function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mIndex = parseInt(month, 10) - 1;
  return `${months[mIndex] || month} ${year}`;
}

/**
 * Generic grouping function for analytics breakdown
 */
export function groupTradesBy(trades: Trade[], keyExtractor: (t: Trade) => string): GroupedStats[] {
  const map: Record<string, Trade[]> = {};

  trades.forEach(t => {
    const key = keyExtractor(t) || 'Unspecified';
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });

  return Object.keys(map).map(groupName => {
    const groupTrades = map[groupName];
    const summary = calculatePerformanceSummary(groupTrades);

    // Calculate average planned RR
    const avgRR = groupTrades.length > 0
      ? Number((groupTrades.reduce((acc, curr) => acc + (curr.rrPlanned || 0), 0) / groupTrades.length).toFixed(2))
      : 0;

    return {
      name: groupName,
      trades: summary.totalTrades,
      wins: summary.wins,
      losses: summary.losses,
      be: summary.be,
      winRate: summary.winRate,
      totalR: summary.totalR,
      averageR: summary.averageR,
      profitFactor: summary.profitFactor,
      avgRR,
      maxLosingStreak: summary.maxLosingStreak,
    };
  });
}

export function groupByPair(trades: Trade[]): GroupedStats[] {
  return groupTradesBy(trades, t => t.pair).sort((a, b) => b.trades - a.trades);
}

export function groupBySetup(trades: Trade[]): GroupedStats[] {
  return groupTradesBy(trades, t => t.setup).sort((a, b) => b.trades - a.trades);
}

export function groupBySession(trades: Trade[]): GroupedStats[] {
  return groupTradesBy(trades, t => t.session);
}

export function groupByTimeframe(trades: Trade[]): GroupedStats[] {
  const tfOrder = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
  return groupTradesBy(trades, t => t.timeframe).sort((a, b) => {
    const idxA = tfOrder.indexOf(a.name);
    const idxB = tfOrder.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.name.localeCompare(b.name);
  });
}

export function groupByDirection(trades: Trade[]): GroupedStats[] {
  return groupTradesBy(trades, t => t.direction);
}

export function groupByMarketCondition(trades: Trade[]): GroupedStats[] {
  return groupTradesBy(trades, t => t.marketCondition);
}

/**
 * Plan Compliance Analysis (Section 46, 47)
 */
export function calculatePlanCompliance(trades: Trade[]): {
  followingPlan: { trades: number; wins: number; losses: number; winRate: number; totalR: number; avgR: number; averageR: number; profitFactor: number | null };
  violatingPlan: { trades: number; wins: number; losses: number; winRate: number; totalR: number; avgR: number; averageR: number; profitFactor: number | null };
  violationReasons: { reason: string; count: number }[];
} {
  const compliant = trades.filter(t => t.executedToPlan);
  const nonCompliant = trades.filter(t => !t.executedToPlan || t.planViolation);

  const compSummary = calculatePerformanceSummary(compliant);
  const nonCompSummary = calculatePerformanceSummary(nonCompliant);

  const reasonMap: Record<string, number> = {};
  nonCompliant.forEach(t => {
    const r = t.planViolationReason || t.mistake || 'Unspecified violation';
    reasonMap[r] = (reasonMap[r] || 0) + 1;
  });

  const violationReasons = Object.entries(reasonMap)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  return {
    followingPlan: {
      trades: compSummary.totalTrades,
      wins: compSummary.wins,
      losses: compSummary.losses,
      winRate: compSummary.winRate,
      totalR: compSummary.totalR,
      avgR: compSummary.averageR,
      averageR: compSummary.averageR,
      profitFactor: compSummary.profitFactor,
    },
    violatingPlan: {
      trades: nonCompSummary.totalTrades,
      wins: nonCompSummary.wins,
      losses: nonCompSummary.losses,
      winRate: nonCompSummary.winRate,
      totalR: nonCompSummary.totalR,
      avgR: nonCompSummary.averageR,
      averageR: nonCompSummary.averageR,
      profitFactor: nonCompSummary.profitFactor,
    },
    violationReasons,
  };
}

/**
 * Historical Performance Patterns (Section 21)
 * Analyzes combinations: Pair + Setup + Session + Timeframe + Direction + Market Condition
 * Filters by minimum sample size (default 10)
 */
export function calculateHistoricalPatterns(trades: Trade[], minSampleSize: number = 10): HistoricalPattern[] {
  const map: Record<string, { keyParts: { pair: string; setup: string; session: string; timeframe: string; direction: string; marketCondition: string }; trades: Trade[] }> = {};

  trades.forEach(t => {
    const key = `${t.pair}__${t.setup}__${t.session}__${t.timeframe}__${t.direction}__${t.marketCondition}`;
    if (!map[key]) {
      map[key] = {
        keyParts: {
          pair: t.pair,
          setup: t.setup,
          session: t.session,
          timeframe: t.timeframe,
          direction: t.direction,
          marketCondition: t.marketCondition,
        },
        trades: [],
      };
    }
    map[key].trades.push(t);
  });

  const patterns: HistoricalPattern[] = [];

  Object.entries(map).forEach(([id, item]) => {
    if (item.trades.length >= minSampleSize) {
      const summary = calculatePerformanceSummary(item.trades);
      patterns.push({
        id,
        ...item.keyParts,
        trades: summary.totalTrades,
        wins: summary.wins,
        losses: summary.losses,
        winRate: summary.winRate,
        totalR: summary.totalR,
        averageR: summary.averageR,
        profitFactor: summary.profitFactor,
      });
    }
  });

  // Sort by Total R descending
  return patterns.sort((a, b) => b.totalR - a.totalR);
}

/**
 * Descriptive insights generator (Section 20)
 * Strictly descriptive ("Data menunjukkan...", "Dalam dataset saat ini...", no trading predictions)
 */
export function generateDescriptiveInsights(trades: Trade[]): string[] {
  if (!trades || trades.length === 0) {
    return ['Belum ada data backtest yang tercatat. Masukkan data transaksi pertama untuk melihat ringkasan performa.'];
  }

  const insights: string[] = [];
  const summary = calculatePerformanceSummary(trades);

  insights.push(
    `Dalam dataset saat ini, tercatat total ${summary.totalTrades} transaksi dengan akumulasi ${summary.totalR >= 0 ? '+' : ''}${summary.totalR}R dan tingkat win rate ${summary.winRate}%.`
  );

  // Setup breakdown
  const setups = groupBySetup(trades);
  if (setups.length > 0) {
    const mostFreqSetup = setups[0];
    insights.push(
      `Setup "${mostFreqSetup.name}" tercatat paling sering diuji sebanyak ${mostFreqSetup.trades} kali dengan win rate ${mostFreqSetup.winRate}% dan total akumulasi ${mostFreqSetup.totalR >= 0 ? '+' : ''}${mostFreqSetup.totalR}R.`
    );
  }

  // Session breakdown
  const sessions = groupBySession(trades).sort((a, b) => b.trades - a.trades);
  if (sessions.length > 0) {
    const topSession = sessions[0];
    insights.push(
      `Sesi "${topSession.name}" mencatat aktivitas tertinggi sebanyak ${topSession.trades} transaksi dengan hasil ${topSession.totalR >= 0 ? '+' : ''}${topSession.totalR}R.`
    );
  }

  // Pair breakdown
  const pairs = groupByPair(trades);
  if (pairs.length > 0) {
    const topPair = pairs[0];
    insights.push(
      `Instrumen pair "${topPair.name}" memiliki jumlah data backtest terbanyak yaitu ${topPair.trades} transaksi.`
    );
  }

  // Compliance
  const compliance = calculatePlanCompliance(trades);
  if (compliance.violatingPlan.trades > 0) {
    const percentViolation = ((compliance.violatingPlan.trades / summary.totalTrades) * 100).toFixed(1);
    insights.push(
      `Terdapat ${compliance.violatingPlan.trades} transaksi (${percentViolation}%) yang tercatat mengalami deviasi atau pelanggaran rencana trading.`
    );
  }

  return insights;
}

/**
 * Master analytics calculation that builds the complete TradeAnalytics structure
 */
export function calculateAnalytics(
  trades: Trade[],
  accountSize: number = 300,
  riskPercent: number = 1.0
): TradeAnalytics {
  const summary = calculatePerformanceSummary(trades);
  const compliance = calculatePlanCompliance(trades);
  const equityPoints = calculateEquityCurve(trades);

  // Setups
  const setups = groupBySetup(trades).map(s => ({
    setup: s.name,
    trades: s.trades,
    wins: s.wins,
    losses: s.losses,
    be: s.be,
    winRate: s.winRate,
    totalR: s.totalR,
    avgR: s.averageR,
    profitFactor: s.profitFactor ?? 0,
  }));

  // Pairs
  const pairs = groupByPair(trades).map(p => ({
    pair: p.name,
    trades: p.trades,
    wins: p.wins,
    losses: p.losses,
    be: p.be,
    winRate: p.winRate,
    totalR: p.totalR,
    avgR: p.averageR,
    profitFactor: p.profitFactor ?? 0,
  }));

  // Sessions
  const sessions = groupBySession(trades).map(s => ({
    session: s.name,
    trades: s.trades,
    wins: s.wins,
    losses: s.losses,
    be: s.be,
    winRate: s.winRate,
    totalR: s.totalR,
    avgR: s.averageR,
  }));

  // Timeframes
  const timeframes = groupByTimeframe(trades).map(t => ({
    timeframe: t.name,
    trades: t.trades,
    wins: t.wins,
    losses: t.losses,
    be: t.be,
    winRate: t.winRate,
    totalR: t.totalR,
    avgR: t.averageR,
  }));

  // Day of week
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayMap: Record<string, Trade[]> = {};
  trades.forEach(t => {
    const d = new Date(t.date);
    const day = dayNames[d.getDay()] || 'Unknown';
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(t);
  });
  const byDayOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => {
    const dayTrades = dayMap[day] || [];
    const sum = calculatePerformanceSummary(dayTrades);
    return {
      day,
      trades: sum.totalTrades,
      winRate: sum.winRate,
      totalR: sum.totalR,
    };
  });

  // Hour
  const hourMap: Record<string, Trade[]> = {};
  trades.forEach(t => {
    const hour = (t.time || '12:00').split(':')[0] + ':00';
    if (!hourMap[hour]) hourMap[hour] = [];
    hourMap[hour].push(t);
  });
  const byHour = Object.keys(hourMap).sort().map(hour => {
    const hTrades = hourMap[hour];
    const sum = calculatePerformanceSummary(hTrades);
    return {
      hour,
      trades: sum.totalTrades,
      winRate: sum.winRate,
      totalR: sum.totalR,
    };
  });

  // Market Condition
  const mcMap = groupByMarketCondition(trades).map(m => ({
    condition: m.name,
    trades: m.trades,
    winRate: m.winRate,
    totalR: m.totalR,
  }));

  // Mistakes
  const mistakeMap: Record<string, { count: number; totalLostR: number }> = {};
  trades.filter(t => t.mistake).forEach(t => {
    const m = t.mistake.trim();
    if (!mistakeMap[m]) mistakeMap[m] = { count: 0, totalLostR: 0 };
    mistakeMap[m].count++;
    if (t.resultR < 0) {
      mistakeMap[m].totalLostR += Math.abs(t.resultR);
    }
  });
  const byMistake = Object.entries(mistakeMap).map(([mistake, val]) => ({
    mistake,
    count: val.count,
    totalLostR: Number(val.totalLostR.toFixed(2)),
  })).sort((a, b) => b.count - a.count);

  // Emotions
  const emotionMap: Record<string, Trade[]> = {};
  trades.filter(t => t.emotion).forEach(t => {
    const emo = t.emotion.trim();
    if (!emotionMap[emo]) emotionMap[emo] = [];
    emotionMap[emo].push(t);
  });
  const byEmotion = Object.entries(emotionMap).map(([emotion, list]) => {
    const sum = calculatePerformanceSummary(list);
    return {
      emotion,
      count: list.length,
      winRate: sum.winRate,
      totalR: sum.totalR,
    };
  }).sort((a, b) => b.count - a.count);

  // Equity Curve & Drawdown Series
  const riskAmount = (accountSize * riskPercent) / 100;
  let cumulativeR = 0;
  let peakR = 0;
  const equityCurve = equityPoints.map((p, idx) => {
    const r = p.resultR;
    cumulativeR = p.cumulativeR;
    if (cumulativeR > peakR) peakR = cumulativeR;
    const equityAmount = accountSize + (cumulativeR * riskAmount);
    return {
      tradeNumber: idx + 1,
      date: p.date,
      pair: p.pair,
      resultR: r,
      cumulativeR,
      equityAmount: Number(equityAmount.toFixed(2)),
    };
  });

  let maxDdPercent = 0;
  const drawdownSeries = equityCurve.map((p) => {
    const currentPeak = Math.max(...equityCurve.slice(0, p.tradeNumber).map(x => x.cumulativeR), 0);
    const ddR = currentPeak - p.cumulativeR;
    const peakEquity = accountSize + (currentPeak * riskAmount);
    const ddPercent = peakEquity > 0 ? (ddR * riskAmount / peakEquity) * 100 : 0;
    if (ddPercent > maxDdPercent) maxDdPercent = ddPercent;
    return {
      tradeNumber: p.tradeNumber,
      date: p.date,
      drawdownR: Number(ddR.toFixed(2)),
      drawdownPercent: Number(ddPercent.toFixed(2)),
    };
  });

  // Monthly stats
  const monthlyStats = calculateMonthlyPerformance(trades).map(m => ({
    period: m.label,
    trades: m.trades,
    winRate: m.winRate,
    totalR: m.totalR,
    profitLoss: Number((m.totalR * riskAmount).toFixed(2)),
  }));

  const complianceRate = trades.length > 0
    ? Number(((compliance.followingPlan.trades / trades.length) * 100).toFixed(1))
    : 100;

  const largestWinR = trades.filter(t => t.resultR > 0).reduce((max, t) => Math.max(max, t.resultR), 0);
  const largestLossR = trades.filter(t => t.resultR < 0).reduce((min, t) => Math.min(min, t.resultR), 0);

  const directionBreakdown: Record<string, { trades: number; wins: number; losses: number; winRate: number; totalR: number; profitFactor: number }> = {};
  ['BUY', 'SELL'].forEach(dir => {
    const dirTrades = trades.filter(t => t.direction === dir);
    const sum = calculatePerformanceSummary(dirTrades);
    directionBreakdown[dir] = {
      trades: sum.totalTrades,
      wins: sum.wins,
      losses: sum.losses,
      winRate: sum.winRate,
      totalR: sum.totalR,
      profitFactor: sum.profitFactor ?? 0,
    };
  });

  const setupBreakdown: Record<string, any> = {};
  setups.forEach(s => { setupBreakdown[s.setup] = s; });

  const pairBreakdown: Record<string, any> = {};
  pairs.forEach(p => { pairBreakdown[p.pair] = p; });

  const sessionBreakdown: Record<string, any> = {};
  sessions.forEach(s => { sessionBreakdown[s.session] = s; });

  const timeframeBreakdown: Record<string, any> = {};
  timeframes.forEach(t => { timeframeBreakdown[t.timeframe] = t; });

  const conditionBreakdown: Record<string, any> = {};
  mcMap.forEach(c => { conditionBreakdown[c.condition] = c; });

  const dayOfWeekBreakdown: Record<string, any> = {};
  byDayOfWeek.forEach(d => { dayOfWeekBreakdown[d.day] = d; });

  const drawdownData = equityPoints.map(p => ({
    index: p.index,
    date: p.date,
    pair: p.pair,
    drawdownR: p.drawdownR,
    cumulativeR: p.cumulativeR,
  }));

  return {
    totalTrades: summary.totalTrades,
    wins: summary.wins,
    losses: summary.losses,
    breakEvens: summary.be,
    winRate: summary.winRate,
    lossRate: summary.lossRate,
    breakEvenRate: summary.beRate,
    totalR: summary.totalR,
    totalProfitLoss: Number((summary.totalR * riskAmount).toFixed(2)),
    averageR: summary.averageR,
    averageWinR: summary.averageWinR,
    averageLossR: summary.averageLossR,
    averageWinAmount: Number((summary.averageWinR * riskAmount).toFixed(2)),
    averageLossAmount: Number((summary.averageLossR * riskAmount).toFixed(2)),
    largestWinR,
    largestWinAmount: Number((largestWinR * riskAmount).toFixed(2)),
    largestLossR,
    largestLossAmount: Number((Math.abs(largestLossR) * riskAmount).toFixed(2)),
    profitFactor: summary.profitFactor ?? 0,
    expectancyR: summary.expectancy,
    maxWinningStreak: summary.maxWinningStreak,
    maxLosingStreak: summary.maxLosingStreak,
    averageWinningStreak: summary.maxWinningStreak,
    averageLosingStreak: summary.maxLosingStreak,
    currentStreak: summary.currentStreak,
    maxDrawdownR: summary.maxDrawdownR,
    maxDrawdownPercent: Number(maxDdPercent.toFixed(2)),
    maxDrawdownAmount: Number((summary.maxDrawdownR * riskAmount).toFixed(2)),
    currentEquityR: summary.currentEquityR,
    peakEquityR: summary.peakEquityR,
    planComplianceRate: complianceRate,
    planViolationsCount: compliance.violatingPlan.trades,
    planCompliantTotalR: compliance.followingPlan.totalR,
    planViolationTotalR: compliance.violatingPlan.totalR,
    planCompliantWinRate: compliance.followingPlan.winRate,
    planViolationWinRate: compliance.violatingPlan.winRate,
    disciplinedStats: {
      trades: compliance.followingPlan.trades,
      wins: compliance.followingPlan.wins,
      losses: compliance.followingPlan.losses,
      winRate: compliance.followingPlan.winRate,
      totalR: compliance.followingPlan.totalR,
      profitFactor: compliance.followingPlan.profitFactor ?? 0,
      averageR: compliance.followingPlan.averageR,
    },
    violatedStats: {
      trades: compliance.violatingPlan.trades,
      wins: compliance.violatingPlan.wins,
      losses: compliance.violatingPlan.losses,
      winRate: compliance.violatingPlan.winRate,
      totalR: compliance.violatingPlan.totalR,
      profitFactor: compliance.violatingPlan.profitFactor ?? 0,
      averageR: compliance.violatingPlan.averageR,
    },
    directionBreakdown,
    setupBreakdown,
    pairBreakdown,
    sessionBreakdown,
    timeframeBreakdown,
    conditionBreakdown,
    dayOfWeekBreakdown,
    bySetup: setups,
    byPair: pairs,
    bySession: sessions,
    byTimeframe: timeframes,
    byDayOfWeek,
    byHour,
    byMarketCondition: mcMap,
    byMistake,
    byEmotion,
    equityCurve,
    drawdownSeries,
    equityData: equityPoints,
    drawdownData,
    dailyStats: calculateDailyPerformance(trades),
    weeklyStats: calculateWeeklyPerformance(trades),
    monthlyStats,
    descriptiveInsights: generateDescriptiveInsights(trades),
  };
}
