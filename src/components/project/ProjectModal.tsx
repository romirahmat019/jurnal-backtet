import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Sliders, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { BacktestProject, CustomColumnDefinition, TradingSession, Timeframe } from '../../types/trade';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: BacktestProject) => void;
  initialProject?: BacktestProject | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [defaultPair, setDefaultPair] = useState<string>('XAUUSD');
  const [defaultSession, setDefaultSession] = useState<TradingSession>('LONDON');
  const [defaultTimeframe, setDefaultTimeframe] = useState<Timeframe>('M15');
  const [customColumns, setCustomColumns] = useState<CustomColumnDefinition[]>([]);

  // State for new column adder
  const [newColName, setNewColName] = useState<string>('');
  const [newColType, setNewColType] = useState<'text' | 'select' | 'number'>('select');
  const [newColOptions, setNewColOptions] = useState<string>('Uptrend, Downtrend, Sideways');
  const [newColPlaceholder, setNewColPlaceholder] = useState<string>('');
  const [isAddingColumn, setIsAddingColumn] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description || '');
      setDefaultPair(initialProject.defaultPair || 'XAUUSD');
      setDefaultSession(initialProject.defaultSession || 'LONDON');
      setDefaultTimeframe(initialProject.defaultTimeframe || 'M15');
      setCustomColumns(initialProject.customColumns || []);
    } else {
      setName('');
      setDescription('');
      setDefaultPair('XAUUSD');
      setDefaultSession('LONDON');
      setDefaultTimeframe('M15');
      setCustomColumns([
        {
          id: `col_trend_${Date.now()}`,
          name: 'Kondisi Trend',
          type: 'select',
          options: ['Uptrend', 'Downtrend', 'Sideways / Ranging'],
        },
      ]);
    }
    setIsAddingColumn(false);
    setError('');
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    if (!newColName.trim()) {
      setError('Nama kolom tidak boleh kosong');
      return;
    }

    const colId = `col_${newColName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    let options: string[] | undefined = undefined;

    if (newColType === 'select') {
      options = newColOptions
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (options.length === 0) {
        options = ['Opsi 1', 'Opsi 2'];
      }
    }

    const newCol: CustomColumnDefinition = {
      id: colId,
      name: newColName.trim(),
      type: newColType,
      options,
      placeholder: newColPlaceholder.trim() || undefined,
    };

    setCustomColumns([...customColumns, newCol]);
    setNewColName('');
    setNewColOptions('Pilihan 1, Pilihan 2, Pilihan 3');
    setNewColPlaceholder('');
    setIsAddingColumn(false);
    setError('');
  };

  const handleRemoveColumn = (id: string) => {
    setCustomColumns(customColumns.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama sesi backtest / proyek wajib diisi');
      return;
    }

    const project: BacktestProject = {
      id: initialProject ? initialProject.id : `proj_${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      description: description.trim(),
      defaultPair: defaultPair.trim().toUpperCase(),
      defaultSession,
      defaultTimeframe,
      customColumns,
      createdAt: initialProject ? initialProject.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0c121d] shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#090e17]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {initialProject ? 'Edit Proyek Backtest & Strategi' : 'Form Pembuatan Proyek Backtest'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Atur nama sesi backtest, deskripsi strategi, serta kustomisasi kolom input transaksi
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sesi / Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Sesi / Proyek Backtest <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Scalping Gold M15 London EMA Breakout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi Strategi & Aturan SOP
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan SOP strategi, aturan entri, filter tren, konfirmasi candlestick, dan target risk-to-reward..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/90 p-3 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Default Instrument Defaults */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Default Pair</label>
              <input
                type="text"
                value={defaultPair}
                onChange={(e) => setDefaultPair(e.target.value.toUpperCase())}
                placeholder="XAUUSD"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono uppercase text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Default Sesi</label>
              <select
                value={defaultSession}
                onChange={(e) => setDefaultSession(e.target.value as TradingSession)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="ASIA">ASIA (Tokyo / Sydney)</option>
                <option value="LONDON">LONDON</option>
                <option value="NEW YORK">NEW YORK</option>
                <option value="LONDON + NEW YORK">LONDON + NEW YORK</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Default Timeframe</label>
              <select
                value={defaultTimeframe}
                onChange={(e) => setDefaultTimeframe(e.target.value as Timeframe)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
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

          {/* Form Columns Configuration Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>Skema Kolom Form Backtest</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Kustomisasi
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Form bawaan mencakup entri <strong>BUY/SELL</strong>, <strong>Result (WIN/LOSS/BE)</strong>, <strong>Tanggal lengkap</strong> (tanpa jam), <strong>Sesi</strong>, dan <strong>Catatan</strong>.
                </p>
              </div>
            </div>

            {/* Default Columns Preview Pill List */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Kolom Standar Bawaan (Default):</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Entri (BUY / SELL)
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Result (WIN / LOSS / BE)
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tanggal Lengkap (YYYY-MM-DD)
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Pilihan Sesi Pasar
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Keterangan Catatan
                </span>
              </div>
            </div>

            {/* Custom Columns Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Kolom Tambahan Kustom ({customColumns.length} kolom)
                </label>
                {!isAddingColumn && (
                  <button
                    type="button"
                    onClick={() => setIsAddingColumn(true)}
                    className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kolom Kustom</span>
                  </button>
                )}
              </div>

              {/* Added Columns List */}
              {customColumns.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-[11px] text-slate-500">
                  Belum ada kolom tambahan. Klik tombol <strong>Tambah Kolom Kustom</strong> di atas untuk menambah kolom seperti "Kondisi Trend", "Konfirmasi Candle", dll.
                </div>
              ) : (
                <div className="space-y-2">
                  {customColumns.map((col) => (
                    <div
                      key={col.id}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0f172a] px-3.5 py-2 transition hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700 uppercase">
                          {col.type === 'select' ? 'Dropdown Opsi' : col.type === 'number' ? 'Angka' : 'Teks'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{col.name}</div>
                          {col.options && col.options.length > 0 && (
                            <div className="text-[10px] text-slate-400">
                              Opsi: {col.options.join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(col.id)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition"
                        title="Hapus kolom ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Column Box */}
              {isAddingColumn && (
                <div className="rounded-xl border border-emerald-500/40 bg-[#091522] p-4 space-y-3 mt-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Konfigurasi Kolom Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingColumn(false)}
                      className="text-slate-400 hover:text-slate-200 text-[11px]"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Nama Kolom <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: Kondisi Trend, Konfirmasi M5, dll."
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Tipe Isian
                      </label>
                      <select
                        value={newColType}
                        onChange={(e) => setNewColType(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="select">Pilihan / Dropdown (Rekomendasi)</option>
                        <option value="text">Teks Bebas / Catatan Singkat</option>
                        <option value="number">Angka / Numerik</option>
                      </select>
                    </div>
                  </div>

                  {newColType === 'select' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Daftar Pilihan (Pisahkan dengan tanda koma <code>,</code>)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Uptrend, Downtrend, Sideways"
                        value={newColOptions}
                        onChange={(e) => setNewColOptions(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Contoh: Uptrend, Downtrend, Sideways atau Pinbar, Engulfing, Breakout
                      </span>
                    </div>
                  )}

                  {newColType === 'text' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Placeholder / Petunjuk
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: Tuliskan konfirmasi indikator..."
                        value={newColPlaceholder}
                        onChange={(e) => setNewColPlaceholder(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingColumn(false)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-slate-300 hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddColumn}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1 font-bold text-white hover:bg-emerald-500 transition"
                    >
                      Tambahkan Kolom
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-slate-300 hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Proyek Backtest</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
