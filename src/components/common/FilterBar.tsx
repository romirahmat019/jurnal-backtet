import React, { useState } from 'react';
import { Filter, Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { TradeFilter, AppSettings } from '../../types/trade';

interface FilterBarProps {
  filter: TradeFilter;
  onChangeFilter: (newFilter: TradeFilter) => void;
  settings: AppSettings;
  availableSetups: string[];
  availablePairs: string[];
  availableTags: string[];
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  settings,
  availableSetups,
  availablePairs,
  availableTags,
  filteredCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const periods: { id: TradeFilter['period']; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_7', label: 'Last 7D' },
    { id: 'last_30', label: 'Last 30D' },
    { id: 'last_90', label: 'Last 90D' },
    { id: 'custom', label: 'Custom' },
  ];

  const handlePeriodChange = (p: TradeFilter['period']) => {
    onChangeFilter({ ...filter, period: p });
  };

  const handleReset = () => {
    onChangeFilter({
      period: 'all',
      dateFrom: '',
      dateTo: '',
      pair: '',
      setup: '',
      session: '',
      timeframe: '',
      direction: '',
      result: '',
      marketCondition: '',
      tag: '',
      searchQuery: '',
      onlyViolations: false,
      onlyCompliant: false,
    });
  };

  const hasActiveFilters =
    filter.period !== 'all' ||
    Boolean(filter.pair) ||
    Boolean(filter.setup) ||
    Boolean(filter.session) ||
    Boolean(filter.timeframe) ||
    Boolean(filter.direction) ||
    Boolean(filter.result) ||
    Boolean(filter.marketCondition) ||
    Boolean(filter.tag) ||
    Boolean(filter.searchQuery) ||
    Boolean(filter.onlyViolations) ||
    Boolean(filter.onlyCompliant);

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-3 sm:p-4 shadow-sm mb-5">
      {/* Top row: Period tabs + Search + Expand toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Period Selector Tabs (Section 26) */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-900/80 p-1 border border-slate-800/80">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                (filter.period || 'all') === p.id
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Expand/Reset Controls */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari pair, setup, tag, notes..."
              value={filter.searchQuery || ''}
              onChange={(e) => onChangeFilter({ ...filter, searchQuery: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              isExpanded
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker if Custom selected */}
      {filter.period === 'custom' && (
        <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Date From:</span>
            <input
              type="date"
              value={filter.dateFrom || ''}
              onChange={(e) => onChangeFilter({ ...filter, dateFrom: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Date To:</span>
            <input
              type="date"
              value={filter.dateTo || ''}
              onChange={(e) => onChangeFilter({ ...filter, dateTo: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Expanded Multi-Filter Row */}
      {isExpanded && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-800/60 text-xs">
          {/* Pair */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Pair</label>
            <select
              value={filter.pair || ''}
              onChange={(e) => onChangeFilter({ ...filter, pair: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Pairs</option>
              {availablePairs.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Setup */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Setup</label>
            <select
              value={filter.setup || ''}
              onChange={(e) => onChangeFilter({ ...filter, setup: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Setups</option>
              {availableSetups.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Session</label>
            <select
              value={filter.session || ''}
              onChange={(e) => onChangeFilter({ ...filter, session: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Sessions</option>
              <option value="ASIA">ASIA</option>
              <option value="LONDON">LONDON</option>
              <option value="NEW YORK">NEW YORK</option>
              <option value="LONDON + NEW YORK">LONDON + NEW YORK</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Timeframe</label>
            <select
              value={filter.timeframe || ''}
              onChange={(e) => onChangeFilter({ ...filter, timeframe: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Timeframes</option>
              <option value="M1">M1</option>
              <option value="M5">M5</option>
              <option value="M15">M15</option>
              <option value="M30">M30</option>
              <option value="H1">H1</option>
              <option value="H4">H4</option>
              <option value="D1">D1</option>
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Direction</label>
            <select
              value={filter.direction || ''}
              onChange={(e) => onChangeFilter({ ...filter, direction: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All (BUY & SELL)</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
            </select>
          </div>

          {/* Result */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Result</label>
            <select
              value={filter.result || ''}
              onChange={(e) => onChangeFilter({ ...filter, result: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Results</option>
              <option value="WIN">WIN Only</option>
              <option value="LOSS">LOSS Only</option>
              <option value="BE">BE Only</option>
            </select>
          </div>

          {/* Market Condition */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Market Condition</label>
            <select
              value={filter.marketCondition || ''}
              onChange={(e) => onChangeFilter({ ...filter, marketCondition: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Conditions</option>
              <option value="TRENDING">TRENDING</option>
              <option value="RANGING">RANGING</option>
              <option value="CHOPPY">CHOPPY</option>
              <option value="HIGH VOLATILITY">HIGH VOLATILITY</option>
              <option value="LOW VOLATILITY">LOW VOLATILITY</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Tags</label>
            <select
              value={filter.tag || ''}
              onChange={(e) => onChangeFilter({ ...filter, tag: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Plan Violation Checkbox */}
          <div className="flex items-end pb-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={filter.onlyViolations || false}
                onChange={(e) =>
                  onChangeFilter({
                    ...filter,
                    onlyViolations: e.target.checked,
                    onlyCompliant: e.target.checked ? false : filter.onlyCompliant,
                  })
                }
                className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-xs text-rose-400">Plan Violations</span>
            </label>
          </div>

          {/* Plan Compliant Checkbox */}
          <div className="flex items-end pb-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={filter.onlyCompliant || false}
                onChange={(e) =>
                  onChangeFilter({
                    ...filter,
                    onlyCompliant: e.target.checked,
                    onlyViolations: e.target.checked ? false : filter.onlyViolations,
                  })
                }
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xs text-emerald-400">Followed Plan</span>
            </label>
          </div>
        </div>
      )}

      {/* Filter summary status */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Menampilkan {filteredCount} dari {totalCount} transaksi</span>
        {hasActiveFilters && (
          <span className="text-emerald-400 font-sans font-medium">Filter aktif diterapkan</span>
        )}
      </div>
    </div>
  );
};
