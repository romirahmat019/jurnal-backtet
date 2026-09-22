import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  TableProperties,
  Calendar,
  BarChart3,
  Sparkles,
  Image as ImageIcon,
  BookOpenCheck,
  Settings,
  Zap,
} from 'lucide-react';

export type NavPage =
  | 'dashboard'
  | 'add_trade'
  | 'trades'
  | 'calendar'
  | 'analytics'
  | 'patterns'
  | 'gallery'
  | 'reviews'
  | 'settings';

interface SidebarProps {
  activePage: NavPage;
  onSelectPage: (page: NavPage) => void;
  onOpenQuickAdd: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  onOpenQuickAdd,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add_trade' as NavPage, label: 'Add Backtest', icon: PlusCircle },
    { id: 'trades' as NavPage, label: 'Trades Table', icon: TableProperties },
    { id: 'calendar' as NavPage, label: 'Calendar', icon: Calendar },
    { id: 'analytics' as NavPage, label: 'Analytics', icon: BarChart3 },
    { id: 'patterns' as NavPage, label: 'Historical Patterns', icon: Sparkles },
    { id: 'gallery' as NavPage, label: 'Screenshot Gallery', icon: ImageIcon },
    { id: 'reviews' as NavPage, label: 'Periodic Reviews', icon: BookOpenCheck },
    { id: 'settings' as NavPage, label: 'Settings & GAS API', icon: Settings },
  ];

  const handleNavClick = (page: NavPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0c121d] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold font-mono text-base">
              FX
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
                Forex Backtest
              </div>
              <div className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">
                Journal & Analytics
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 border-b border-slate-800/60">
          <button
            onClick={() => {
              onOpenQuickAdd();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-emerald-200" />
            <span>Quick Add Trade</span>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-400 font-semibold border-l-2 border-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090d15] text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span>R-Multiple Metric</span>
            <span className="font-mono text-emerald-400 font-medium">Active</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-600">
            Fokus data historis & setup konsisten
          </p>
        </div>
      </aside>
    </>
  );
};
