import React, { useState } from 'react';
import { BookOpenCheck, Save, Calendar, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';
import { Trade, TradeAnalytics } from '../types/trade';
import { formatR, formatPercent, formatDate } from '../utils/formatters';

interface ReviewsViewProps {
  trades: Trade[];
  analytics: TradeAnalytics;
  onSelectTrade: (trade: Trade) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ trades, analytics, onSelectTrade }) => {
  const [reviewType, setReviewType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [followedPlanRating, setFollowedPlanRating] = useState<'yes' | 'mostly' | 'no'>('yes');
  const [mainMistakeNotes, setMainMistakeNotes] = useState('');
  const [improvementAction, setImprovementAction] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Best & Worst trade
  const sortedByR = [...trades].sort((a, b) => b.resultR - a.resultR);
  const bestTrade = sortedByR.length > 0 ? sortedByR[0] : null;
  const worstTrade = sortedByR.length > 0 ? sortedByR[sortedByR.length - 1] : null;

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const reviewData = {
      date: new Date().toISOString(),
      reviewType,
      followedPlanRating,
      mainMistakeNotes,
      improvementAction,
    };
    try {
      const existing = JSON.parse(localStorage.getItem('fx_backtest_reviews') || '[]');
      localStorage.setItem('fx_backtest_reviews', JSON.stringify([...existing, reviewData]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Selector */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-emerald-400" />
            <span>Periodic Trading Performance Review</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Refleksi disiplin SOP, evaluasi performa, dan rencana perbaikan berkelanjutan.
          </p>
        </div>

        <div className="flex gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800">
          {(['daily', 'weekly', 'monthly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setReviewType(type)}
              className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                reviewType === type
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot Statistics for Period */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Sample</span>
          <span className="font-mono text-2xl font-bold text-slate-100">{trades.length}</span>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {analytics.wins}W / {analytics.losses}L / {analytics.breakEvens}BE
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Win Rate</span>
          <span className="font-mono text-2xl font-bold text-emerald-400">
            {formatPercent(analytics.winRate)}
          </span>
          <div className="text-xs text-slate-400 mt-1">PF: {analytics.profitFactor.toFixed(2)}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Return</span>
          <span
            className={`font-mono text-2xl font-bold ${
              analytics.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatR(analytics.totalR)}
          </span>
          <div className="text-xs text-slate-400 mt-1">Expectancy: {formatR(analytics.expectancyR)}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Plan Compliance</span>
          <span className="font-mono text-2xl font-bold text-emerald-300">
            {analytics.planComplianceRate.toFixed(1)}%
          </span>
          <div className="text-xs text-slate-400 mt-1">
            {analytics.planViolationsCount} Pelanggaran
          </div>
        </div>
      </div>

      {/* Best & Worst Trades Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bestTrade && (
          <div
            onClick={() => onSelectTrade(bestTrade)}
            className="cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 hover:border-emerald-500/60 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Trophy className="w-4 h-4" />
                <span>Best Trade of Period</span>
              </span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                +{bestTrade.resultR}R
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-100">{bestTrade.pair} ({bestTrade.direction})</div>
            <div className="text-xs text-slate-400 mt-0.5">{bestTrade.setup} • {formatDate(bestTrade.date)}</div>
            {bestTrade.entryReason && (
              <p className="text-xs text-slate-300 mt-2 line-clamp-2 italic">"{bestTrade.entryReason}"</p>
            )}
          </div>
        )}

        {worstTrade && (
          <div
            onClick={() => onSelectTrade(worstTrade)}
            className="cursor-pointer rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 hover:border-rose-500/60 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Worst Trade of Period</span>
              </span>
              <span className="font-mono text-sm font-bold text-rose-400">
                {worstTrade.resultR}R
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-100">{worstTrade.pair} ({worstTrade.direction})</div>
            <div className="text-xs text-slate-400 mt-0.5">{worstTrade.setup} • {formatDate(worstTrade.date)}</div>
            {worstTrade.mistake && (
              <p className="text-xs text-rose-300 mt-2 line-clamp-2 italic">Mistake: "{worstTrade.mistake}"</p>
            )}
          </div>
        )}
      </div>

      {/* Reflection Form */}
      <form onSubmit={handleSaveReview} className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Refleksi Kualitatif Trader</h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            1. Apakah saya mengikuti trading plan (SOP) dengan 100% disiplin?
          </label>
          <div className="flex gap-2">
            {[
              { id: 'yes', label: 'Ya, Sangat Disiplin' },
              { id: 'mostly', label: 'Sebagian Besar Mengikuti' },
              { id: 'no', label: 'Banyak Pelanggaran Emosional' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFollowedPlanRating(opt.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                  followedPlanRating === opt.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            2. Apa kesalahan utama yang terjadi pada periode ini?
          </label>
          <textarea
            rows={3}
            placeholder="Contoh: Terlalu cepat cut profit, entry tanpa konfirmasi candlestick di M15, atau overtrading saat sesi London..."
            value={mainMistakeNotes}
            onChange={(e) => setMainMistakeNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            3. Tindakan konkrit apa yang perlu diperbaiki pada sesi berikutnya?
          </label>
          <textarea
            rows={3}
            placeholder="Contoh: Hanya akan entry jika RR minimal 1:2 dan tunggu candle retest terbentuk sempurna..."
            value={improvementAction}
            onChange={(e) => setImprovementAction(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Review berhasil disimpan!</span>
            </span>
          )}
          <div className="flex-1" />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Evaluasi Review</span>
          </button>
        </div>
      </form>
    </div>
  );
};
