import React from 'react';
import { TradeResult, TradeDirection, TradingSession } from '../../types/trade';

export const ResultBadge: React.FC<{ result: TradeResult; rValue?: number }> = ({ result, rValue }) => {
  if (result === 'WIN') {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        WIN {rValue !== undefined ? `(+${rValue}R)` : ''}
      </span>
    );
  }
  if (result === 'LOSS') {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
        LOSS {rValue !== undefined ? `(${rValue}R)` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
      BE {rValue !== undefined ? `(${rValue}R)` : ''}
    </span>
  );
};

export const DirectionBadge: React.FC<{ direction: TradeDirection }> = ({ direction }) => {
  if (direction === 'BUY') {
    return (
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
        BUY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/60">
      SELL
    </span>
  );
};

export const SessionBadge: React.FC<{ session: TradingSession }> = ({ session }) => {
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {session}
    </span>
  );
};

export const ComplianceBadge: React.FC<{ executedToPlan: boolean; planViolation?: boolean }> = ({
  executedToPlan,
  planViolation,
}) => {
  if (planViolation || !executedToPlan) {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
        Violation
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
      Followed Plan
    </span>
  );
};
