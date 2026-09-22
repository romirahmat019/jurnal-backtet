import React, { useState } from 'react';
import {
  Image as ImageIcon,
  ExternalLink,
  X,
  Filter,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { Trade, TradeScreenshot } from '../types/trade';
import { ResultBadge, DirectionBadge } from '../components/common/Badge';
import { formatR, formatDate } from '../utils/formatters';

interface GalleryViewProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
}

interface GalleryItem {
  screenshot: TradeScreenshot;
  trade: Trade;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ trades, onSelectTrade }) => {
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [selectedSetup, setSelectedSetup] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  // Extract all screenshots flattened with parent trade
  const allItems: GalleryItem[] = [];
  trades.forEach((t) => {
    if (t.screenshots && t.screenshots.length > 0) {
      t.screenshots.forEach((sc: TradeScreenshot) => {
        allItems.push({ screenshot: sc, trade: t });
      });
    } else if (t.screenshotUrl) {
      allItems.push({
        screenshot: { id: `sc-${t.id}`, name: t.id, url: t.screenshotUrl, type: 'entry' },
        trade: t,
      });
    }
  });

  const availablePairs = Array.from(new Set(trades.map((t) => t.pair)));
  const availableSetups = Array.from(new Set(trades.map((t) => t.setup)));

  // Filter items
  const filteredItems = allItems.filter(({ screenshot, trade }) => {
    if (selectedPair && trade.pair !== selectedPair) return false;
    if (selectedSetup && trade.setup !== selectedSetup) return false;
    if (selectedResult && trade.result !== selectedResult) return false;
    if (selectedType && screenshot.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mr-1">
            Filter Gallery:
          </span>

          {/* Pair Filter */}
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Pairs</option>
            {availablePairs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Setup Filter */}
          <select
            value={selectedSetup}
            onChange={(e) => setSelectedSetup(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Setups</option>
            {availableSetups.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Result Filter */}
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Results</option>
            <option value="WIN">WIN Only</option>
            <option value="LOSS">LOSS Only</option>
            <option value="BE">BE Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Image Stages</option>
            <option value="before">Before Entry</option>
            <option value="entry">Entry</option>
            <option value="after">After Result</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="font-mono text-xs text-slate-500">
          {filteredItems.length} Screenshots
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0f172a]/60 p-8 text-center text-slate-400">
          <ImageIcon className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-sm font-semibold">Tidak ada screenshot yang ditemukan.</p>
          <p className="text-xs text-slate-500 mt-1">Upload screenshot saat mencatat trade baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(({ screenshot, trade }) => (
            <div
              key={screenshot.id}
              onClick={() => setActiveItem({ screenshot, trade })}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] shadow-md transition hover:border-slate-700 hover:shadow-xl"
            >
              {/* Image box */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                <img
                  src={screenshot.url}
                  alt={screenshot.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                  <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-300 backdrop-blur">
                    {screenshot.type}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <ResultBadge result={trade.result} />
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-100">{trade.pair}</span>
                    <DirectionBadge direction={trade.direction} />
                  </div>
                  <span
                    className={`font-mono text-xs font-bold ${
                      trade.resultR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatR(trade.resultR)}
                  </span>
                </div>

                <div className="mt-1 truncate text-xs text-slate-400 font-medium">
                  {trade.setup}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{formatDate(trade.date)}</span>
                  <span>{trade.timeframe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-h-[95vh] max-w-5xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0c121d] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-slate-400">{activeItem.trade.id}</span>
                <span className="font-bold text-sm text-slate-100">{activeItem.trade.pair}</span>
                <DirectionBadge direction={activeItem.trade.direction} />
                <ResultBadge result={activeItem.trade.result} rValue={activeItem.trade.resultR} />
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                  {activeItem.screenshot.type}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const t = activeItem.trade;
                    setActiveItem(null);
                    onSelectTrade(t);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Trade Detail</span>
                </button>
                <button
                  onClick={() => setActiveItem(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img
                src={activeItem.screenshot.url}
                alt={activeItem.screenshot.name}
                className="max-h-[68vh] w-auto object-contain rounded"
              />
            </div>

            {/* Notes footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <div>
                Setup: <strong className="text-slate-200">{activeItem.trade.setup}</strong> • Session:{' '}
                <span className="text-slate-200">{activeItem.trade.session}</span>
              </div>
              <div className="font-mono">{formatDate(activeItem.trade.date)} {activeItem.trade.time}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
