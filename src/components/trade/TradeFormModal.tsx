import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  AlertCircle,
  Plus,
  Sliders,
  FolderKanban,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import {
  Trade,
  TradeDirection,
  TradeResult,
  TradingSession,
  Timeframe,
  MarketCondition,
  TradeScreenshot,
  AppSettings,
  BacktestProject,
  CustomColumnDefinition,
} from '../../types/trade';
import { ScreenshotUploader } from './ScreenshotUploader';

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  initialTrade?: Trade | null;
  settings: AppSettings;
  projects: BacktestProject[];
  activeProjectId: string;
  onSelectProject?: (projectId: string) => void;
  onOpenCreateProject?: () => void;
  onSaveProject?: (project: BacktestProject) => void;
}

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTrade,
  settings,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenCreateProject,
  onSaveProject,
}) => {
  // Selected Project
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId);

  // Default Form Fields
  const [date, setDate] = useState<string>('');
  const [pair, setPair] = useState<string>('XAUUSD');
  const [direction, setDirection] = useState<TradeDirection>('BUY');
  const [result, setResult] = useState<TradeResult>('WIN');
  const [resultR, setResultR] = useState<string>('2.0');
  const [session, setSession] = useState<TradingSession>('LONDON');
  const [timeframe, setTimeframe] = useState<Timeframe>('M15');
  const [notes, setNotes] = useState<string>('');

  // Dynamic Custom Values (key-value mapping of customColumn.id -> value)
  const [customValues, setCustomValues] = useState<Record<string, any>>({});

  // Inline Custom Column Adder
  const [isAddingColInline, setIsAddingColInline] = useState<boolean>(false);
  const [newInlineColName, setNewInlineColName] = useState<string>('');
  const [newInlineColType, setNewInlineColType] = useState<'text' | 'select' | 'number'>('select');
  const [newInlineColOptions, setNewInlineColOptions] = useState<string>('Uptrend, Downtrend, Sideways');

  // Optional Advanced Details
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [riskAmount, setRiskAmount] = useState<number>(3.0);
  const [marketCondition, setMarketCondition] = useState<MarketCondition>('TRENDING');
  const [executedToPlan, setExecutedToPlan] = useState<boolean>(true);
  const [screenshots, setScreenshots] = useState<TradeScreenshot[]>([]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine current active project object
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  // Initialize or populate form
  useEffect(() => {
    if (initialTrade) {
      setSelectedProjectId(initialTrade.projectId || activeProjectId || (projects[0]?.id ?? ''));
      setDate(initialTrade.date || new Date().toISOString().slice(0, 10));
      setPair(initialTrade.pair || 'XAUUSD');
      setDirection(initialTrade.direction || 'BUY');
      setResult(initialTrade.result || 'WIN');
      setResultR(initialTrade.resultR !== undefined ? initialTrade.resultR.toString() : '2.0');
      setSession(initialTrade.session || 'LONDON');
      setTimeframe(initialTrade.timeframe || 'M15');
      setNotes(initialTrade.notes || initialTrade.entryReason || '');
      setCustomValues(initialTrade.customValues || {});

      // Advanced details
      setEntryPrice(initialTrade.entry ? initialTrade.entry.toString() : '');
      setStopLoss(initialTrade.stopLoss ? initialTrade.stopLoss.toString() : '');
      setTakeProfit(initialTrade.takeProfit ? initialTrade.takeProfit.toString() : '');
      setExitPrice(initialTrade.exit ? initialTrade.exit.toString() : '');
      setRiskPercent(initialTrade.riskPercent || settings.riskPercent || 1.0);
      setRiskAmount(initialTrade.riskAmount || 3.0);
      setMarketCondition(initialTrade.marketCondition || 'TRENDING');
      setExecutedToPlan(initialTrade.executedToPlan ?? true);
      setScreenshots(initialTrade.screenshots || []);
      setShowAdvanced(Boolean(initialTrade.entry || initialTrade.screenshots?.length));
    } else {
      const now = new Date();
      setDate(now.toISOString().slice(0, 10));
      const targetProj = projects.find((p) => p.id === activeProjectId) || projects[0];
      setSelectedProjectId(targetProj?.id || '');
      setPair(targetProj?.defaultPair || settings.defaultPair || 'XAUUSD');
      setSession(targetProj?.defaultSession || settings.defaultSession || 'LONDON');
      setTimeframe(targetProj?.defaultTimeframe || settings.defaultTimeframe || 'M15');
      setDirection('BUY');
      setResult('WIN');
      setResultR('2.0');
      setNotes('');

      // Seed default custom values based on project columns
      const initVals: Record<string, any> = {};
      if (targetProj?.customColumns) {
        targetProj.customColumns.forEach((c) => {
          if (c.type === 'select' && c.options && c.options.length > 0) {
            initVals[c.id] = c.options[0];
          } else {
            initVals[c.id] = '';
          }
        });
      }
      setCustomValues(initVals);

      setEntryPrice('');
      setStopLoss('');
      setTakeProfit('');
      setExitPrice('');
      setRiskPercent(settings.riskPercent || 1.0);
      const calculatedRisk = (settings.accountSize * (settings.riskPercent || 1.0)) / 100;
      setRiskAmount(Number(calculatedRisk.toFixed(2)) || 3.0);
      setMarketCondition('TRENDING');
      setExecutedToPlan(true);
      setScreenshots([]);
      setShowAdvanced(false);
    }
    setIsAddingColInline(false);
    setErrors({});
  }, [initialTrade, isOpen, activeProjectId, projects, settings]);

  if (!isOpen) return null;

  // Handle result button toggle and auto-adjust R
  const handleResultChange = (newResult: TradeResult) => {
    setResult(newResult);
    if (newResult === 'WIN') {
      if (parseFloat(resultR) <= 0) setResultR('2.0');
    } else if (newResult === 'LOSS') {
      if (parseFloat(resultR) >= 0) setResultR('-1.0');
    } else {
      setResultR('0.0');
    }
  };

  // Handle adding custom column inline right inside the trade form
  const handleAddInlineColumn = () => {
    if (!newInlineColName.trim() || !currentProject) return;

    let options: string[] | undefined = undefined;
    if (newInlineColType === 'select') {
      options = newInlineColOptions
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (options.length === 0) options = ['Opsi 1', 'Opsi 2'];
    }

    const colId = `col_${newInlineColName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const newCol: CustomColumnDefinition = {
      id: colId,
      name: newInlineColName.trim(),
      type: newInlineColType,
      options,
    };

    const updatedProject: BacktestProject = {
      ...currentProject,
      customColumns: [...(currentProject.customColumns || []), newCol],
      updatedAt: new Date().toISOString(),
    };

    if (onSaveProject) {
      onSaveProject(updatedProject);
    }

    // Set initial value for current trade
    setCustomValues((prev) => ({
      ...prev,
      [colId]: options && options.length > 0 ? options[0] : '',
    }));

    setNewInlineColName('');
    setIsAddingColInline(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = 'Tanggal wajib diisi';
    if (!pair) newErrors.pair = 'Pair wajib diisi';
    if (!direction) newErrors.direction = 'Arah entri BUY / SELL wajib dipilih';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const rNum = parseFloat(resultR) || (result === 'WIN' ? 2 : result === 'LOSS' ? -1 : 0);
    const calculatedPnL = Number((rNum * riskAmount).toFixed(2));
    const tradeId = initialTrade?.id || `TRD-${Date.now().toString().slice(-6)}`;

    const numEntry = parseFloat(entryPrice) || 0;
    const numSL = parseFloat(stopLoss) || 0;
    const numTP = parseFloat(takeProfit) || 0;
    const numExit = parseFloat(exitPrice) || numEntry;

    const tradeData: Trade = {
      id: tradeId,
      projectId: currentProject?.id || selectedProjectId,
      projectName: currentProject?.name || 'Standard Strategy',
      date, // YYYY-MM-DD
      pair: pair.toUpperCase().trim(),
      direction,
      session,
      timeframe,
      setup: currentProject?.name || 'Custom Setup',
      marketCondition,
      result,
      resultR: rNum,
      profitLoss: calculatedPnL,
      notes: notes.trim(),
      entryReason: notes.trim(),
      customValues,

      // Prices & Risk
      entry: numEntry,
      stopLoss: numSL,
      takeProfit: numTP,
      exit: numExit,
      riskPercent,
      riskAmount,
      rrPlanned: Math.abs(rNum) || 2,
      rrActual: rNum,

      // Plan & Screenshots
      executedToPlan,
      planViolation: !executedToPlan,
      screenshots,
      screenshotUrl: screenshots.length > 0 ? screenshots[0].url : '',
      beforeScreenshotUrl: screenshots.find((s) => s.type === 'before')?.url || '',
      afterScreenshotUrl: screenshots.find((s) => s.type === 'after')?.url || '',

      // Meta
      marketContext: '',
      confirmation: '',
      mistake: '',
      emotion: '',
      lesson: '',
      tags: [direction, result, session],
      accountId: settings.activeAccount || 'Backtest Account',
      createdAt: initialTrade?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(tradeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-5 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0c121d] shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#090e17]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>{initialTrade ? 'Edit Transaksi Backtest' : 'Input Transaksi Backtest'}</span>
                <span className="font-mono text-xs text-emerald-400 font-normal">
                  {initialTrade?.id || 'NEW'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Form terstruktur sesuai proyek backtest & kolom kustom yang Anda tentukan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* PROJECT SELECTOR BAR */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300">Proyek Sesi Backtest:</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    if (onSelectProject) onSelectProject(e.target.value);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>

                {onOpenCreateProject && (
                  <button
                    type="button"
                    onClick={onOpenCreateProject}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 transition shrink-0"
                    title="Buat Proyek Baru"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Proyek Baru</span>
                  </button>
                )}
              </div>
            </div>

            {currentProject?.description && (
              <p className="text-[11px] text-slate-400 border-t border-emerald-500/20 pt-2 leading-relaxed">
                <span className="font-semibold text-slate-300">SOP Strategi: </span>
                {currentProject.description}
              </p>
            )}
          </div>

          {/* FORM DEFAULT: ARAH ENTRI & RESULT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. ARAH ENTRI (BUY / SELL) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                1. Arah Entri <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    direction === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400'
                      : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-sm">▲</span>
                  <span>BUY (Long)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    direction === 'SELL'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400'
                      : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-sm">▼</span>
                  <span>SELL (Short)</span>
                </button>
              </div>
            </div>

            {/* 2. RESULT (WIN / LOSS / BE) & R-MULTIPLE */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200">
                  2. Hasil Transaksi (Result) <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-slate-400">R:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={resultR}
                    onChange={(e) => setResultR(e.target.value)}
                    className="w-16 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-center text-xs font-bold font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleResultChange('WIN')}
                  className={`rounded-xl py-2 text-xs font-bold transition-all ${
                    result === 'WIN'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400'
                      : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  WIN
                </button>

                <button
                  type="button"
                  onClick={() => handleResultChange('LOSS')}
                  className={`rounded-xl py-2 text-xs font-bold transition-all ${
                    result === 'LOSS'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400'
                      : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  LOSS
                </button>

                <button
                  type="button"
                  onClick={() => handleResultChange('BE')}
                  className={`rounded-xl py-2 text-xs font-bold transition-all ${
                    result === 'BE'
                      ? 'bg-slate-700 text-amber-300 shadow-lg ring-2 ring-amber-400/60'
                      : 'border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  BE (Break Even)
                </button>
              </div>
            </div>
          </div>

          {/* FORM DEFAULT: TANGGAL (TANPA JAM), SESI, PAIR, TIMEFRAME */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Tanggal Lengkap (Tanpa Jam) */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Tanggal Lengkap <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none ${
                  errors.date ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Format: YYYY-MM-DD</span>
            </div>

            {/* Pilihan Sesi */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Pilihan Sesi <span className="text-rose-400">*</span>
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as TradingSession)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="ASIA">ASIA (Tokyo / Sydney)</option>
                <option value="LONDON">LONDON</option>
                <option value="NEW YORK">NEW YORK</option>
                <option value="LONDON + NEW YORK">LONDON + NEW YORK</option>
                <option value="OTHER">OTHER / OVERLAP</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Sesi saat setup terjadi</span>
            </div>

            {/* Pair */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Pair / Instrument <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="XAUUSD, EURUSD..."
                value={pair}
                onChange={(e) => setPair(e.target.value.toUpperCase())}
                className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-xs font-mono font-bold uppercase text-slate-100 focus:outline-none ${
                  errors.pair ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="M30">M30</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
                <option value="D1">D1</option>
              </select>
            </div>
          </div>

          {/* KETERANGAN TAMBAHAN: CATATAN (DEFAULT) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              Keterangan Tambahan: Catatan Setup & Alasan Entri
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan catatan observasi trade, alasan buy/sell, level support/resistance, atau faktor psikologi saat entri..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* DYNAMIC CUSTOM COLUMNS SECTION */}
          <div className="rounded-xl border border-slate-800 bg-[#09111c] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kolom Tambahan Strategi ({currentProject?.customColumns?.length || 0})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kolom kustom khusus proyek ini (misal: Kondisi Trend, Konfirmasi Candle, dsb.)
                </p>
              </div>

              {!isAddingColInline && (
                <button
                  type="button"
                  onClick={() => setIsAddingColInline(true)}
                  className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Tambah Kolom Kustom</span>
                </button>
              )}
            </div>

            {/* Render each custom column */}
            {currentProject?.customColumns && currentProject.customColumns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentProject.customColumns.map((col) => (
                  <div key={col.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>{col.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        {col.type === 'select' ? 'Dropdown' : col.type === 'number' ? 'Angka' : 'Teks'}
                      </span>
                    </label>

                    {col.type === 'select' && col.options ? (
                      <select
                        value={customValues[col.id] || col.options[0] || ''}
                        onChange={(e) =>
                          setCustomValues({ ...customValues, [col.id]: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                      >
                        {col.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={col.type === 'number' ? 'number' : 'text'}
                        placeholder={col.placeholder || `Isi ${col.name}...`}
                        value={customValues[col.id] || ''}
                        onChange={(e) =>
                          setCustomValues({ ...customValues, [col.id]: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-800 p-3 text-center text-[11px] text-slate-500">
                Belum ada kolom kustom. Klik <strong>+ Tambah Kolom Kustom</strong> untuk menambahkan variabel seperti "Kondisi Trend", "Konfirmasi Rejection", dll.
              </div>
            )}

            {/* Inline Column Adder Box */}
            {isAddingColInline && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    Tambah Kolom Baru ke Proyek "{currentProject?.name}"
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingColInline(false)}
                    className="text-slate-400 hover:text-slate-200 text-[11px]"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Nama Kolom</label>
                    <input
                      type="text"
                      placeholder="Misal: Kondisi Trend"
                      value={newInlineColName}
                      onChange={(e) => setNewInlineColName(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Tipe Isian</label>
                    <select
                      value={newInlineColType}
                      onChange={(e) => setNewInlineColType(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="select">Pilihan / Dropdown</option>
                      <option value="text">Teks Bebas</option>
                      <option value="number">Angka / Numerik</option>
                    </select>
                  </div>
                </div>

                {newInlineColType === 'select' && (
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Pilihan (Pisahkan dengan koma <code>,</code>)
                    </label>
                    <input
                      type="text"
                      placeholder="Uptrend, Downtrend, Sideways"
                      value={newInlineColOptions}
                      onChange={(e) => setNewInlineColOptions(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingColInline(false)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddInlineColumn}
                    className="rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-500"
                  >
                    Tambahkan Kolom
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SCREENSHOTS UPLOADER */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-emerald-400" />
              <span>Screenshot Chart Setup (Opsional)</span>
            </label>
            <ScreenshotUploader screenshots={screenshots} onScreenshotsChange={setScreenshots} />
          </div>

          {/* ADVANCED PRICE & RISK TOGGLE */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-2">
                <span>{showAdvanced ? 'Sembunyikan' : 'Tampilkan'} Detail Harga & Level SL/TP (Opsional)</span>
                {(entryPrice || stopLoss) && (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px]">
                    Terisi
                  </span>
                )}
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#0a0f18]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Entry Price</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Stop Loss</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-rose-400 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Take Profit</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Exit Price</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={executedToPlan}
                      onChange={(e) => setExecutedToPlan(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                    />
                    <span>Disiplin mengikuti trading plan / SOP</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Harap lengkapi field wajib bertanda bintang (*)</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-500 transition active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Transaksi Backtest</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
