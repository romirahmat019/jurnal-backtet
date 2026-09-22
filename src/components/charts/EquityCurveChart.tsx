import React, { useState, useRef } from 'react';
import { formatR } from '../../utils/formatters';

interface EquityPoint {
  index: number;
  date: string;
  pair: string;
  resultR: number;
  cumulativeR: number;
  peakR: number;
  drawdownR: number;
}

interface EquityCurveChartProps {
  data: EquityPoint[];
  height?: number;
}

export const EquityCurveChart: React.FC<EquityCurveChartProps> = ({ data, height = 300 }) => {
  const [hoveredPoint, setHoveredPoint] = useState<EquityPoint | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a]/60 text-slate-400">
        <p className="text-sm font-medium">Belum ada transaksi untuk menampilkan kurva ekuitas.</p>
        <p className="text-xs text-slate-500 mt-1">Tambahkan trade backtest untuk melihat pertumbuhan R.</p>
      </div>
    );
  }

  // Prepend baseline starting point (Trade 0, 0R)
  const fullData: EquityPoint[] = [
    { index: 0, date: 'Start', pair: '-', resultR: 0, cumulativeR: 0, peakR: 0, drawdownR: 0 },
    ...data,
  ];

  const minR = Math.min(0, ...fullData.map(d => d.cumulativeR));
  const maxR = Math.max(1, ...fullData.map(d => d.cumulativeR));
  const range = (maxR - minR) || 1;
  const paddingY = range * 0.15;
  const yDomainMin = minR - paddingY;
  const yDomainMax = maxR + paddingY;
  const yDomainRange = yDomainMax - yDomainMin;

  const width = 800; // SVG internal coordinate width
  const svgHeight = height;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (fullData.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - yDomainMin) / yDomainRange) * chartHeight;

  // Zero line coordinate
  const zeroY = getY(0);

  // Generate SVG path for line
  const pointsString = fullData.map((d, i) => `${getX(i)},${getY(d.cumulativeR)}`).join(' ');
  const areaString = `${getX(0)},${zeroY} ${pointsString} ${getX(fullData.length - 1)},${zeroY}`;

  // Y-axis ticks
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const val = yDomainMin + (i / (yTicksCount - 1)) * yDomainRange;
    return Number(val.toFixed(1));
  });

  const lastPoint = fullData[fullData.length - 1];
  const isOverallPositive = lastPoint.cumulativeR >= 0;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-4" ref={containerRef}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Cumulative Equity Curve</h3>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${isOverallPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {formatR(lastPoint.cumulativeR)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Pertumbuhan akumulasi return berbasis R-Multiple</p>
        </div>
        <div className="text-right text-xs text-slate-400">
          Peak: <span className="font-mono font-medium text-emerald-400">+{data[data.length - 1]?.peakR.toFixed(2)}R</span>
          <span className="mx-2">|</span>
          Max DD: <span className="font-mono font-medium text-rose-400">-{Math.max(...data.map(d => d.drawdownR)).toFixed(2)}R</span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="equityNegGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tickVal, i) => {
            const y = getY(tickVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {tickVal > 0 ? `+${tickVal}` : tickVal}R
                </text>
              </g>
            );
          })}

          {/* Zero baseline */}
          {zeroY >= paddingTop && zeroY <= paddingTop + chartHeight && (
            <line
              x1={paddingLeft}
              y1={zeroY}
              x2={width - paddingRight}
              y2={zeroY}
              stroke="#475569"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
          )}

          {/* Filled Area */}
          <polygon
            points={areaString}
            fill={isOverallPositive ? 'url(#equityGradient)' : 'url(#equityNegGradient)'}
          />

          {/* Main Curve Line */}
          <polyline
            fill="none"
            stroke={isOverallPositive ? '#10b981' : '#f43f5e'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Trade point dots & hover targets */}
          {fullData.map((d, i) => {
            if (i === 0) return null;
            const cx = getX(i);
            const cy = getY(d.cumulativeR);
            const isHovered = hoveredPoint?.index === d.index;
            const isWin = d.resultR > 0;

            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3}
                  fill={isWin ? '#10b981' : d.resultR < 0 ? '#f43f5e' : '#94a3b8'}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-150 cursor-pointer"
                />
                {/* Transparent hit area */}
                <rect
                  x={cx - 15}
                  y={paddingTop}
                  width="30"
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md transition-transform"
            style={{
              left: `${(getX(hoveredPoint.index) / width) * 100}%`,
              top: `${(getY(hoveredPoint.cumulativeR) / svgHeight) * 100}%`,
              marginTop: '-12px',
            }}
          >
            <div className="font-semibold text-slate-200">
              Trade #{hoveredPoint.index} • <span className="text-emerald-400">{hoveredPoint.pair}</span>
            </div>
            <div className="text-[11px] text-slate-400">{hoveredPoint.date}</div>
            <div className="mt-1 flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">Trade Result:</span>
              <span className={`font-mono font-semibold ${hoveredPoint.resultR > 0 ? 'text-emerald-400' : hoveredPoint.resultR < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {formatR(hoveredPoint.resultR)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-slate-400">Cumulative R:</span>
              <span className="font-mono font-bold text-slate-100">
                {formatR(hoveredPoint.cumulativeR)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* X Axis labels */}
      <div className="mt-2 flex justify-between px-10 text-[10px] text-slate-500 font-mono">
        <span>Trade #1 ({data[0]?.date})</span>
        <span>Trade #{data.length} ({data[data.length - 1]?.date})</span>
      </div>
    </div>
  );
};
