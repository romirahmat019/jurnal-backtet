import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { Trade } from '../types/trade';
import { ResultBadge, DirectionBadge } from '../components/common/Badge';
import { formatR, formatDate } from '../utils/formatters';

interface CalendarViewProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ trades, onSelectTrade }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Map trades by date string YYYY-MM-DD
  const tradesByDate: Record<string, Trade[]> = {};
  trades.forEach((t) => {
    if (!tradesByDate[t.date]) {
      tradesByDate[t.date] = [];
    }
    tradesByDate[t.date].push(t);
  });

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayKey(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayKey(null);
  };

  const selectedDayTrades = selectedDayKey ? tradesByDate[selectedDayKey] || [] : [];

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-5 shadow-lg">
        {/* Header navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              {monthNames[month]} {year}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 font-medium"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"
              title="Bulan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Days of week header */}
          {daysOfWeek.map((day, i) => (
            <div
              key={day}
              className={`py-2 text-center text-xs font-semibold uppercase ${
                i === 0 || i === 6 ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}

          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[85px] rounded-lg border border-slate-800/40 bg-slate-950/20 p-2 opacity-30"
            />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTrades = tradesByDate[dateStr] || [];
            const hasTrades = dayTrades.length > 0;
            const totalR = dayTrades.reduce((acc, t) => acc + t.resultR, 0);
            const isSelected = selectedDayKey === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayKey(hasTrades ? dateStr : null)}
                className={`min-h-[85px] rounded-xl border p-2 flex flex-col justify-between transition ${
                  hasTrades ? 'cursor-pointer hover:border-slate-600' : 'opacity-60'
                } ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-800/90'
                    : hasTrades
                    ? 'border-slate-800 bg-slate-900/80'
                    : 'border-slate-800/40 bg-slate-950/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      hasTrades ? 'text-slate-100' : 'text-slate-500'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasTrades && (
                    <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
                      {dayTrades.length}T
                    </span>
                  )}
                </div>

                {hasTrades && (
                  <div className="mt-1">
                    <span
                      className={`block font-mono text-xs font-bold ${
                        totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatR(totalR)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Trades Details (Section 41) */}
      {selectedDayKey && (
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Transaksi Pada Tanggal: {formatDate(selectedDayKey)}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedDayTrades.length} transaksi • Total:{' '}
                <span
                  className={`font-mono font-bold ${
                    selectedDayTrades.reduce((acc, t) => acc + t.resultR, 0) >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {formatR(selectedDayTrades.reduce((acc, t) => acc + t.resultR, 0))}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedDayKey(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Tutup Panel
            </button>
          </div>

          <div className="space-y-2">
            {selectedDayTrades.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTrade(t)}
                className="flex items-center justify-between rounded-lg bg-slate-900/80 p-3 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">{t.time}</span>
                  <span className="font-bold text-xs text-slate-100">{t.pair}</span>
                  <DirectionBadge direction={t.direction} />
                  <span className="text-xs text-slate-300">{t.setup}</span>
                  <span className="text-[11px] text-slate-500">({t.session})</span>
                </div>

                <div className="flex items-center gap-3">
                  <ResultBadge result={t.result} />
                  <span
                    className={`font-mono text-xs font-bold ${
                      t.resultR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatR(t.resultR)}
                  </span>
                  <Eye className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
