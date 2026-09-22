import { Trade } from '../types/trade';
import { calculatePerformanceSummary, groupByPair, groupBySetup, groupBySession, calculatePlanCompliance } from './analytics';
import { formatR, formatPercent } from './formatters';

/**
 * Exports trades to a standardized CSV string
 */
export function exportTradesToCSV(trades: Trade[]): void {
  if (!trades || trades.length === 0) return;

  const headers = [
    'ID', 'Date', 'Time', 'Pair', 'Direction', 'Timeframe', 'Session',
    'Setup', 'MarketCondition', 'Entry', 'StopLoss', 'TakeProfit', 'Exit',
    'RiskPercent', 'RiskAmount', 'RR_Planned', 'RR_Actual', 'Result',
    'ResultR', 'ProfitLoss', 'Duration', 'ScreenshotURL', 'EntryReason',
    'MarketContext', 'Confirmation', 'Mistake', 'Emotion', 'Lesson',
    'Tags', 'ExecutedToPlan', 'PlanViolation', 'PlanViolationReason',
    'BacktestSessionID', 'AccountID', 'CreatedAt'
  ];

  const rows = trades.map(t => [
    t.id,
    t.date,
    t.time,
    t.pair,
    t.direction,
    t.timeframe,
    t.session,
    `"${(t.setup || '').replace(/"/g, '""')}"`,
    t.marketCondition,
    t.entry,
    t.stopLoss,
    t.takeProfit,
    t.exit,
    t.riskPercent,
    t.riskAmount,
    t.rrPlanned,
    t.rrActual,
    t.result,
    t.resultR,
    t.profitLoss,
    `"${(t.duration || '').replace(/"/g, '""')}"`,
    `"${(t.screenshotUrl || '').replace(/"/g, '""')}"`,
    `"${(t.entryReason || '').replace(/"/g, '""')}"`,
    `"${(t.marketContext || '').replace(/"/g, '""')}"`,
    `"${(t.confirmation || '').replace(/"/g, '""')}"`,
    `"${(t.mistake || '').replace(/"/g, '""')}"`,
    `"${(t.emotion || '').replace(/"/g, '""')}"`,
    `"${(t.lesson || '').replace(/"/g, '""')}"`,
    `"${(t.tags || []).join(',')}"`,
    t.executedToPlan ? 'YES' : 'NO',
    t.planViolation ? 'YES' : 'NO',
    `"${(t.planViolationReason || '').replace(/"/g, '""')}"`,
    t.backtestSessionId || '',
    t.accountId || '',
    t.createdAt,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csvContent, `forex_backtest_trades_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports complete JSON backup
 */
export function exportBackupJSON(data: { trades: Trade[]; settings: unknown }): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `forex_backtest_backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

/**
 * Downloads a file to client
 */
function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses an imported CSV string into Trade objects
 */
export function parseCSVToTrades(csvText: string): Trade[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = parseCSVLine(lines[0]);
  const trades: Trade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 5) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, index) => {
      row[h.trim()] = values[index] || '';
    });

    const entry = parseFloat(row['Entry']) || 0;
    const stopLoss = parseFloat(row['StopLoss']) || 0;
    const takeProfit = parseFloat(row['TakeProfit']) || 0;
    const exit = parseFloat(row['Exit']) || entry;
    const resultR = parseFloat(row['ResultR']) || 0;

    const trade: Trade = {
      id: row['ID'] || `TRD-${Date.now()}-${i}`,
      date: row['Date'] || new Date().toISOString().slice(0, 10),
      time: row['Time'] || '12:00',
      pair: row['Pair'] || 'XAUUSD',
      direction: (row['Direction'] === 'SELL' ? 'SELL' : 'BUY'),
      timeframe: (row['Timeframe'] as any) || 'M15',
      session: (row['Session'] as any) || 'LONDON',
      setup: row['Setup'] || 'General Setup',
      marketCondition: (row['MarketCondition'] as any) || 'TRENDING',
      entry,
      stopLoss,
      takeProfit,
      exit,
      riskPercent: parseFloat(row['RiskPercent']) || 1.0,
      riskAmount: parseFloat(row['RiskAmount']) || 3.0,
      rrPlanned: parseFloat(row['RR_Planned']) || 0,
      rrActual: parseFloat(row['RR_Actual']) || 0,
      result: (row['Result'] as any) || (resultR > 0 ? 'WIN' : resultR < 0 ? 'LOSS' : 'BE'),
      resultR,
      profitLoss: parseFloat(row['ProfitLoss']) || (resultR * 3),
      duration: row['Duration'] || '',
      screenshotUrl: row['ScreenshotURL'] || '',
      screenshots: row['ScreenshotURL'] ? [{ id: 'sc-' + i, name: 'Imported', url: row['ScreenshotURL'], type: 'entry' }] : [],
      entryReason: row['EntryReason'] || '',
      marketContext: row['MarketContext'] || '',
      confirmation: row['Confirmation'] || '',
      mistake: row['Mistake'] || '',
      emotion: row['Emotion'] || '',
      lesson: row['Lesson'] || '',
      tags: row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : [],
      executedToPlan: row['ExecutedToPlan'] === 'YES' || row['ExecutedToPlan'] === 'true',
      planViolation: row['PlanViolation'] === 'YES' || row['PlanViolation'] === 'true',
      planViolationReason: row['PlanViolationReason'] || '',
      backtestSessionId: row['BacktestSessionID'] || '',
      accountId: row['AccountID'] || 'Default',
      createdAt: row['CreatedAt'] || new Date().toISOString(),
    };

    trades.push(trade);
  }

  return trades;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Generates an executive trade summary report text / markdown
 */
export function generateTradeReport(trades: Trade[], periodLabel: string = 'All Time'): string {
  const summary = calculatePerformanceSummary(trades);
  const pairs = groupByPair(trades);
  const setups = groupBySetup(trades);
  const sessions = groupBySession(trades);
  const compliance = calculatePlanCompliance(trades);

  return `# FOREX BACKTEST REPORT: ${periodLabel}
Generated: ${new Date().toLocaleString()}

## 1. PERFORMANCE SUMMARY
- Total Trades: ${summary.totalTrades}
- Win Rate: ${formatPercent(summary.winRate)} (${summary.wins} Wins / ${summary.losses} Losses / ${summary.be} BE)
- Total R: ${formatR(summary.totalR)}
- Average R: ${formatR(summary.averageR)}
- Profit Factor: ${summary.profitFactor !== null ? summary.profitFactor.toFixed(2) : 'N/A'}
- Expectancy: ${formatR(summary.expectancy)}
- Max Drawdown: ${formatR(summary.maxDrawdownR)}
- Max Winning Streak: ${summary.maxWinningStreak} trades
- Max Losing Streak: ${summary.maxLosingStreak} trades

## 2. PLAN COMPLIANCE
- Followed Plan: ${compliance.followingPlan.trades} trades (${formatPercent(compliance.followingPlan.winRate)} Win Rate, ${formatR(compliance.followingPlan.totalR)})
- Plan Violations: ${compliance.violatingPlan.trades} trades (${formatPercent(compliance.violatingPlan.winRate)} Win Rate, ${formatR(compliance.violatingPlan.totalR)})

## 3. PERFORMANCE BY PAIR
${pairs.map(p => `- ${p.name}: ${p.trades} trades | Win Rate: ${formatPercent(p.winRate)} | Total: ${formatR(p.totalR)} | Avg: ${formatR(p.averageR)}`).join('\n')}

## 4. PERFORMANCE BY SETUP
${setups.map(s => `- ${s.name}: ${s.trades} trades | Win Rate: ${formatPercent(s.winRate)} | Total: ${formatR(s.totalR)} | Avg: ${formatR(s.averageR)}`).join('\n')}

## 5. PERFORMANCE BY SESSION
${sessions.map(s => `- ${s.name}: ${s.trades} trades | Win Rate: ${formatPercent(s.winRate)} | Total: ${formatR(s.totalR)}`).join('\n')}
`;
}
