import React, { useState } from 'react';
import {
  Settings,
  Database,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { AppSettings, Trade } from '../types/trade';
import { GAS_SCRIPT_TEMPLATE } from '../services/gasTemplate';
import { GasApiService } from '../services/gasApi';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  trades: Trade[];
  onImportTrades: (trades: Trade[]) => void;
  onClearAllTrades: () => void;
  onLoadDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  trades,
  onImportTrades,
  onClearAllTrades,
  onLoadDemoData,
}) => {
  const [gasUrl, setGasUrl] = useState(settings.gasApiUrl || '');
  const [accountSize, setAccountSize] = useState(settings.accountSize);
  const [riskPercent, setRiskPercent] = useState(settings.riskPercent);
  const [defaultPair, setDefaultPair] = useState(settings.defaultPair);
  const [defaultTimeframe, setDefaultTimeframe] = useState(settings.defaultTimeframe);
  const [defaultSession, setDefaultSession] = useState(settings.defaultSession);

  // Setups management
  const [newSetupInput, setNewSetupInput] = useState('');
  // Accounts management
  const [newAccountInput, setNewAccountInput] = useState('');

  // GAS test connection status
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      gasApiUrl: gasUrl.trim(),
      accountSize: Number(accountSize) || 300,
      riskPercent: Number(riskPercent) || 1.0,
      defaultPair,
      defaultTimeframe,
      defaultSession,
    });
  };

  const handleTestGas = async () => {
    if (!gasUrl.trim()) {
      setTestStatus('failed');
      setTestMessage('Masukkan Web App URL terlebih dahulu.');
      return;
    }
    setTestStatus('testing');
    setTestMessage('Menghubungi endpoint Google Apps Script...');
    const api = new GasApiService(gasUrl.trim());
    const res = await api.ping();
    if (res.success) {
      setTestStatus('success');
      setTestMessage('Koneksi Sukses! Backend Google Apps Script & Sheets siap digunakan.');
    } else {
      setTestStatus('failed');
      setTestMessage(`Koneksi Gagal: ${res.message || 'Pastikan deploy sebagai Web App dengan akses "Anyone"'}`);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleAddSetup = () => {
    if (newSetupInput.trim() && !settings.savedSetups.includes(newSetupInput.trim())) {
      const updated = [...settings.savedSetups, newSetupInput.trim()];
      onUpdateSettings({ ...settings, savedSetups: updated });
      setNewSetupInput('');
    }
  };

  const handleRemoveSetup = (setupToRemove: string) => {
    const updated = settings.savedSetups.filter((s) => s !== setupToRemove);
    onUpdateSettings({ ...settings, savedSetups: updated });
  };

  const handleAddAccount = () => {
    if (newAccountInput.trim() && !settings.accounts.includes(newAccountInput.trim())) {
      const updated = [...settings.accounts, newAccountInput.trim()];
      onUpdateSettings({ ...settings, accounts: updated, activeAccount: newAccountInput.trim() });
      setNewAccountInput('');
    }
  };

  const handleRemoveAccount = (accToRemove: string) => {
    if (settings.accounts.length <= 1) return;
    const updated = settings.accounts.filter((a) => a !== accToRemove);
    const newActive = settings.activeAccount === accToRemove ? updated[0] : settings.activeAccount;
    onUpdateSettings({ ...settings, accounts: updated, activeAccount: newActive });
  };

  // JSON Export / Import
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(trades, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forex_backtest_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportTrades(parsed);
          alert(`Berhasil mengimpor ${parsed.length} data backtest.`);
        }
      } catch (err) {
        alert('Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs text-slate-300">
      {/* 1. GOOGLE APPS SCRIPT / SHEETS INTEGRATION (Phase 2 & 3) */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Google Sheets & Google Drive Backend Integration
              </h2>
              <p className="text-[11px] text-slate-500">
                Hubungkan frontend dengan Google Apps Script Web App untuk database gratis tak terbatas
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Code Disalin!' : 'Copy Script GAS'}</span>
          </button>
        </div>

        {/* URL Input */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">
            Google Apps Script Web App URL:
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleTestGas}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        {/* Test status alert */}
        {testStatus !== 'idle' && (
          <div
            className={`rounded-lg p-3 text-xs border ${
              testStatus === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                : testStatus === 'failed'
                ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                : 'border-slate-700 bg-slate-800/50 text-slate-300'
            }`}
          >
            {testMessage}
          </div>
        )}

        {/* Step-by-step Setup Guide */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
          <span className="font-bold text-slate-200 block text-xs">
            Panduan 4 Langkah Setup Google Apps Script:
          </span>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
            <li>
              Buka spreadsheet baru di <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Google Sheets</a>, lalu buka menu <strong>Extensions → Apps Script</strong>.
            </li>
            <li>
              Klik tombol <strong>"Copy Script GAS"</strong> di kanan atas, lalu paste seluruh kodenya ke editor Apps Script (gantikan seluruh isi <code>Code.gs</code>).
            </li>
            <li>
              Klik tombol <strong>Deploy → New deployment</strong>. Pilih type <strong>Web App</strong>, ubah <em>Execute as</em> ke <strong>"Me"</strong> dan <em>Who has access</em> ke <strong>"Anyone"</strong>.
            </li>
            <li>
              Copy Web App URL yang dihasilkan (berakhiran <code>/exec</code>), paste ke kolom input di atas, lalu klik <strong>"Test Connection"</strong>.
            </li>
          </ol>
        </div>
      </div>

      {/* 2. GENERAL TRADING ACCOUNT DEFAULTS */}
      <form onSubmit={handleSaveSettings} className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>Default Trading Parameters & Risk</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1">Account Balance ($)</label>
            <input
              type="number"
              step="any"
              value={accountSize}
              onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Default Risk per Trade (%)</label>
            <input
              type="number"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 1.0)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Risk per Trade ($)</label>
            <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono font-bold text-emerald-400">
              ${((accountSize * riskPercent) / 100).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1">Default Pair</label>
            <input
              type="text"
              value={defaultPair}
              onChange={(e) => setDefaultPair(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono font-bold text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Default Timeframe</label>
            <select
              value={defaultTimeframe}
              onChange={(e) => setDefaultTimeframe(e.target.value as any)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
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

          <div>
            <label className="block text-slate-400 mb-1">Default Session</label>
            <select
              value={defaultSession}
              onChange={(e) => setDefaultSession(e.target.value as any)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ASIA">ASIA</option>
              <option value="LONDON">LONDON</option>
              <option value="NEW YORK">NEW YORK</option>
              <option value="LONDON + NEW YORK">LONDON + NEW YORK</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500 transition"
          >
            Simpan Parameter
          </button>
        </div>
      </form>

      {/* 3. MULTI-ACCOUNT MANAGEMENT (Section 34) */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
          Multi-Account Management (Backtest, Funded, Personal)
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah nama akun (e.g. FTMO Challenge 50k)..."
            value={newAccountInput}
            onChange={(e) => setNewAccountInput(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={handleAddAccount}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-500"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {settings.accounts.map((acc) => (
            <div
              key={acc}
              className="flex items-center justify-between rounded-lg bg-slate-900 p-2 border border-slate-800"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{acc}</span>
                {settings.activeAccount === acc && (
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    ACTIVE
                  </span>
                )}
              </div>
              {settings.accounts.length > 1 && (
                <button
                  onClick={() => handleRemoveAccount(acc)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. CUSTOM SETUPS MANAGER */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
          Daftar Setup Trading SOP Anda
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah strategi setup baru..."
            value={newSetupInput}
            onChange={(e) => setNewSetupInput(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={handleAddSetup}
            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-500"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Setup</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {settings.savedSetups.map((s) => (
            <div
              key={s}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
            >
              <span>{s}</span>
              <button
                onClick={() => handleRemoveSetup(s)}
                className="text-slate-500 hover:text-rose-400 ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. BACKUP, RESTORE & DATA ACTIONS (Section 49, 50, 53) */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/90 p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
          Backup, Restore & Demo Data Actions
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-slate-200 hover:bg-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Backup JSON</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import Backup JSON</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJSON}
            />
          </label>

          <button
            onClick={onLoadDemoData}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-semibold text-amber-300 hover:bg-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Data (18 Sample)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Hapus seluruh transaksi dari database lokal?')) {
                onClearAllTrades();
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 font-semibold text-rose-400 hover:bg-rose-900/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
