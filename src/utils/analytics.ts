import { COMPLAINT_CATEGORIES, ComplaintCategory, ComplaintItem } from '../types/complaint';
import { evaluasiSLA } from './sla';

export interface MonthlyTrendItem {
  monthKey: string; // e.g. "2026-07"
  monthLabel: string; // e.g. "Jul 2026"
  total: number;
  done: number;
  proses: number;
  onTime: number;
  late: number;
  slaComplianceRate: number; // 0 - 100%
}

export interface CategoryPerformanceItem {
  key: ComplaintCategory;
  label: string;
  shortLabel: string;
  accentColor: string;
  total: number;
  done: number;
  proses: number;
  onTime: number;
  lateOrOverdue: number;
  slaRate: number; // 0 - 100%
  completionRate: number; // 0 - 100%
  avgTurnaroundHours: number;
  sharePercentage: number; // 0 - 100% of all complaints
}

export interface OverallKpiData {
  total: number;
  done: number;
  proses: number;
  onTime: number;
  lateOrOverdue: number;
  slaComplianceRate: number;
  activeOverdueCount: number;
  avgResolutionHours: number;
  topCategory: {
    key: ComplaintCategory;
    count: number;
    share: number;
  } | null;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Menghitung tren komplain bulanan
 */
export function getMonthlyTrend(items: ComplaintItem[], monthsCount = 6): MonthlyTrendItem[] {
  if (items.length === 0) return [];

  // Temukan rentang bulan dari data
  const mapMonths = new Map<string, ComplaintItem[]>();

  // Inisialisasi daftar bulan terakhir dari waktu referensi
  const referenceDate = new Date();
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    mapMonths.set(key, []);
  }

  // Masukkan item ke bulan masing-masing
  items.forEach(item => {
    const d = new Date(item.tglKomplain);
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (mapMonths.has(key)) {
        mapMonths.get(key)!.push(item);
      } else {
        // Jika data berada di luar rentang default tapi ada di dataset
        mapMonths.set(key, [item]);
      }
    }
  });

  // Urutkan key secara kronologis
  const sortedKeys = Array.from(mapMonths.keys()).sort();
  // Ambil N bulan terakhir
  const slicedKeys = sortedKeys.slice(-Math.max(monthsCount, 6));

  return slicedKeys.map(key => {
    const [yearStr, monthStr] = key.split('-');
    const mIdx = parseInt(monthStr, 10) - 1;
    const monthLabel = `${MONTH_NAMES[mIdx]} ${yearStr}`;

    const monthItems = mapMonths.get(key) || [];
    let done = 0;
    let proses = 0;
    let onTime = 0;
    let late = 0;

    monthItems.forEach(item => {
      if (item.status === 'Done') done++;
      else proses++;

      const evaluation = evaluasiSLA(item.tglKomplain, item.tglDone, item.status);
      if (evaluation.statusType === 'ON_TIME') {
        onTime++;
      } else if (evaluation.statusType === 'LATE' || evaluation.statusType === 'PROCESS_OVERDUE') {
        late++;
      }
    });

    const evaluatedDone = onTime + (done - onTime);
    const slaRate = evaluatedDone > 0 ? Math.round((onTime / evaluatedDone) * 100) : (monthItems.length > 0 ? 100 : 0);

    return {
      monthKey: key,
      monthLabel,
      total: monthItems.length,
      done,
      proses,
      onTime,
      late,
      slaComplianceRate: slaRate
    };
  });
}

/**
 * Menghitung performa penyelesaian per 9 kategori komplain
 */
export function getCategoryPerformance(items: ComplaintItem[]): CategoryPerformanceItem[] {
  const totalAll = items.length;

  return COMPLAINT_CATEGORIES.map(cat => {
    const catItems = items.filter(i => i.kategori === cat.key);
    let done = 0;
    let proses = 0;
    let onTime = 0;
    let lateOrOverdue = 0;
    let totalDurationMs = 0;
    let durationCount = 0;

    catItems.forEach(item => {
      if (item.status === 'Done') {
        done++;
        if (item.tglDone && item.tglDone !== '-') {
          const start = new Date(item.tglKomplain).getTime();
          const end = new Date(item.tglDone).getTime();
          if (end >= start) {
            totalDurationMs += (end - start);
            durationCount++;
          }
        }
      } else {
        proses++;
      }

      const evalRes = evaluasiSLA(item.tglKomplain, item.tglDone, item.status);
      if (evalRes.statusType === 'ON_TIME') {
        onTime++;
      } else if (evalRes.isBreached) {
        lateOrOverdue++;
      }
    });

    const totalEvaluatedForSla = done;
    const slaRate = totalEvaluatedForSla > 0 ? Math.round((onTime / totalEvaluatedForSla) * 100) : (catItems.length > 0 && lateOrOverdue === 0 ? 100 : 0);
    const completionRate = catItems.length > 0 ? Math.round((done / catItems.length) * 100) : 0;
    const avgTurnaroundHours = durationCount > 0 ? Math.round(totalDurationMs / (durationCount * 1000 * 60 * 60)) : 0;
    const sharePercentage = totalAll > 0 ? Math.round((catItems.length / totalAll) * 100) : 0;

    return {
      key: cat.key,
      label: cat.label,
      shortLabel: cat.shortLabel,
      accentColor: cat.accentColor,
      total: catItems.length,
      done,
      proses,
      onTime,
      lateOrOverdue,
      slaRate,
      completionRate,
      avgTurnaroundHours,
      sharePercentage
    };
  });
}

/**
 * Menghitung ringkasan KPI agregat
 */
export function getOverallKpi(items: ComplaintItem[]): OverallKpiData {
  if (items.length === 0) {
    return {
      total: 0,
      done: 0,
      proses: 0,
      onTime: 0,
      lateOrOverdue: 0,
      slaComplianceRate: 0,
      activeOverdueCount: 0,
      avgResolutionHours: 0,
      topCategory: null
    };
  }

  let done = 0;
  let proses = 0;
  let onTime = 0;
  let lateOrOverdue = 0;
  let activeOverdueCount = 0;
  let totalDurationMs = 0;
  let completedCountWithDuration = 0;

  const categoryCounts = new Map<ComplaintCategory, number>();

  items.forEach(item => {
    categoryCounts.set(item.kategori, (categoryCounts.get(item.kategori) || 0) + 1);

    if (item.status === 'Done') {
      done++;
      if (item.tglDone && item.tglDone !== '-') {
        const start = new Date(item.tglKomplain).getTime();
        const end = new Date(item.tglDone).getTime();
        if (end >= start) {
          totalDurationMs += (end - start);
          completedCountWithDuration++;
        }
      }
    } else {
      proses++;
    }

    const evalRes = evaluasiSLA(item.tglKomplain, item.tglDone, item.status);
    if (evalRes.statusType === 'ON_TIME') {
      onTime++;
    } else if (evalRes.statusType === 'LATE') {
      lateOrOverdue++;
    } else if (evalRes.statusType === 'PROCESS_OVERDUE') {
      activeOverdueCount++;
      lateOrOverdue++;
    }
  });

  const slaComplianceRate = done > 0 ? Math.round((onTime / done) * 100) : 0;
  const avgResolutionHours = completedCountWithDuration > 0
    ? Math.round(totalDurationMs / (completedCountWithDuration * 1000 * 60 * 60))
    : 0;

  // Temukan top kategori
  let topCategoryKey: ComplaintCategory = 'other';
  let topCount = 0;

  categoryCounts.forEach((count, cat) => {
    if (count > topCount) {
      topCount = count;
      topCategoryKey = cat;
    }
  });

  const topCategory = topCount > 0 ? {
    key: topCategoryKey,
    count: topCount,
    share: Math.round((topCount / items.length) * 100)
  } : null;

  return {
    total: items.length,
    done,
    proses,
    onTime,
    lateOrOverdue,
    slaComplianceRate,
    activeOverdueCount,
    avgResolutionHours,
    topCategory
  };
}
