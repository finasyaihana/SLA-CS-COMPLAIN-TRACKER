import React, { useState } from 'react';
import { MonthlyTrendItem } from '../../utils/analytics';
import { TrendingUp, Calendar, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  trendData: MonthlyTrendItem[];
  monthsCount: number;
  onRangeChange: (count: number) => void;
}

export const MonthlyTrendChart: React.FC<Props> = ({
  trendData,
  monthsCount,
  onRangeChange
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (trendData.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        Belum ada data tren bulanan yang tersedia.
      </div>
    );
  }

  // Cari nilai maksimum total komplain untuk skala Y
  const maxTotal = Math.max(...trendData.map(d => d.total), 5);
  // Bulatkan maxTotal ke atas untuk grid
  const yAxisMax = Math.ceil(maxTotal / 5) * 5;

  const chartHeight = 220;
  const chartWidth = 680;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const barGroupWidth = innerWidth / trendData.length;
  const barWidth = Math.min(32, barGroupWidth * 0.45);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Tren Komplain Bulanan &amp; Kepatuhan SLA
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Volume komplain masuk bulanan dan persentase penyelesaian tepat waktu (Target: 3 Hari Kerja)
          </p>
        </div>

        {/* Filter Rentang Bulan */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => onRangeChange(6)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              monthsCount === 6
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            6 Bulan
          </button>
          <button
            onClick={() => onRangeChange(12)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              monthsCount === 12
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            12 Bulan
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-500" />
          <span>Selesai Tepat Waktu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-rose-500" />
          <span>Terlambat / Lewat SLA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-amber-400" />
          <span>Masih Proses</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-4 h-0.5 bg-blue-600" />
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="font-medium text-slate-700">Tingkat SLA On-Time (%)</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full min-w-[580px] h-auto select-none"
        >
          {/* Grid lines horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const val = Math.round(yAxisMax * ratio);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 tabular-nums"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Right Y-Axis Labels (0 - 100%) */}
          {[0, 50, 100].map((pct, idx) => {
            const y = paddingTop + innerHeight * (1 - pct / 100);
            return (
              <text
                key={`pct-${idx}`}
                x={chartWidth - paddingRight + 8}
                y={y + 4}
                textAnchor="start"
                className="text-[10px] fill-blue-600 font-medium tabular-nums"
              >
                {pct}%
              </text>
            );
          })}

          {/* Bars for each month */}
          {trendData.map((d, idx) => {
            const groupCenterX = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;
            const barX = groupCenterX - barWidth / 2;

            // Heights
            const totalHeight = (d.total / yAxisMax) * innerHeight;
            const onTimeHeight = (d.onTime / yAxisMax) * innerHeight;
            const lateHeight = (d.late / yAxisMax) * innerHeight;
            const prosesHeight = (d.proses / yAxisMax) * innerHeight;

            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={d.monthKey}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-opacity"
                opacity={hoveredIndex === null || isHovered ? 1 : 0.6}
              >
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={groupCenterX - barGroupWidth / 2 + 2}
                    y={paddingTop}
                    width={barGroupWidth - 4}
                    height={innerHeight}
                    fill="#F1F5F9"
                    rx="4"
                  />
                )}

                {/* Stacked Bars */}
                {/* 1. On-Time (Bottom) */}
                {onTimeHeight > 0 && (
                  <rect
                    x={barX}
                    y={paddingTop + innerHeight - onTimeHeight}
                    width={barWidth}
                    height={onTimeHeight}
                    fill="#10B981"
                    rx={lateHeight === 0 && prosesHeight === 0 ? 3 : 0}
                  />
                )}

                {/* 2. Late (Middle) */}
                {lateHeight > 0 && (
                  <rect
                    x={barX}
                    y={paddingTop + innerHeight - onTimeHeight - lateHeight}
                    width={barWidth}
                    height={lateHeight}
                    fill="#F43F5E"
                    rx={prosesHeight === 0 ? 3 : 0}
                  />
                )}

                {/* 3. In Progress (Top) */}
                {prosesHeight > 0 && (
                  <rect
                    x={barX}
                    y={paddingTop + innerHeight - totalHeight}
                    width={barWidth}
                    height={prosesHeight}
                    fill="#FBBF24"
                    rx="3"
                  />
                )}

                {/* Total count on top of bar */}
                {d.total > 0 && (
                  <text
                    x={groupCenterX}
                    y={paddingTop + innerHeight - totalHeight - 5}
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-slate-700 tabular-nums"
                  >
                    {d.total}
                  </text>
                )}

                {/* X-Axis Month Label */}
                <text
                  x={groupCenterX}
                  y={chartHeight - 14}
                  textAnchor="middle"
                  className={`text-[11px] tabular-nums ${
                    isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {d.monthLabel}
                </text>
              </g>
            );
          })}

          {/* SLA Compliance % Line connecting months */}
          {trendData.length > 1 && (
            <path
              d={trendData
                .map((d, idx) => {
                  const x = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;
                  const y = paddingTop + innerHeight * (1 - d.slaComplianceRate / 100);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dots on the SLA line */}
          {trendData.map((d, idx) => {
            const x = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;
            const y = paddingTop + innerHeight * (1 - d.slaComplianceRate / 100);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`dot-${d.monthKey}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && trendData[hoveredIndex] && (
          <div
            className="absolute top-2 right-4 bg-slate-900 text-white rounded-lg p-3 text-xs shadow-lg border border-slate-700 pointer-events-none z-20 min-w-[200px]"
          >
            <div className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between">
              <span>{trendData[hoveredIndex].monthLabel}</span>
              <span className="text-blue-300 font-mono">
                {trendData[hoveredIndex].total} Komplain
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Selesai Tepat Waktu:
                </span>
                <span className="font-semibold text-emerald-400 tabular-nums">
                  {trendData[hoveredIndex].onTime}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Terlambat (SLA Lewat):
                </span>
                <span className="font-semibold text-rose-400 tabular-nums">
                  {trendData[hoveredIndex].late}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Masih Proses:
                </span>
                <span className="font-semibold text-amber-400 tabular-nums">
                  {trendData[hoveredIndex].proses}
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between font-semibold">
                <span className="text-slate-300">Tingkat Kepatuhan SLA:</span>
                <span className="text-blue-300 tabular-nums">
                  {trendData[hoveredIndex].slaComplianceRate}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
