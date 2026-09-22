import React, { useState } from 'react';
import {
  ArrowUpDown,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Trade } from '../../types/trade';
import { ResultBadge, DirectionBadge, SessionBadge } from '../common/Badge';
import { formatR, formatDate } from '../../utils/formatters';
import { formatPrice } from '../../utils/calculations';

interface TradeTableProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
}

type SortField = 'date' | 'pair' | 'setup' | 'direction' | 'resultR' | 'rrPlanned';
type SortOrder = 'asc' | 'desc';

export const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  onSelectTrade,
  onEditTrade,
  onDeleteTrade,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      const dateA = `${a.date} ${a.time || ''}`;
      const dateB = `${b.date} ${b.time || ''}`;
      comparison = dateA.localeCompare(dateB);
    } else if (sortField === 'pair') {
      comparison = a.pair.localeCompare(b.pair);
    } else if (sortField === 'setup') {
      comparison = a.setup.localeCompare(b.setup);
    } else if (sortField === 'direction') {
      comparison = a.direction.localeCompare(b.direction);
    } else if (sortField === 'resultR') {
      comparison = a.resultR - b.resultR;
    } else if (sortField === 'rrPlanned') {
      comparison = (a.rrPlanned || 0) - (b.rrPlanned || 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedTrades.length / pageSize) || 1;
  const paginatedTrades = sortedTrades.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0f172a]/60 p-12 text-center text-slate-400">
        <p className="text-sm font-semibold">Tidak ada transaksi yang cocok dengan filter.</p>
        <p className="text-xs text-slate-500 mt-1">Coba sesuaikan filter atau tambahkan transaksi baru.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a]/80 shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-[#0a0e17] text-[11px] font-semibold uppercase text-slate-400">
            <tr>
              <th className="py-3 px-3">Thumb</th>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Date & Time</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('pair')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Pair</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('direction')}
                className="py-3 px-2 cursor-pointer hover:text-slate-200"
              >
                <span>Dir</span>
              </th>
              <th
                onClick={() => handleSort('setup')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Setup</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Session / TF</th>
              <th className="py-3 px-3 font-mono">Entry</th>
              <th className="py-3 px-3 font-mono">SL / TP</th>
              <th className="py-3 px-3 font-mono">Exit</th>
              <th
                onClick={() => handleSort('rrPlanned')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200"
              >
                <span>RR Plan</span>
              </th>
              <th
                onClick={() => handleSort('resultR')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Result (R)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {paginatedTrades.map((t) => {
              const thumbUrl = t.screenshots?.[0]?.url || t.screenshotUrl;
              const isProfit = t.resultR > 0;
              const isLoss = t.resultR < 0;

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTrade(t)}
                  className="group cursor-pointer transition-colors hover:bg-slate-800/50"
                >
                  {/* Thumbnail */}
                  <td className="py-2.5 px-3">
                    {thumbUrl ? (
                      <div className="h-9 w-12 overflow-hidden rounded border border-slate-700 bg-slate-900">
                        <img
                          src={thumbUrl}
                          alt="Chart"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-12 items-center justify-center rounded border border-slate-800 bg-slate-900/50 text-slate-600">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-200">{formatDate(t.date)}</div>
                    <div className="font-mono text-[10px] text-slate-500">{t.time || '-'}</div>
                  </td>

                  {/* Pair */}
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-slate-100">{t.pair}</span>
                  </td>

                  {/* Direction */}
                  <td className="py-2.5 px-2">
                    <DirectionBadge direction={t.direction} />
                  </td>

                  {/* Setup */}
                  <td className="py-2.5 px-3">
                    <div className="max-w-[150px] truncate font-medium text-slate-300">
                      {t.setup}
                    </div>
                    {t.planViolation && (
                      <span className="text-[10px] text-rose-400 font-semibold">Violation</span>
                    )}
                  </td>

                  {/* Session & TF */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                        {t.session}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{t.timeframe}</span>
                    </div>
                  </td>

                  {/* Entry */}
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {formatPrice(t.entry, t.pair)}
                  </td>

                  {/* SL / TP */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    <div className="text-rose-400">{formatPrice(t.stopLoss, t.pair)}</div>
                    <div className="text-emerald-400">{formatPrice(t.takeProfit, t.pair)}</div>
                  </td>

                  {/* Exit */}
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {formatPrice(t.exit, t.pair)}
                  </td>

                  {/* Planned RR */}
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    1:{t.rrPlanned || '-'}
                  </td>

                  {/* Result & R */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <ResultBadge result={t.result} />
                      <span
                        className={`font-mono font-bold ${
                          isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {formatR(t.resultR)}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectTrade(t)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        title="Lihat Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditTrade(t)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-emerald-300"
                        title="Edit Trade"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTrade(t.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-900/40 hover:text-rose-300"
                        title="Hapus Trade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 bg-[#0a0e17] px-4 py-3 text-xs text-slate-400">
        <div>
          Halaman <span className="font-semibold text-slate-200">{currentPage}</span> dari{' '}
          <span className="font-semibold text-slate-200">{totalPages}</span> ({sortedTrades.length} Total Trades)
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
