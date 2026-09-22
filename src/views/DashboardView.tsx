import React from 'react';
import {
  TrendingUp,
  Percent,
  Calculator,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Layers,
  Database,
  PlusCircle,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { Trade, TradeAnalytics, AppSettings } from '../types/trade';
import { StatCard } from '../components/common/StatCard';
import { EquityCurveChart } from '../components/charts/EquityCurveChart';
import { StreakDisplay } from '../components/common/StreakDisplay';
import { PeriodBarChart } from '../components/charts/PeriodBarChart';
import { ResultBadge, DirectionBadge } from '../components/common/Badge';
import { formatR, formatPercent, formatCurrency, formatDate } from '../utils/formatters';

interface DashboardViewProps {
  analytics: TradeAnalytics;
  trades: Trade[];
  settings: AppSettings;
  onOpenAddTrade: () => void;
  onOpenQuickAdd: () => void;
  onSelectTrade: (trade: Trade) => void;
  onNavigate: (page: any) => void;
  onLoadDemoData: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  trades,
  settings,
  onOpenAddTrade,
  onOpenQuickAdd,
  onSelectTrade,
  onNavigate,
  onLoadDemoData,
}) => {
  // Empty State handler (Section 53)
  if (trades.length === 0) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0c121d] p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Belum Ada Data Backtest</h2>
        <p className="max-w-md text-xs text-slate-400 mt-2 leading-relaxed">
          Aplikasi trading journal backtest siap digunakan. Mulai rekam setup trading Anda dengan screenshot dan analisis otomatis, atau muat data demo untuk menjelajahi dashboard.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenAddTrade}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:bg-emerald-500 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Catat Trade Pertama</span>
          </button>

          <button
            onClick={onLoadDemoData}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Load Demo Data (18 Backtest)</span>
          </button>
        </div>
      </div>
    );
  }

  // Top setups summary
  const topSetups = [...(analytics.bySetup || [])]
    .sort((a, b) => b.totalR - a.totalR)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. TOP METRICS CARDS (Section 15 & 18) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Trades"
          value={analytics.totalTrades}
          subValue={`${analytics.wins}W / ${analytics.losses}L / ${analytics.breakEvens}BE`}
          icon={<Layers className="w-4 h-4" />}
          hint={`Win Rate: ${formatPercent(analytics.winRate)}`}
        />

        <StatCard
          label="Win Rate"
          value={formatPercent(analytics.winRate)}
          subValue={`${analytics.wins} Wins`}
          trend={analytics.winRate >= 50 ? 'positive' : 'negative'}
          icon={<Percent className="w-4 h-4" />}
          hint={`Loss Rate: ${formatPercent(analytics.lossRate)}`}
        />

        <StatCard
          label="Profit Factor"
          value={analytics.profitFactor.toFixed(2)}
          trend={analytics.profitFactor >= 1.5 ? 'positive' : analytics.profitFactor >= 1.0 ? 'neutral' : 'negative'}
          icon={<TrendingUp className="w-4 h-4" />}
          hint={analytics.profitFactor > 1 ? 'Profitable Edge' : 'Negative Edge'}
        />

        <StatCard
          label="Total Return"
          value={formatR(analytics.totalR)}
          subValue={formatCurrency(analytics.totalProfitLoss)}
          trend={analytics.totalR >= 0 ? 'positive' : 'negative'}
          icon={<ArrowUpRight className="w-4 h-4" />}
          hint={`Avg Trade: ${formatR(analytics.averageR)}`}
        />

        <StatCard
          label="Expectancy"
          value={formatR(analytics.expectancyR)}
          trend={analytics.expectancyR > 0 ? 'positive' : 'negative'}
          icon={<Calculator className="w-4 h-4" />}
          hint={`Per trade expected value`}
        />

        <StatCard
          label="Max Drawdown"
          value={`-${analytics.maxDrawdownR.toFixed(2)}R`}
          subValue={formatCurrency(analytics.maxDrawdownAmount)}
          trend="negative"
          icon={<ShieldAlert className="w-4 h-4" />}
          hint={`Peak to trough R`}
        />
      </div>

      {/* 2. EQUITY CURVE (Section 15, 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EquityCurveChart
            data={analytics.equityData}
            height={290}
          />
        </div>

        {/* Quick Setup Performance Widget */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Setup Performance
              </h3>
              <button
                onClick={() => onNavigate('patterns')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Patterns</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {topSetups.map((s) => (
                <div
                  key={s.setup}
                  className="flex items-center justify-between rounded-lg bg-slate-900/80 p-2.5 border border-slate-800/80"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="truncate text-xs font-semibold text-slate-200">{s.setup}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {s.trades} trades • WR: {formatPercent(s.winRate)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`font-mono text-xs font-bold ${
                        s.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatR(s.totalR)}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">PF: {s.profitFactor.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Compliance Highlight */}
          <div className="mt-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Plan Compliance</span>
              <span className="font-mono font-bold text-emerald-400">
                {analytics.planComplianceRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Disiplin SOP: {analytics.planViolationsCount} pelanggaran dari {analytics.totalTrades} trade.
            </p>
          </div>
        </div>
      </div>

      {/* 3. STREAK ANALYSIS (Section 16) */}
      <StreakDisplay
        maxWinningStreak={analytics.maxWinningStreak}
        maxLosingStreak={analytics.maxLosingStreak}
        currentStreak={analytics.currentStreak}
        avgWinningStreak={analytics.averageWinningStreak}
        avgLosingStreak={analytics.averageLosingStreak}
      />

      {/* 4. PERIODIC PERFORMANCE BARS (Weekly / Monthly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PeriodBarChart
          title="Daily Performance"
          subtitle="Distribusi hasil R per hari trading"
          data={analytics.dailyStats}
          height={200}
        />
        <PeriodBarChart
          title="Weekly Performance"
          subtitle="Distribusi hasil R per minggu backtest"
          data={analytics.weeklyStats}
          height={200}
        />
      </div>

      {/* 5. RECENT TRADES PREVIEW (Section 43) */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Transaksi Terakhir
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">5 transaksi backtest terbaru</p>
          </div>
          <button
            onClick={() => onNavigate('trades')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Lihat Semua ({trades.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Pair</th>
                <th className="py-2 px-2">Dir</th>
                <th className="py-2 px-3">Setup</th>
                <th className="py-2 px-3">Session</th>
                <th className="py-2 px-3">Result (R)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {trades.slice(-5).reverse().map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onSelectTrade(t)}
                  className="cursor-pointer hover:bg-slate-800/40 transition"
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400">{formatDate(t.date)}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-100">{t.pair}</td>
                  <td className="py-2.5 px-2">
                    <DirectionBadge direction={t.direction} />
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{t.setup}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.session}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <ResultBadge result={t.result} />
                      <span
                        className={`font-mono font-bold ${
                          t.resultR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatR(t.resultR)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
