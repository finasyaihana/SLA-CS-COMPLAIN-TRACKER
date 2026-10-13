import React, { useState } from 'react';
import { CategoryPerformanceItem } from '../../utils/analytics';
import { BarChart3, CheckCircle2, AlertCircle, Clock, ArrowUpDown, ChevronDown } from 'lucide-react';

interface Props {
  data: CategoryPerformanceItem[];
  onSelectCategory?: (categoryKey: string) => void;
}

export const CategoryPerformanceView: React.FC<Props> = ({ data, onSelectCategory }) => {
  const [sortBy, setSortBy] = useState<'default' | 'volume' | 'sla_lowest' | 'sla_highest'>('volume');

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'volume') {
      return b.total - a.total;
    }
    if (sortBy === 'sla_lowest') {
      return a.slaRate - b.slaRate;
    }
    if (sortBy === 'sla_highest') {
      return b.slaRate - a.slaRate;
    }
    // Default by category standard ID
    return 0;
  });

  const maxCategoryTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Performa Penyelesaian Per Kategori Komplain
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis volume kendala, kepatuhan target SLA 3 hari kerja, dan rata-rata durasi penyelesaian
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Urutkan:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 pr-8 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="volume">Volume Terbanyak</option>
              <option value="sla_lowest">SLA Paling Rendah (Perlu Perhatian)</option>
              <option value="sla_highest">SLA Tertinggi (Paling Optimal)</option>
              <option value="default">Urutan Standar Kategori (1 - 9)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid of 9 Categories */}
      <div className="space-y-3.5">
        {sortedData.map((item, idx) => {
          const isBottleneck = item.total > 0 && item.slaRate < 75;
          const isHighPerformer = item.total > 0 && item.slaRate >= 90;
          const volumeRatio = (item.total / maxCategoryTotal) * 100;

          // Format average turnaround
          let turnaroundLabel = '-';
          if (item.done > 0 && item.avgTurnaroundHours > 0) {
            if (item.avgTurnaroundHours < 24) {
              turnaroundLabel = `${item.avgTurnaroundHours} jam`;
            } else {
              turnaroundLabel = `${(item.avgTurnaroundHours / 24).toFixed(1)} hari`;
            }
          }

          return (
            <div
              key={item.key}
              onClick={() => onSelectCategory && onSelectCategory(item.key)}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all bg-slate-50/50 group cursor-pointer"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.accentColor }}
                  />
                  <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </span>
                  {item.total > 0 && (
                    <span className="text-xs text-slate-500 tabular-nums font-mono">
                      ({item.sharePercentage}% dari total)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  {/* Total Volume */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Total:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {item.total} tiket
                    </span>
                  </div>

                  {/* Avg Turnaround */}
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Rata-rata:</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {turnaroundLabel}
                    </span>
                  </div>

                  {/* SLA Rate Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border ${
                      item.total === 0
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : isHighPerformer
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isBottleneck
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    SLA: {item.total === 0 ? '-' : `${item.slaRate}%`}
                  </div>
                </div>
              </div>

              {/* Progress & Breakdown Bar */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  {item.total > 0 ? (
                    <>
                      {/* On time */}
                      <div
                        style={{ width: `${(item.onTime / item.total) * 100}%` }}
                        className="bg-emerald-500 h-full transition-all"
                        title={`Selesai Tepat Waktu: ${item.onTime}`}
                      />
                      {/* Late */}
                      <div
                        style={{ width: `${(item.lateOrOverdue / item.total) * 100}%` }}
                        className="bg-rose-500 h-full transition-all"
                        title={`Terlambat: ${item.lateOrOverdue}`}
                      />
                      {/* In Progress */}
                      <div
                        style={{
                          width: `${Math.max(
                            0,
                            ((item.proses - (item.lateOrOverdue - item.done > 0 ? item.lateOrOverdue - item.done : 0)) /
                              item.total) *
                              100
                          )}%`
                        }}
                        className="bg-amber-400 h-full transition-all"
                        title={`Masih Proses: ${item.proses}`}
                      />
                    </>
                  ) : (
                    <div className="w-full bg-slate-100 h-full" />
                  )}
                </div>

                {/* Sub text breakdown */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Tepat Waktu: <strong className="text-slate-800 tabular-nums">{item.onTime}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Terlambat: <strong className="text-slate-800 tabular-nums">{item.lateOrOverdue}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Proses: <strong className="text-slate-800 tabular-nums">{item.proses}</strong>
                    </span>
                  </div>

                  <span className="text-slate-400">
                    Selesai: {item.completionRate}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
