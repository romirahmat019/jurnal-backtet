import React, { useState } from 'react';
import { PeriodStats } from '../../utils/analytics';
import { formatR, formatPercent } from '../../utils/formatters';

interface PeriodBarChartProps {
  title: string;
  subtitle?: string;
  data: PeriodStats[];
  height?: number;
}

export const PeriodBarChart: React.FC<PeriodBarChartProps> = ({
  title,
  subtitle,
  data,
  height = 240,
}) => {
  const [hoveredItem, setHoveredItem] = useState<PeriodStats | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a]/60 text-slate-400">
        <p className="text-sm font-medium">Belum ada data periode untuk {title}.</p>
      </div>
    );
  }

  // Display at most the latest 15 periods to keep bars sharp and clean
  const displayData = data.slice(-15);

  const maxAbsR = Math.max(1, ...displayData.map(d => Math.abs(d.totalR)));
  const yDomainMax = maxAbsR * 1.25;
  const yDomainMin = -yDomainMax;
  const yRange = yDomainMax - yDomainMin;

  const width = 650;
  const svgHeight = height;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (val: number) => paddingTop + chartHeight - ((val - yDomainMin) / yRange) * chartHeight;
  const zeroY = getY(0);

  const barSlotWidth = chartWidth / displayData.length;
  const barWidth = Math.max(8, Math.min(32, barSlotWidth * 0.65));

  return (
    <div className="relative w-full rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="none"
        >
          {/* Zero baseline */}
          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={width - paddingRight}
            y2={zeroY}
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={getY(maxAbsR)}
            x2={width - paddingRight}
            y2={getY(maxAbsR)}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
          <text
            x={paddingLeft - 8}
            y={getY(maxAbsR) + 3}
            textAnchor="end"
            fill="#64748b"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            +{maxAbsR.toFixed(1)}R
          </text>

          <line
            x1={paddingLeft}
            y1={getY(-maxAbsR)}
            x2={width - paddingRight}
            y2={getY(-maxAbsR)}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
          <text
            x={paddingLeft - 8}
            y={getY(-maxAbsR) + 3}
            textAnchor="end"
            fill="#64748b"
            fontSize="9"
            fontFamily="JetBrains Mono, monospace"
          >
            -{maxAbsR.toFixed(1)}R
          </text>

          {/* Bars */}
          {displayData.map((item, idx) => {
            const centerX = paddingLeft + (idx + 0.5) * barSlotWidth;
            const itemY = getY(item.totalR);
            const isPos = item.totalR >= 0;
            const barHeight = Math.max(2, Math.abs(itemY - zeroY));
            const barTop = isPos ? itemY : zeroY;
            const isHovered = hoveredItem?.periodKey === item.periodKey;

            return (
              <g key={item.periodKey} className="cursor-pointer">
                {/* Hit area */}
                <rect
                  x={centerX - barSlotWidth / 2}
                  y={paddingTop}
                  width={barSlotWidth}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                />

                {/* Bar */}
                <rect
                  x={centerX - barWidth / 2}
                  y={barTop}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill={isPos ? '#10b981' : '#f43f5e'}
                  opacity={isHovered ? 1 : 0.85}
                  stroke={isHovered ? '#ffffff' : 'none'}
                  strokeWidth="1.5"
                />

                {/* X label */}
                <text
                  x={centerX}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {item.label.length > 10 ? item.label.slice(5) : item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredItem && (
          <div className="pointer-events-none absolute top-2 right-4 rounded-lg border border-slate-700 bg-slate-900/95 p-2.5 text-xs shadow-xl backdrop-blur-md">
            <div className="font-semibold text-slate-200">{hoveredItem.label}</div>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <span className="text-slate-400">Total R:</span>
              <span className={`font-mono font-bold ${hoveredItem.totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatR(hoveredItem.totalR)}
              </span>
              <span className="text-slate-400">Trades:</span>
              <span className="font-mono text-slate-200">{hoveredItem.trades} ({hoveredItem.wins}W / {hoveredItem.losses}L)</span>
              <span className="text-slate-400">Win Rate:</span>
              <span className="font-mono text-slate-200">{formatPercent(hoveredItem.winRate)}</span>
              <span className="text-slate-400">Avg R:</span>
              <span className="font-mono text-slate-200">{formatR(hoveredItem.averageR)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
