import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  hint?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  hint,
}) => {
  const trendColor =
    trend === 'positive'
      ? 'text-emerald-400'
      : trend === 'negative'
      ? 'text-rose-400'
      : 'text-slate-200';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4 transition-all hover:border-slate-700">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className={`font-mono text-2xl font-bold tracking-tight ${trendColor}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-400 font-medium">
            {subValue}
          </span>
        )}
      </div>

      {hint && (
        <div className="mt-1 text-[11px] text-slate-500">
          {hint}
        </div>
      )}
    </div>
  );
};
