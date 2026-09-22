import React from 'react';
import { Menu, FileSpreadsheet, Download, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { AppSettings } from '../../types/trade';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  settings: AppSettings;
  onUpdateAccount: (account: string) => void;
  isDemoActive: boolean;
  onClearDemoData: () => void;
  onOpenReportModal: () => void;
  onExportCSV: () => void;
  isSyncing?: boolean;
  onSyncGas?: () => void;
  totalTrades: number;
  totalR: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  settings,
  onUpdateAccount,
  isDemoActive,
  onClearDemoData,
  onOpenReportModal,
  onExportCSV,
  isSyncing,
  onSyncGas,
  totalTrades,
  totalR,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#0c121d]/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Multi-Account Selector (Section 34) */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">Account:</span>
          <select
            value={settings.activeAccount}
            onChange={(e) => onUpdateAccount(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {settings.accounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        {/* Demo Data Tag (Section 53) */}
        {isDemoActive && (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>DEMO DATA ACTIVE</span>
            <button
              onClick={onClearDemoData}
              title="Hapus data demo"
              className="ml-1 text-amber-300 hover:text-amber-100 hover:underline flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden md:inline">Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time stats pill */}
        <div className="hidden md:flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs">
          <div>
            <span className="text-slate-500">Trades: </span>
            <span className="font-mono font-semibold text-slate-200">{totalTrades}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500">Return: </span>
            <span className={`font-mono font-bold ${totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalR >= 0 ? `+${totalR.toFixed(2)}` : totalR.toFixed(2)}R
            </span>
          </div>
        </div>

        {/* GAS Sync Button if URL exists */}
        {settings.gasApiUrl && (
          <button
            onClick={onSyncGas}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition"
            title="Sinkronisasi dengan Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Sync Sheets</span>
          </button>
        )}

        {/* Export CSV button */}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Report button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      </div>
    </header>
  );
};
