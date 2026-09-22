import React, { useState } from 'react';
import { formatR } from '../../utils/formatters';

interface DrawdownChartProps {
  data: { index: number; date: string; pair: string; drawdownR: number; cumulativeR: number }[];
  maxDrawdownR: number;
  height?: number;
}

export const DrawdownChart: React.FC<DrawdownChartProps> = ({
  data,
  maxDrawdownR,
  height = 200,
}) => {
  const [hovered, setHovered] = useState<{ index: number; date: string; pair: string; drawdownR: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[180px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a]/60 text-slate-400">
        <p className="text-sm font-medium">Belum ada data untuk kalkulasi drawdown.</p>
      </div>
    );
  }

  const width = 700;
  const svgHeight = height;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxDD = Math.max(1, maxDrawdownR * 1.15);

  const getX = (idx: number) => paddingLeft + (idx / Math.max(1, data.length - 1)) * chartWidth;
  const getY = (ddVal: number) => paddingTop + (ddVal / maxDD) * chartHeight; // 0 DD is at top

  // Draw underwater path
  const points = data.map((d, i) => `${getX(i)},${getY(d.drawdownR)}`).join(' ');
  const areaString = `${getX(0)},${paddingTop} ${points} ${getX(data.length - 1)},${paddingTop}`;

  return (
    <div className="relative w-full rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Drawdown Curve (Underwater)</h3>
          <p className="text-xs text-slate-400 mt-0.5">Penurunan ekuitas dari titik tertinggi (Peak) dalam satuan R</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Max Drawdown: </span>
          <span className="font-mono text-sm font-bold text-rose-400">-{maxDrawdownR.toFixed(2)}R</span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* 0 Drawdown baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={width - paddingRight}
            y2={paddingTop}
            stroke="#10b981"
            strokeWidth="1.5"
          />
          <text
            x={paddingLeft - 8}
            y={paddingTop + 4}
            textAnchor="end"
            fill="#10b981"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            0.0R
          </text>

          {/* Max DD gridline */}
          <line
            x1={paddingLeft}
            y1={getY(maxDrawdownR)}
            x2={width - paddingRight}
            y2={getY(maxDrawdownR)}
            stroke="#f43f5e"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={paddingLeft - 8}
            y={getY(maxDrawdownR) + 3}
            textAnchor="end"
            fill="#f43f5e"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            -{maxDrawdownR.toFixed(1)}R
          </text>

          {/* Underwater area */}
          <polygon points={areaString} fill="url(#drawdownGradient)" />

          {/* Underwater line */}
          <polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.drawdownR);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={hovered?.index === d.index ? 5 : 2}
                fill="#f43f5e"
                stroke="#0f172a"
                strokeWidth="1.5"
                onMouseEnter={() => setHovered(d)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-xs shadow-xl backdrop-blur-md"
            style={{
              left: `${(getX(hovered.index - 1) / width) * 100}%`,
              top: `${(getY(hovered.drawdownR) / svgHeight) * 100}%`,
              marginTop: '-8px',
            }}
          >
            <div className="font-semibold text-slate-200">Trade #{hovered.index} ({hovered.pair})</div>
            <div className="font-mono text-rose-400">Drawdown: -{hovered.drawdownR.toFixed(2)}R</div>
          </div>
        )}
      </div>
    </div>
  );
};
