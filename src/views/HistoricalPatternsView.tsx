import React from 'react';
import {
  Sparkles,
  Trophy,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Compass,
  HeartCrack,
  Flame,
} from 'lucide-react';
import { TradeAnalytics, Trade } from '../types/trade';
import { formatR, formatPercent } from '../utils/formatters';

interface HistoricalPatternsViewProps {
  analytics: TradeAnalytics;
  trades: Trade[];
}

export const HistoricalPatternsView: React.FC<HistoricalPatternsViewProps> = ({
  analytics,
  trades,
}) => {
  if (trades.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0c121d] p-8 text-center text-slate-400">
        <Sparkles className="w-10 h-10 text-slate-600 mb-3" />
        <p className="text-sm font-semibold">Belum Ada Pola Historis</p>
        <p className="text-xs text-slate-500 mt-1">Tambahkan data backtest untuk mengekstrak pola setup terbaik dan kesalahan trading Anda.</p>
      </div>
    );
  }

  const highestWinRateSetup = [...(analytics.bySetup || [])].filter(s => s.trades >= 2).sort((a, b) => b.winRate - a.winRate)[0] || analytics.bySetup?.[0];
  const highestTotalRSetup = [...(analytics.bySetup || [])].sort((a, b) => b.totalR - a.totalR)[0];
  const worstSetup = [...(analytics.bySetup || [])].filter(s => s.totalR < 0).sort((a, b) => a.totalR - b.totalR)[0];
  const bestMarketCondition = [...(analytics.byMarketCondition || [])].sort((a, b) => b.totalR - a.totalR)[0];
  const bestPair = [...(analytics.byPair || [])].sort((a, b) => b.totalR - a.totalR)[0];
  const worstPair = [...(analytics.byPair || [])].filter(p => p.totalR < 0).sort((a, b) => a.totalR - b.totalR)[0];
  const bestSession = [...(analytics.bySession || [])].sort((a, b) => b.totalR - a.totalR)[0];
  const topMistakes = analytics.byMistake || [];
  const topLossEmotions = (analytics.byEmotion || []).filter(e => e.totalR < 0 || e.winRate < 50);

  const insightSummary = analytics.descriptiveInsights?.[0] || 'Dataset backtest menunjukkan konsistensi dalam eksekusi trading plan.';

  return (
    <div className="space-y-6">
      {/* 1. AUTO SUMMARY HERO BANNER (Section 19) */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-[#0c121d] p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Historical Pattern Insights</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                Data Backtest
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed font-medium">
              "{insightSummary}"
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE PATTERN CARDS (Section 19) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Best Win Rate Setup */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Win Rate Tertinggi
            </span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100">
            {highestWinRateSetup?.setup || 'N/A'}
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-400">
              {highestWinRateSetup ? formatPercent(highestWinRateSetup.winRate) : '0%'}
            </span>
            <span className="text-xs text-slate-400">
              ({highestWinRateSetup?.trades || 0} trades)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Total Return: {highestWinRateSetup ? formatR(highestWinRateSetup.totalR) : '0R'}
          </div>
        </div>

        {/* Highest Total R Setup */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total R Tertinggi
            </span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-slate-100">
            {highestTotalRSetup?.setup || 'N/A'}
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-400">
              {highestTotalRSetup ? formatR(highestTotalRSetup.totalR) : '0R'}
            </span>
            <span className="text-xs text-slate-400">
              (WR: {highestTotalRSetup ? formatPercent(highestTotalRSetup.winRate) : '0%'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Profit Factor: {highestTotalRSetup?.profitFactor.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Worst / Most Loss Setup */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Setup Paling Buruk
            </span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-base font-bold text-slate-100">
            {worstSetup?.setup || 'Tidak ada'}
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-rose-400">
              {worstSetup ? formatR(worstSetup.totalR) : '0R'}
            </span>
            <span className="text-xs text-slate-400">
              (WR: {worstSetup ? formatPercent(worstSetup.winRate) : '0%'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {worstSetup ? `${worstSetup.losses} kali kalah` : 'Kinerja konsisten'}
          </div>
        </div>

        {/* Best Market Condition */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Kondisi Market Terbaik
            </span>
            <Compass className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-base font-bold text-slate-100">
            {bestMarketCondition?.condition || 'N/A'}
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-400">
              {bestMarketCondition ? formatR(bestMarketCondition.totalR) : '0R'}
            </span>
            <span className="text-xs text-slate-400">
              ({bestMarketCondition ? formatPercent(bestMarketCondition.winRate) : '0%'} WR)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Setup bekerja optimal pada kondisi ini
          </div>
        </div>

        {/* Best Pair vs Worst Pair */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pair Edge Breakdown
            </span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">Best Pair:</span>
              <span className="text-sm font-bold text-emerald-400">{bestPair?.pair || '-'}</span>
              <div className="font-mono text-xs text-slate-300">
                {bestPair ? formatR(bestPair.totalR) : '0R'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Worst Pair:</span>
              <span className="text-sm font-bold text-rose-400">{worstPair?.pair || '-'}</span>
              <div className="font-mono text-xs text-slate-300">
                {worstPair ? formatR(worstPair.totalR) : '0R'}
              </div>
            </div>
          </div>
        </div>

        {/* Best Session */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Session Paling Profit
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-slate-100">
            {bestSession?.session || 'N/A'}
          </div>
          <div className="mt-1 flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-400">
              {bestSession ? formatR(bestSession.totalR) : '0R'}
            </span>
            <span className="text-xs text-slate-400">
              (WR: {bestSession ? formatPercent(bestSession.winRate) : '0%'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Sesi dengan probabilitas eksekusi tertinggi
          </div>
        </div>
      </div>

      {/* 3. MISTAKE & EMOTION FREQUENCY (Section 19) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Mistakes */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Kesalahan Paling Sering Terjadi (Mistakes)
            </h3>
          </div>

          {topMistakes.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Belum ada catatan kesalahan dalam database.
            </p>
          ) : (
            <div className="space-y-2">
              {topMistakes.map((m, idx) => (
                <div
                  key={m.mistake}
                  className="flex items-center justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{m.mistake}</span>
                  </div>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
                    {m.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Emotions Causing Loss */}
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
          <div className="flex items-center gap-2 mb-3">
            <HeartCrack className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Emosi Pemicu Loss Terbanyak (Psychology)
            </h3>
          </div>

          {topLossEmotions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              Belum ada catatan emosi loss dalam database.
            </p>
          ) : (
            <div className="space-y-2">
              {topLossEmotions.map((emo, idx) => (
                <div
                  key={emo.emotion}
                  className="flex items-center justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{emo.emotion}</span>
                  </div>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
                    {emo.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTIONABLE RECOMMENDATIONS (Section 20) */}
      <div className="rounded-xl border border-emerald-500/20 bg-[#0f172a]/90 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">
            Rekomendasi Sistem Berdasarkan Data Historis
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">1. Fokus Pada Edge Terbaik:</span>
            <p className="text-slate-300 leading-relaxed">
              Utamakan eksekusi setup <strong className="text-white">{highestTotalRSetup?.setup || 'utama'}</strong> pada sesi{' '}
              <strong className="text-white">{bestSession?.session || 'terbaik'}</strong> di kondisi market{' '}
              <strong className="text-white">{bestMarketCondition?.condition || 'trending'}</strong>.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="font-bold text-rose-400 block mb-1">2. Eliminasi Kebocoran R:</span>
            <p className="text-slate-300 leading-relaxed">
              {worstSetup ? (
                <>
                  Hentikan atau evaluasi ulang setup <strong className="text-white">{worstSetup.setup}</strong> karena menghasilkan negatif {formatR(worstSetup.totalR)}.
                </>
              ) : (
                'Pertahankan konsistensi eksekusi saat ini.'
              )}
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">3. Jaga Disiplin SOP:</span>
            <p className="text-slate-300 leading-relaxed">
              Pelanggaran trading plan memotong hingga {formatR(Math.abs(analytics.planViolationTotalR || 0))} dari return total Anda. Disiplin adalah pembeda utama.
            </p>
          </div>

          <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">4. Manajemen Risiko R-Multiple:</span>
            <p className="text-slate-300 leading-relaxed">
              Risk per trade Anda adalah 1R. Dengan Expectancy {formatR(analytics.expectancyR)} per trade, fokus pada volume sampel berkualitas tinggi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
