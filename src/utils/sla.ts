import { ComplaintCategory, COMPLAINT_CATEGORIES, SLAEvaluation, SLAStatusType } from '../types/complaint';

/**
 * Jam Operasional:
 * - Senin - Jumat: 09:20 - 16:25
 * - Sabtu: 09:20 - 11:55
 * - Minggu: Libur
 * Target SLA: 3 Hari Kerja
 */

/**
 * Menghitung batas waktu target SLA (3 Hari Kerja).
 * Hari Minggu (0) tidak dihitung.
 * Senin - Sabtu dihitung sebagai hari kerja.
 */
export function hitungTargetSLA(startDateStr: string): Date {
  const start = new Date(startDateStr);
  let daysAdded = 0;
  const curr = new Date(start);

  while (daysAdded < 3) {
    curr.setDate(curr.getDate() + 1);
    const dayOfWeek = curr.getDay(); // 0 = Minggu
    if (dayOfWeek !== 0) {
      daysAdded++;
    }
  }
  return curr;
}

/**
 * Mengevaluasi pemenuhan target SLA 3 Hari Kerja.
 */
export function evaluasiSLA(
  startDateStr: string,
  doneDateStr: string | undefined,
  status: 'Proses' | 'Done',
  referenceNow: Date = new Date()
): SLAEvaluation {
  const targetDeadline = hitungTargetSLA(startDateStr);

  if (status === 'Done') {
    const doneDate = doneDateStr && doneDateStr !== '-' ? new Date(doneDateStr) : new Date();
    const isCompletedOnTime = doneDate <= targetDeadline;

    if (isCompletedOnTime) {
      return {
        statusType: 'ON_TIME',
        label: 'Terpenuhi (Tepat Waktu)',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        targetDeadline,
        isBreached: false,
        isCompleted: true,
        remainingOrElapsedDays: 0
      };
    } else {
      return {
        statusType: 'LATE',
        label: 'Tidak Terpenuhi (Terlambat)',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        targetDeadline,
        isBreached: true,
        isCompleted: true,
        remainingOrElapsedDays: 0
      };
    }
  } else {
    // Masih Proses
    const isCurrentlyOnTrack = referenceNow <= targetDeadline;

    if (isCurrentlyOnTrack) {
      return {
        statusType: 'PROCESS_ON_TRACK',
        label: 'Masih Proses (Dalam Target)',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        targetDeadline,
        isBreached: false,
        isCompleted: false,
        remainingOrElapsedDays: Math.ceil((targetDeadline.getTime() - referenceNow.getTime()) / (1000 * 60 * 60 * 24))
      };
    } else {
      return {
        statusType: 'PROCESS_OVERDUE',
        label: 'Masih Proses (Lewat Target)',
        badgeClass: 'bg-red-100 text-red-800 border border-red-300 font-semibold',
        targetDeadline,
        isBreached: true,
        isCompleted: false,
        remainingOrElapsedDays: Math.floor((referenceNow.getTime() - targetDeadline.getTime()) / (1000 * 60 * 60 * 24))
      };
    }
  }
}

/**
 * Format tanggal dan waktu menjadi DD-MM-YYYY HH:mm
 */
export function formatWaktu(dateObj: string | Date | undefined): string {
  if (!dateObj || dateObj === '-') return '-';
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '-';
  const tgl = String(d.getDate()).padStart(2, '0');
  const bln = String(d.getMonth() + 1).padStart(2, '0');
  const thn = d.getFullYear();
  const jam = String(d.getHours()).padStart(2, '0');
  const mnt = String(d.getMinutes()).padStart(2, '0');
  return `${tgl}-${bln}-${thn} ${jam}:${mnt}`;
}

/**
 * Format tanggal saja: DD-MM-YYYY
 */
export function formatTanggal(dateObj: string | Date | undefined): string {
  if (!dateObj || dateObj === '-') return '-';
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '-';
  const tgl = String(d.getDate()).padStart(2, '0');
  const bln = String(d.getMonth() + 1).padStart(2, '0');
  const thn = d.getFullYear();
  return `${tgl}-${bln}-${thn}`;
}

/**
 * Mendapatkan CategoryInfo berdasarkan key kategori
 */
export function getCategoryInfo(categoryKey: ComplaintCategory) {
  const match = COMPLAINT_CATEGORIES.find(c => c.key === categoryKey);
  if (match) return match;
  return {
    id: 9,
    key: 'other' as ComplaintCategory,
    label: categoryKey || 'other',
    shortLabel: categoryKey || 'other',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    accentColor: '#64748b',
    description: ''
  };
}

/**
 * Menghitung durasi pengerjaan dalam jam atau hari
 */
export function hitungDurasi(startDateStr: string, endDateStr: string): string {
  if (!endDateStr || endDateStr === '-') return '-';
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return '0 jam';
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `${diffHours} jam`;
  }
  const days = (diffHours / 24).toFixed(1);
  return `${days} hari`;
}
