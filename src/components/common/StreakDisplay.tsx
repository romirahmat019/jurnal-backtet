import React from 'react';
import { Flame, ShieldAlert, Award, TrendingDown } from 'lucide-react';

interface StreakDisplayProps {
  maxWinningStreak: number;
  maxLosingStreak: number;
  currentStreak: { type: 'WIN' | 'LOSS' | 'BE' | 'NONE'; count: number };
  avgWinningStreak: number;
  avgLosingStreak: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  maxWinningStreak,
  maxLosingStreak,
  currentStreak,
  avgWinningStreak,
  avgLosingStreak,
}) => {
  const currentStreakColor =
    currentStreak.type === 'WIN'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : currentStreak.type === 'LOSS'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      : 'text-slate-400 bg-slate-800/40 border-slate-700/40';

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Streak Analysis</h3>
        <div className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border ${currentStreakColor}`}>
          <Flame className="w-3.5 h-3.5" />
          <span>Current Streak: {currentStreak.count} {currentStreak.type}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Max Win Streak</span>
          </div>
          <div className="font-mono text-xl font-bold text-emerald-400">
            {maxWinningStreak} <span className="text-xs font-normal text-slate-500">trades</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Avg Win Streak: {avgWinningStreak}</div>
        </div>

        <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Max Loss Streak</span>
          </div>
          <div className="font-mono text-xl font-bold text-rose-400">
            {maxLosingStreak} <span className="text-xs font-normal text-slate-500">trades</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Avg Loss Streak: {avgLosingStreak}</div>
        </div>

        <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Avg Win Run</span>
          </div>
          <div className="font-mono text-xl font-bold text-slate-200">
            {avgWinningStreak}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Rata-rata beruntun menang</div>
        </div>

        <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Avg Loss Run</span>
          </div>
          <div className="font-mono text-xl font-bold text-slate-200">
            {avgLosingStreak}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Rata-rata beruntun kalah</div>
        </div>
      </div>
    </div>
  );
};
