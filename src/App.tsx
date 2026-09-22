import React, { useState, useEffect, useMemo } from 'react';
import { Trade, TradeFilter, AppSettings } from './types/trade';
import { StorageService } from './services/storage';
import { GasApiService } from './services/gasApi';
import { calculateAnalytics } from './utils/analytics';
import { exportTradesToCSV } from './utils/exportImport';

// Navigation & Common UI
import { Sidebar, NavPage } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { FilterBar } from './components/common/FilterBar';
import { ReportModal } from './components/common/ReportModal';

// Modals
import { TradeFormModal } from './components/trade/TradeFormModal';
import { QuickAddModal } from './components/trade/QuickAddModal';
import { TradeDetailModal } from './components/trade/TradeDetailModal';

// Views
import { DashboardView } from './views/DashboardView';
import { TradeTable } from './components/trade/TradeTable';
import { AnalyticsView } from './views/AnalyticsView';
import { HistoricalPatternsView } from './views/HistoricalPatternsView';
import { CalendarView } from './views/CalendarView';
import { GalleryView } from './views/GalleryView';
import { ReviewsView } from './views/ReviewsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  // State
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<NavPage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isTradeFormOpen, setIsTradeFormOpen] = useState<boolean>(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [selectedTradeForDetail, setSelectedTradeForDetail] = useState<Trade | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Filter state
  const [filter, setFilter] = useState<TradeFilter>({
    period: 'all',
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

  // Load initial trades and settings
  useEffect(() => {
    const loadedTrades = StorageService.getTrades();
    setTrades(loadedTrades);
    setIsDemoActive(StorageService.isDemoActive());
    const loadedSettings = StorageService.getSettings();
    setSettings(loadedSettings);
  }, []);

  // Filter trades logic
  const filteredTrades = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return trades.filter((t) => {
      // Account filter (if active account isn't empty)
      if (settings.activeAccount && t.accountId && t.accountId !== settings.activeAccount) {
        return false;
      }

      // Period filters
      if (filter.period === 'today' && t.date !== todayStr) return false;

      if (filter.period === 'this_week') {
        const tradeDate = new Date(t.date);
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);
        if (tradeDate < startOfWeek) return false;
      }

      if (filter.period === 'this_month') {
        const currentYearMonth = now.toISOString().slice(0, 7);
        if (!t.date.startsWith(currentYearMonth)) return false;
      }

      if (filter.period === 'last_7') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (new Date(t.date) < sevenDaysAgo) return false;
      }

      if (filter.period === 'last_30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (new Date(t.date) < thirtyDaysAgo) return false;
      }

      if (filter.period === 'last_90') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        if (new Date(t.date) < ninetyDaysAgo) return false;
      }

      if (filter.period === 'custom') {
        if (filter.dateFrom && t.date < filter.dateFrom) return false;
        if (filter.dateTo && t.date > filter.dateTo) return false;
      }

      // Attributes
      if (filter.pair && t.pair.toUpperCase() !== filter.pair.toUpperCase()) return false;
      if (filter.setup && t.setup !== filter.setup) return false;
      if (filter.session && t.session !== filter.session) return false;
      if (filter.timeframe && t.timeframe !== filter.timeframe) return false;
      if (filter.direction && t.direction !== filter.direction) return false;
      if (filter.result && t.result !== filter.result) return false;
      if (filter.marketCondition && t.marketCondition !== filter.marketCondition) return false;

      if (filter.tag) {
        if (!t.tags || !t.tags.some((tag) => tag.toLowerCase().includes(filter.tag!.toLowerCase()))) {
          return false;
        }
      }

      if (filter.onlyViolations && !t.planViolation) return false;
      if (filter.onlyCompliant && (!t.executedToPlan || t.planViolation)) return false;

      // Search Query
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matchesPair = t.pair.toLowerCase().includes(q);
        const matchesSetup = t.setup.toLowerCase().includes(q);
        const matchesNotes =
          (t.entryReason && t.entryReason.toLowerCase().includes(q)) ||
          (t.lesson && t.lesson.toLowerCase().includes(q)) ||
          (t.mistake && t.mistake.toLowerCase().includes(q));
        const matchesTags = t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q));

        if (!matchesPair && !matchesSetup && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [trades, filter, settings.activeAccount]);

  // Analytics computed from filtered trades
  const analytics = useMemo(() => {
    return calculateAnalytics(filteredTrades, settings.accountSize, settings.riskPercent);
  }, [filteredTrades, settings.accountSize, settings.riskPercent]);

  // Available unique values for filter dropdowns
  const availableSetups = useMemo(() => {
    const list = Array.from(new Set(trades.map((t) => t.setup)));
    return list.length > 0 ? list : settings.savedSetups;
  }, [trades, settings.savedSetups]);

  const availablePairs = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.pair)));
  }, [trades]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [trades]);

  // Actions
  const handleSaveTrade = async (tradeToSave: Trade) => {
    StorageService.saveTrade(tradeToSave);
    const updated = StorageService.getTrades();
    setTrades(updated);

    // Background sync to GAS Web App if configured
    if (settings.gasApiUrl) {
      setIsSyncing(true);
      const api = new GasApiService(settings.gasApiUrl);
      const res = await api.createTrade(tradeToSave);
      setIsSyncing(false);
      if (res.success) {
        showSyncToast('Disimpan ke Google Sheets & Local');
      } else {
        showSyncToast(`Tersimpan lokal (Sheets offline: ${res.message || 'gagal koneksi'})`);
      }
    } else {
      showSyncToast('Trade berhasil disimpan');
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    StorageService.deleteTrade(tradeId);
    const updated = StorageService.getTrades();
    setTrades(updated);

    if (settings.gasApiUrl) {
      const api = new GasApiService(settings.gasApiUrl);
      await api.deleteTrade(tradeId);
    }
    showSyncToast('Trade berhasil dihapus');
  };

  const handleSyncGas = async () => {
    if (!settings.gasApiUrl) return;
    setIsSyncing(true);
    const api = new GasApiService(settings.gasApiUrl);
    const res = await api.fetchTrades();
    setIsSyncing(false);
    if (res.success && res.data) {
      StorageService.saveTrades(res.data);
      setTrades(res.data);
      showSyncToast(`Sinkronisasi sukses: ${res.data.length} transaksi dimuat`);
    } else {
      showSyncToast(`Sinkronisasi gagal: ${res.message || 'Periksa URL GAS'}`);
    }
  };

  const handleLoadDemo = () => {
    StorageService.loadDemoData();
    setTrades(StorageService.getTrades());
    setIsDemoActive(true);
    showSyncToast('18 Data demo backtest berhasil dimuat');
  };

  const handleClearDemo = () => {
    StorageService.clearDemoData();
    setTrades(StorageService.getTrades());
    setIsDemoActive(false);
    showSyncToast('Data demo dibersihkan');
  };

  const handleClearAll = () => {
    StorageService.clearAllTrades();
    setTrades([]);
    setIsDemoActive(false);
    showSyncToast('Semua data berhasil dihapus');
  };

  const handleImportTrades = (imported: Trade[]) => {
    StorageService.saveTrades(imported);
    setTrades(imported);
    showSyncToast(`${imported.length} trade berhasil diimpor`);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    showSyncToast('Pengaturan berhasil diperbarui');
  };

  const handleAddNewSetupToSettings = (newSetup: string) => {
    if (!settings.savedSetups.includes(newSetup)) {
      const updated = {
        ...settings,
        savedSetups: [...settings.savedSetups, newSetup],
      };
      handleUpdateSettings(updated);
    }
  };

  const showSyncToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Navbar */}
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          settings={settings}
          onUpdateAccount={(acc) => handleUpdateSettings({ ...settings, activeAccount: acc })}
          isDemoActive={isDemoActive}
          onClearDemoData={handleClearDemo}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onExportCSV={() => exportTradesToCSV(filteredTrades)}
          isSyncing={isSyncing}
          onSyncGas={handleSyncGas}
          totalTrades={analytics.totalTrades}
          totalR={analytics.totalR}
        />

        {/* Sync Toast Notification */}
        {syncToast && (
          <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-emerald-500/30 bg-[#0f172a]/95 px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-md transition">
            {syncToast}
          </div>
        )}

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Global Filter Bar (shown on Dashboard, Trades, Analytics, Gallery) */}
          {(activePage === 'dashboard' ||
            activePage === 'trades' ||
            activePage === 'analytics' ||
            activePage === 'gallery') && (
            <FilterBar
              filter={filter}
              onChangeFilter={setFilter}
              settings={settings}
              availableSetups={availableSetups}
              availablePairs={availablePairs}
              availableTags={availableTags}
              filteredCount={filteredTrades.length}
              totalCount={trades.length}
            />
          )}

          {/* PAGE ROUTING */}
          {activePage === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              trades={filteredTrades}
              settings={settings}
              onOpenAddTrade={() => {
                setEditingTrade(null);
                setIsTradeFormOpen(true);
              }}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onSelectTrade={setSelectedTradeForDetail}
              onNavigate={setActivePage}
              onLoadDemoData={handleLoadDemo}
            />
          )}

          {activePage === 'add_trade' && (
            <div className="max-w-4xl mx-auto">
              <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-6 text-center">
                <h2 className="text-lg font-bold text-slate-100 mb-2">Form Pencatatan Backtest</h2>
                <p className="text-xs text-slate-400 mb-6">
                  Rekam detail transaksi, entry, stop loss, take profit, screenshot chart, dan catatan refleksi trading.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingTrade(null);
                      setIsTradeFormOpen(true);
                    }}
                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40"
                  >
                    Buka Full Add Trade Form
                  </button>
                  <button
                    onClick={() => setIsQuickAddOpen(true)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Mode Input Cepat (Quick Add)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePage === 'trades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-100">Daftar Transaksi Backtest</h2>
                  <p className="text-xs text-slate-400">
                    Menampilkan {filteredTrades.length} dari {trades.length} trade tercatat
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsQuickAddOpen(true)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    + Quick Add
                  </button>
                  <button
                    onClick={() => {
                      setEditingTrade(null);
                      setIsTradeFormOpen(true);
                    }}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                  >
                    + Add Backtest
                  </button>
                </div>
              </div>

              <TradeTable
                trades={filteredTrades}
                onSelectTrade={setSelectedTradeForDetail}
                onEditTrade={(t) => {
                  setEditingTrade(t);
                  setIsTradeFormOpen(true);
                }}
                onDeleteTrade={handleDeleteTrade}
              />
            </div>
          )}

          {activePage === 'calendar' && (
            <CalendarView
              trades={filteredTrades}
              onSelectTrade={setSelectedTradeForDetail}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
              trades={filteredTrades}
            />
          )}

          {activePage === 'patterns' && (
            <HistoricalPatternsView
              analytics={analytics}
              trades={filteredTrades}
            />
          )}

          {activePage === 'gallery' && (
            <GalleryView
              trades={filteredTrades}
              onSelectTrade={setSelectedTradeForDetail}
            />
          )}

          {activePage === 'reviews' && (
            <ReviewsView
              trades={filteredTrades}
              analytics={analytics}
              onSelectTrade={setSelectedTradeForDetail}
            />
          )}

          {activePage === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              trades={trades}
              onImportTrades={handleImportTrades}
              onClearAllTrades={handleClearAll}
              onLoadDemoData={handleLoadDemo}
            />
          )}
        </main>
      </div>

      {/* FULL ADD / EDIT TRADE MODAL */}
      <TradeFormModal
        isOpen={isTradeFormOpen}
        onClose={() => {
          setIsTradeFormOpen(false);
          setEditingTrade(null);
        }}
        onSave={handleSaveTrade}
        initialTrade={editingTrade}
        settings={settings}
        onAddNewSetup={handleAddNewSetupToSettings}
      />

      {/* QUICK ADD MODAL */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={handleSaveTrade}
        settings={settings}
      />

      {/* TRADE DETAIL MODAL */}
      <TradeDetailModal
        trade={selectedTradeForDetail}
        isOpen={Boolean(selectedTradeForDetail)}
        onClose={() => setSelectedTradeForDetail(null)}
        onEdit={(t) => {
          setSelectedTradeForDetail(null);
          setEditingTrade(t);
          setIsTradeFormOpen(true);
        }}
        onDelete={handleDeleteTrade}
      />

      {/* REPORT MODAL */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        trades={filteredTrades}
        analytics={analytics}
        settings={settings}
      />
    </div>
  );
}
