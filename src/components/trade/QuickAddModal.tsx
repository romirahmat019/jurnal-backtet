import React, { useState } from 'react';
import { X, Zap, Save } from 'lucide-react';
import { Trade, TradeDirection, TradeResult, AppSettings, TradeScreenshot } from '../../types/trade';
import { ScreenshotUploader } from './ScreenshotUploader';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  settings: AppSettings;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  settings,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [pair, setPair] = useState<string>(settings.defaultPair || 'XAUUSD');
  const [direction, setDirection] = useState<TradeDirection>('BUY');
  const [setup, setSetup] = useState<string>(settings.defaultSetup || 'EMA 9/21 Pullback');
  const [result, setResult] = useState<TradeResult>('WIN');
  const [resultR, setResultR] = useState<string>('2.0');
  const [notes, setNotes] = useState<string>('');
  const [screenshots, setScreenshots] = useState<TradeScreenshot[]>([]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rVal = parseFloat(resultR) || (result === 'WIN' ? 2 : result === 'LOSS' ? -1 : 0);
    const riskAmount = (settings.accountSize * settings.riskPercent) / 100;
    const profitLoss = Number((rVal * riskAmount).toFixed(2));

    const newTrade: Trade = {
      id: `TRD-${Date.now().toString().slice(-6)}`,
      date,
      time: '12:00',
      pair: pair.toUpperCase().trim(),
      direction,
      timeframe: settings.defaultTimeframe || 'M15',
      session: settings.defaultSession || 'LONDON',
      setup,
      marketCondition: 'TRENDING',
      entry: 0,
      stopLoss: 0,
      takeProfit: 0,
      exit: 0,
      riskPercent: settings.riskPercent,
      riskAmount,
      rrPlanned: Math.abs(rVal) || 2,
      rrActual: rVal,
      result,
      resultR: rVal,
      profitLoss,
      screenshotUrl: screenshots.length > 0 ? screenshots[0].url : '',
      screenshots,
      entryReason: notes,
      marketContext: '',
      confirmation: '',
      mistake: '',
      emotion: '',
      lesson: '',
      tags: ['#quickadd'],
      executedToPlan: true,
      planViolation: false,
      accountId: settings.activeAccount || 'Backtest Account',
      createdAt: new Date().toISOString(),
    };

    onSave(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-[#0c121d] p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Quick Add Backtest</h2>
              <p className="text-[11px] text-slate-500">Pencatatan kilat untuk sesi backtesting cepat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Pair</label>
              <input
                type="text"
                required
                value={pair}
                onChange={(e) => setPair(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 uppercase font-mono font-bold text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Direction</label>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-700 bg-slate-900 p-0.5">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`rounded py-1 text-xs font-bold transition ${
                    direction === 'BUY' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`rounded py-1 text-xs font-bold transition ${
                    direction === 'SELL' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Setup</label>
              <select
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                {settings.savedSetups.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Result</label>
              <select
                value={result}
                onChange={(e) => {
                  const res = e.target.value as TradeResult;
                  setResult(res);
                  if (res === 'WIN' && parseFloat(resultR) <= 0) setResultR('2.0');
                  if (res === 'LOSS') setResultR('-1.0');
                  if (res === 'BE') setResultR('0.0');
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
                <option value="BE">BE</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Result R (e.g. +2, -1)</label>
              <input
                type="number"
                step="0.05"
                required
                value={resultR}
                onChange={(e) => setResultR(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 font-mono font-bold text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Quick Screenshot</label>
            <ScreenshotUploader
              screenshots={screenshots}
              onChange={setScreenshots}
              tradeId={`${pair}_${date}`}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Quick Notes</label>
            <textarea
              rows={2}
              placeholder="Catatan setup / alasan singkat..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-500 shadow-md transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Cepat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
