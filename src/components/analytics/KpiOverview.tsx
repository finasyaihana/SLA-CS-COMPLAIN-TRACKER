import React from 'react';
import { OverallKpiData } from '../../utils/analytics';
import { getCategoryInfo } from '../../utils/sla';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Flame, Layers } from 'lucide-react';

interface Props {
  kpi: OverallKpiData;
}

export const KpiOverview: React.FC<Props> = ({ kpi }) => {
  const topCatInfo = kpi.topCategory ? getCategoryInfo(kpi.topCategory.key) : null;

  // Format avg turnaround
  let avgDurationLabel = '-';
  if (kpi.avgResolutionHours > 0) {
    if (kpi.avgResolutionHours < 24) {
      avgDurationLabel = `${kpi.avgResolutionHours} jam`;
    } else {
      avgDurationLabel = `${(kpi.avgResolutionHours / 24).toFixed(1)} hari kerja`;
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Total Komplain */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Total Komplain</span>
          <Layers className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tabular-nums">
          {kpi.total}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
          <span className="text-emerald-600 font-semibold">{kpi.done} Selesai</span>
          <span>·</span>
          <span className="text-amber-600 font-semibold">{kpi.proses} Proses</span>
        </div>
      </div>

      {/* 2. SLA Compliance Rate */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Kepatuhan SLA (3 Hari)</span>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tabular-nums flex items-baseline gap-1">
          {kpi.slaComplianceRate}%
          <span className="text-xs font-normal text-slate-400">on-time</span>
        </div>
        <div className="text-[11px] text-emerald-700 font-medium mt-1">
          {kpi.onTime} komplain tepat waktu
        </div>
      </div>

      {/* 3. Lewat SLA / Terlambat */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Overdue / Terlambat</span>
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div className={`text-2xl font-bold tabular-nums ${kpi.lateOrOverdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
          {kpi.lateOrOverdue}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          {kpi.activeOverdueCount > 0 ? (
            <span className="text-rose-600 font-semibold">
              {kpi.activeOverdueCount} tiket proses lewat deadline!
            </span>
          ) : (
            'Semua proses aktif dalam target'
          )}
        </div>
      </div>

      {/* 4. Rata-rata Durasi Selesai */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Rata-rata Waktu Selesai</span>
          <Clock className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tabular-nums">
          {avgDurationLabel}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Standar target: &le; 3 Hari Kerja
        </div>
      </div>

      {/* 5. Driver Kategori Terbanyak */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Kategori Terbanyak</span>
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
        <div className="text-sm font-bold text-slate-900 truncate" title={topCatInfo?.label}>
          {topCatInfo ? topCatInfo.shortLabel : '-'}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          {kpi.topCategory ? (
            <span>
              <strong className="text-slate-800">{kpi.topCategory.count} tiket</strong> ({kpi.topCategory.share}% share)
            </span>
          ) : (
            'Belum ada data'
          )}
        </div>
      </div>
    </div>
  );
};
