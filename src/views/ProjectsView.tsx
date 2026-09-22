import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Play,
  Edit3,
  Trash2,
  CheckCircle2,
  BarChart3,
  Calendar,
  Columns,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { BacktestProject, Trade, AppSettings } from '../types/trade';
import { formatR, formatPercent } from '../utils/formatters';

interface ProjectsViewProps {
  projects: BacktestProject[];
  activeProjectId: string;
  onSelectActiveProject: (projectId: string) => void;
  onOpenCreateProject: () => void;
  onOpenEditProject: (project: BacktestProject) => void;
  onDeleteProject: (projectId: string) => void;
  onStartBacktest: (project: BacktestProject) => void;
  onViewProjectTrades: (projectId: string) => void;
  trades: Trade[];
  settings: AppSettings;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectActiveProject,
  onOpenCreateProject,
  onOpenEditProject,
  onDeleteProject,
  onStartBacktest,
  onViewProjectTrades,
  trades,
  settings,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Compute stats per project
  const getProjectStats = (projectId: string) => {
    const projectTrades = trades.filter((t) => t.projectId === projectId);
    const totalTrades = projectTrades.length;
    const wins = projectTrades.filter((t) => t.result === 'WIN').length;
    const losses = projectTrades.filter((t) => t.result === 'LOSS').length;
    const be = projectTrades.filter((t) => t.result === 'BE').length;
    const totalR = projectTrades.reduce((sum, t) => sum + (t.resultR || 0), 0);
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    return {
      totalTrades,
      wins,
      losses,
      be,
      totalR: Number(totalR.toFixed(2)),
      winRate: Number(winRate.toFixed(1)),
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0c121d] p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-100">Proyek Sesi Backtest & Strategi Custom</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Buat proyek backtest dengan deskripsi SOP strategi spesifik dan tentukan kolom isian kustom (misal: 
            <strong> Kondisi Trend</strong>, <strong>Konfirmasi Candlestick</strong>, <strong>Filter Indikator</strong>) 
            sebelum mulai menguji chart.
          </p>
        </div>

        <button
          onClick={onOpenCreateProject}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 transition active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Proyek Backtest Baru</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          const stats = getProjectStats(project.id);

          return (
            <div
              key={project.id}
              className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-[#0f172a] p-5 shadow-lg ${
                isActive
                  ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header inside card */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                        {project.name}
                      </h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </div>
                    {project.defaultPair && (
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                        <span className="font-bold text-slate-300">{project.defaultPair}</span>
                        <span>•</span>
                        <span>{project.defaultTimeframe || 'M15'}</span>
                        <span>•</span>
                        <span>{project.defaultSession || 'LONDON'}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Dropdown / buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenEditProject(project)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                      title="Edit Proyek & Kolom Kustom"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={() => {
                          if (deletingId === project.id) {
                            onDeleteProject(project.id);
                            setDeletingId(null);
                          } else {
                            setDeletingId(project.id);
                            setTimeout(() => setDeletingId(null), 4000);
                          }
                        }}
                        className={`rounded-lg p-1.5 transition ${
                          deletingId === project.id
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'text-slate-500 hover:bg-slate-800 hover:text-rose-400'
                        }`}
                        title={deletingId === project.id ? 'Klik sekali lagi untuk konfirmasi hapus' : 'Hapus proyek'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Custom Columns Indicator */}
                <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Columns className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Kolom Form Tersedia:</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      5 Default + {project.customColumns?.length || 0} Kustom
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60 font-mono">
                      Entri (BUY/SELL)
                    </span>
                    <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60 font-mono">
                      Result (W/L/BE)
                    </span>
                    <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60 font-mono">
                      Tanggal
                    </span>
                    <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60 font-mono">
                      Sesi
                    </span>
                    <span className="rounded bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60 font-mono">
                      Catatan
                    </span>
                    {project.customColumns?.map((col) => (
                      <span
                        key={col.id}
                        className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30"
                      >
                        + {col.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Performance Strip */}
                <div className="grid grid-cols-4 gap-2 rounded-xl bg-slate-900/80 p-2.5 text-center mb-4 border border-slate-800/60">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Trades</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5 font-mono">{stats.totalTrades}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Win Rate</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">
                      {formatPercent(stats.winRate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total R</div>
                    <div
                      className={`text-xs font-bold mt-0.5 font-mono ${
                        stats.totalR > 0
                          ? 'text-emerald-400'
                          : stats.totalR < 0
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {formatR(stats.totalR)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">W / L / BE</div>
                    <div className="text-[11px] font-bold text-slate-300 mt-0.5 font-mono">
                      {stats.wins}/{stats.losses}/{stats.be}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                {!isActive ? (
                  <button
                    onClick={() => onSelectActiveProject(project.id)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                  >
                    Pilih Proyek Ini
                  </button>
                ) : (
                  <button
                    onClick={() => onViewProjectTrades(project.id)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Lihat Trade ({stats.totalTrades})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => onStartBacktest(project)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/30 transition shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mulai Backtest</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
