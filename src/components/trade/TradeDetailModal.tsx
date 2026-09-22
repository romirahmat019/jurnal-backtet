import React, { useState } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Tag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Trade } from '../../types/trade';
import { ResultBadge, DirectionBadge, SessionBadge, ComplianceBadge } from '../common/Badge';
import { formatR, formatCurrency, formatDate } from '../../utils/formatters';
import { formatPrice } from '../../utils/calculations';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !trade) return null;

  const screenshots = trade.screenshots || [];
  const currentImage = screenshots[activeImageIndex] || (trade.screenshotUrl ? { url: trade.screenshotUrl, name: 'Screenshot', type: 'entry' } : null);

  const handleDelete = () => {
    onDelete(trade.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-6 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0c121d] shadow-2xl text-slate-100">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-[#0c121d]/95 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-slate-400">{trade.id}</span>
            <span className="text-base font-bold text-slate-100">{trade.pair}</span>
            <DirectionBadge direction={trade.direction} />
            <ResultBadge result={trade.result} rValue={trade.resultR} />
            <SessionBadge session={trade.session} />
            <ComplianceBadge executedToPlan={trade.executedToPlan} planViolation={trade.planViolation} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(trade)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-6">
          {/* SCREENSHOT VIEWER & GALLERY */}
          {currentImage ? (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-black/60">
              <div className="relative aspect-video w-full flex items-center justify-center bg-black/80">
                <img
                  src={currentImage.url}
                  alt={currentImage.name || 'Setup screenshot'}
                  className="max-h-[500px] w-auto max-w-full object-contain"
                />

                {/* Carousel navigation */}
                {screenshots.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 p-2 text-slate-200 hover:bg-slate-800 backdrop-blur"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 p-2 text-slate-200 hover:bg-slate-800 backdrop-blur"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {screenshots.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto p-3 bg-slate-950/80 border-t border-slate-800">
                  {screenshots.map((img, i) => (
                    <button
                      key={img.id || i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative h-16 w-28 flex-shrink-0 overflow-hidden rounded border transition ${
                        activeImageIndex === i
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-slate-300 py-0.5 text-center font-medium capitalize">
                        {img.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500 text-xs">
              <p>Tidak ada screenshot untuk trade ini.</p>
              <button
                onClick={() => onEdit(trade)}
                className="mt-2 text-emerald-400 hover:underline"
              >
                + Tambah Screenshot
              </button>
            </div>
          )}

          {/* KEY METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Result R</span>
              <span
                className={`font-mono text-xl font-bold ${
                  trade.resultR > 0 ? 'text-emerald-400' : trade.resultR < 0 ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {formatR(trade.resultR)}
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Est. {formatCurrency(trade.profitLoss)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Planned RR</span>
              <span className="font-mono text-xl font-bold text-slate-200">
                1 : {trade.rrPlanned || '-'}
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Actual: {trade.rrActual ? `${trade.rrActual}R` : '-'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Setup Name</span>
              <span className="text-sm font-semibold text-slate-200 truncate block mt-1">
                {trade.setup}
              </span>
              <div className="text-[11px] text-slate-400">{trade.marketCondition}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Execution Quality</span>
              <div className="flex items-center gap-1.5 mt-1">
                {trade.executedToPlan ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span className="text-xs font-semibold text-slate-200">
                  {trade.executedToPlan ? 'Disiplin SOP' : 'Pelanggaran Plan'}
                </span>
              </div>
              {trade.planViolationReason && (
                <div className="text-[10px] text-rose-400 truncate mt-0.5">
                  {trade.planViolationReason}
                </div>
              )}
            </div>
          </div>

          {/* PRICE DATA TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="border-b border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400">
              PRICE LEVELS & RISK
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 p-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Entry Price</span>
                <span className="font-mono text-sm font-semibold text-slate-200">
                  {formatPrice(trade.entry, trade.pair)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Stop Loss</span>
                <span className="font-mono text-sm font-semibold text-rose-400">
                  {formatPrice(trade.stopLoss, trade.pair)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Take Profit</span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  {formatPrice(trade.takeProfit, trade.pair)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Exit Price</span>
                <span className="font-mono text-sm font-semibold text-slate-200">
                  {formatPrice(trade.exit, trade.pair)}
                </span>
              </div>
            </div>
          </div>

          {/* TRADING NOTES DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {trade.entryReason && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Entry Reason</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.entryReason}</p>
              </div>
            )}

            {trade.marketContext && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Market Context</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.marketContext}</p>
              </div>
            )}

            {trade.confirmation && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Confirmation</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.confirmation}</p>
              </div>
            )}

            {trade.mistake && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Mistake</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.mistake}</p>
              </div>
            )}

            {trade.emotion && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Emotion (Psikologi)</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.emotion}</p>
              </div>
            )}

            {trade.lesson && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <span className="text-[10px] uppercase font-bold text-teal-400 block mb-1">Lesson Learned</span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.lesson}</p>
              </div>
            )}
          </div>

          {/* TAGS */}
          {trade.tags && trade.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <Tag className="w-3.5 h-3.5 text-slate-500 mr-1" />
              {trade.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-slate-300 font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* METADATA FOOTER */}
          <div className="flex flex-wrap items-center justify-between border-t border-slate-800 pt-4 text-[11px] text-slate-500">
            <div>
              Date: <span className="text-slate-300">{formatDate(trade.date)} {trade.time}</span> • Timeframe: <span className="text-slate-300">{trade.timeframe}</span>
            </div>
            <div>
              Account: <span className="text-slate-300">{trade.accountId || 'Default'}</span> • Session ID: <span className="text-slate-300 font-mono">{trade.backtestSessionId || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (Section 45) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-sm rounded-xl border border-rose-500/40 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-2">Hapus Transaksi?</h3>
            <p className="text-xs text-slate-400 mb-4">
              "Are you sure you want to delete this trade?" ({trade.id} - {trade.pair})
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-rose-600 px-4 py-1.5 font-bold text-white hover:bg-rose-500"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
