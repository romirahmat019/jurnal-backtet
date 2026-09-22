import React, { useState } from 'react';
import {
  BarChart3,
  Layers,
  Clock,
  Calendar,
  Compass,
  Activity,
  CheckCircle2,
  XCircle,
  AlertOctagon,
} from 'lucide-react';
import { TradeAnalytics, Trade } from '../types/trade';
import { DrawdownChart } from '../components/charts/DrawdownChart';
import { formatR, formatPercent, formatCurrency } from '../utils/formatters';

interface AnalyticsViewProps {
  analytics: TradeAnalytics;
  trades: Trade[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, trades }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'pair' | 'setup' | 'session' | 'timeframe' | 'condition' | 'dayOfWeek' | 'compliance'
  >('overview');

  const renderBreakdownTable = (
    dataMap: Record<string, any>,
    title: string,
    keyLabel: string
  ) => {
    const list = Object.values(dataMap).sort((a: any, b: any) => b.totalR - a.totalR);

    return (
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a]/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
              <tr>
                <th className="py-2.5 px-3">{keyLabel}</th>
                <th className="py-2.5 px-3">Trades</th>
                <th className="py-2.5 px-3">W / L / BE</th>
                <th className="py-2.5 px-3">Win Rate</th>
                <th className="py-2.5 px-3">Profit Factor</th>
                <th className="py-2.5 px-3">Avg R</th>
                <th className="py-2.5 px-3 font-mono">Total R</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {list.map((item: any) => (
                <tr key={item.name} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-100">{item.name}</td>
                  <td className="py-2.5 px-3 font-mono">{item.trades}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {item.wins}W / {item.losses}L / {item.breakEvens}BE
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                    {formatPercent(item.winRate)}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {item.profitFactor >= 999 ? '∞' : item.profitFactor.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{formatR(item.averageR)}</td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span className={item.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatR(item.totalR)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0f172a] p-1.5 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'overview' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Drawdown
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'compliance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Plan Compliance
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'setup' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          By Setup
        </button>
        <button
          onClick={() => setActiveTab('pair')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'pair' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          By Pair
        </button>
        <button
          onClick={() => setActiveTab('session')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'session' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          By Session
        </button>
        <button
          onClick={() => setActiveTab('timeframe')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'timeframe' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          By Timeframe
        </button>
        <button
          onClick={() => setActiveTab('condition')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'condition' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          By Market Condition
        </button>
        <button
          onClick={() => setActiveTab('dayOfWeek')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            activeTab === 'dayOfWeek' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          By Day of Week
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW & DRAWDOWN */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Underwater Drawdown Chart */}
          <DrawdownChart
            data={analytics.drawdownData}
            maxDrawdownR={analytics.maxDrawdownR}
            height={220}
          />

          {/* Direction Comparison (BUY vs SELL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Direction Performance (BUY vs SELL)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['BUY', 'SELL'].map((dir) => {
                  const data = analytics.directionBreakdown[dir] || {
                    trades: 0,
                    winRate: 0,
                    totalR: 0,
                    profitFactor: 0,
                  };
                  return (
                    <div
                      key={dir}
                      className={`rounded-lg p-3 border ${
                        dir === 'BUY'
                          ? 'border-emerald-500/20 bg-emerald-950/20'
                          : 'border-rose-500/20 bg-rose-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-100">{dir}</span>
                        <span className="font-mono text-xs text-slate-400">{data.trades} trades</span>
                      </div>
                      <div className="mt-2 text-xl font-bold font-mono text-slate-100">
                        {formatPercent(data.winRate)} <span className="text-xs text-slate-400 font-normal">WR</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Total R:</span>
                        <span
                          className={`font-mono font-bold ${
                            data.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatR(data.totalR)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Profit Factor:</span>
                        <span className="font-mono text-slate-200">{data.profitFactor.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk & Reward Profile */}
            <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Risk & Reward Profile
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800">
                  <span className="text-slate-500 block">Average Win</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    +{analytics.averageWinR.toFixed(2)}R
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{formatCurrency(analytics.averageWinAmount)}</div>
                </div>

                <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800">
                  <span className="text-slate-500 block">Average Loss</span>
                  <span className="font-mono text-base font-bold text-rose-400">
                    {analytics.averageLossR.toFixed(2)}R
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{formatCurrency(analytics.averageLossAmount)}</div>
                </div>

                <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800">
                  <span className="text-slate-500 block">Largest Win</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    +{analytics.largestWinR.toFixed(2)}R
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{formatCurrency(analytics.largestWinAmount)}</div>
                </div>

                <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800">
                  <span className="text-slate-500 block">Largest Loss</span>
                  <span className="font-mono text-base font-bold text-rose-400">
                    {analytics.largestLossR.toFixed(2)}R
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">{formatCurrency(analytics.largestLossAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PLAN COMPLIANCE (Section 46) */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-5">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Trading Plan Compliance vs Violations</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Membandingkan performa saat Anda disiplin mengikuti SOP trading plan vs saat terjadi pelanggaran emosi (FOMO, balas dendam, moving SL, dll).
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Disciplined trades */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Followed SOP Plan</span>
                  </span>
                  <span className="font-mono text-xs text-emerald-300">
                    {analytics.disciplinedStats.trades} Trades
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Win Rate:</span>
                    <div className="font-mono text-lg font-bold text-emerald-300">
                      {formatPercent(analytics.disciplinedStats.winRate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Return:</span>
                    <div className="font-mono text-lg font-bold text-emerald-400">
                      {formatR(analytics.disciplinedStats.totalR)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Profit Factor:</span>
                    <div className="font-mono text-slate-200">
                      {analytics.disciplinedStats.profitFactor.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg R / Trade:</span>
                    <div className="font-mono text-slate-200">
                      {formatR(analytics.disciplinedStats.averageR)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Violated trades */}
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>Plan Violations</span>
                  </span>
                  <span className="font-mono text-xs text-rose-300">
                    {analytics.violatedStats.trades} Trades
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Win Rate:</span>
                    <div className="font-mono text-lg font-bold text-rose-300">
                      {formatPercent(analytics.violatedStats.winRate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Return:</span>
                    <div className="font-mono text-lg font-bold text-rose-400">
                      {formatR(analytics.violatedStats.totalR)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Profit Factor:</span>
                    <div className="font-mono text-slate-200">
                      {analytics.violatedStats.profitFactor.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg R / Trade:</span>
                    <div className="font-mono text-slate-200">
                      {formatR(analytics.violatedStats.averageR)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact statement */}
            <div className="mt-4 rounded-lg bg-slate-900 p-3 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-400">Impact of Discipline:</span> Selisih return jika tanpa pelanggaran SOP adalah{' '}
                <span className="font-mono font-bold text-emerald-300">
                  {formatR(Math.abs(analytics.violatedStats.totalR))}
                </span>.
              </div>
              <span className="font-mono text-xs text-slate-400">
                Compliance Rate: {analytics.planComplianceRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL BREAKDOWN TABLES */}
      {activeTab === 'setup' && renderBreakdownTable(analytics.setupBreakdown, 'Setup Performance Breakdown', 'Setup Strategy')}
      {activeTab === 'pair' && renderBreakdownTable(analytics.pairBreakdown, 'Pair Performance Breakdown', 'Forex Pair')}
      {activeTab === 'session' && renderBreakdownTable(analytics.sessionBreakdown, 'Session Performance Breakdown', 'Trading Session')}
      {activeTab === 'timeframe' && renderBreakdownTable(analytics.timeframeBreakdown, 'Timeframe Performance Breakdown', 'Chart Timeframe')}
      {activeTab === 'condition' && renderBreakdownTable(analytics.conditionBreakdown, 'Market Condition Breakdown', 'Market State')}
      {activeTab === 'dayOfWeek' && renderBreakdownTable(analytics.dayOfWeekBreakdown, 'Day of Week Performance Breakdown', 'Trading Day')}
    </div>
  );
};
