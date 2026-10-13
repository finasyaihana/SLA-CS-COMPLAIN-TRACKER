export type ComplaintCategory =
  | 'Komunikasi agen dengan freshnel'
  | 'Ketidaksesuaian order dari agen'
  | 'Time limit schedule maju'
  | 'Issued Tiket lama'
  | 'Revisi tidak keluar-keluar dari Maskapai'
  | 'Insertname tikda keluar2'
  | 'Request New Booking tidak keluar2'
  | 'Invoicing'
  | 'other';

export interface CategoryInfo {
  id: number;
  key: ComplaintCategory;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  description: string;
}

export const COMPLAINT_CATEGORIES: CategoryInfo[] = [
  {
    id: 1,
    key: 'Komunikasi agen dengan freshnel',
    label: 'Komunikasi agen dengan freshnel',
    shortLabel: 'Komunikasi Freshnel',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-700',
    accentColor: '#2563eb',
    description: 'Kendala komunikasi, lambat respon, atau miskomunikasi antara agen dan CS/Freshnel'
  },
  {
    id: 2,
    key: 'Ketidaksesuaian order dari agen',
    label: 'Ketidaksesuaian order dari agen',
    shortLabel: 'Ketidaksesuaian Order',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    accentColor: '#d97706',
    description: 'Data penumpang, rute, atau tanggal yang diinput agen berbeda dengan request tiket'
  },
  {
    id: 3,
    key: 'Time limit schedule maju',
    label: 'Time limit schedule maju',
    shortLabel: 'Time Limit Maju',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    accentColor: '#e11d48',
    description: 'Batas waktu pembayaran atau issued dipercepat oleh maskapai penerbangan'
  },
  {
    id: 4,
    key: 'Issued Tiket lama',
    label: 'Issued Tiket lama',
    shortLabel: 'Issued Tiket Lama',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-700',
    accentColor: '#9333ea',
    description: 'Proses penerbitan tiket memakan waktu melebihi batas standar operasional'
  },
  {
    id: 5,
    key: 'Revisi tidak keluar-keluar dari Maskapai',
    label: 'Revisi tidak keluar-keluar dari Maskapai',
    shortLabel: 'Revisi Maskapai Mandek',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
    accentColor: '#4f46e5',
    description: 'Permohonan koreksi/revisi nama, rute, atau tanggal terhambat di pihak maskapai'
  },
  {
    id: 6,
    key: 'Insertname tikda keluar2',
    label: 'Insertname tikda keluar2',
    shortLabel: 'Insert Name Lambat',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    badgeText: 'text-cyan-700',
    accentColor: '#0891b2',
    description: 'Proses input nama penumpang pada sistem booking PNR tertunda/belum terkonfirmasi'
  },
  {
    id: 7,
    key: 'Request New Booking tidak keluar2',
    label: 'Request New Booking tidak keluar2',
    shortLabel: 'New Booking Lambat',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeText: 'text-teal-700',
    accentColor: '#0d9488',
    description: 'Permintaan pembuatan reservasi atau booking baru terhambat atau antrian panjang'
  },
  {
    id: 8,
    key: 'Invoicing',
    label: 'Invoicing',
    shortLabel: 'Invoicing / Tagihan',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    accentColor: '#059669',
    description: 'Faktur, kuitansi tagihan, invoice refund, atau selisih nominal pembayaran'
  },
  {
    id: 9,
    key: 'other',
    label: 'other',
    shortLabel: 'Other / Lainnya',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    accentColor: '#64748b',
    description: 'Keluhan di luar 8 kategori utama (bisa diisi detail keterangan tambahan)'
  }
];

export type SLAStatusType =
  | 'ON_TIME'
  | 'LATE'
  | 'PROCESS_ON_TRACK'
  | 'PROCESS_OVERDUE';

export interface SLAEvaluation {
  statusType: SLAStatusType;
  label: string;
  badgeClass: string;
  targetDeadline: Date;
  isBreached: boolean;
  isCompleted: boolean;
  remainingOrElapsedDays: number;
}

export interface ComplaintItem {
  id: number | string;
  tglKomplain: string; // ISO string
  namaAgen: string;
  kategori: ComplaintCategory;
  kategoriDetail?: string; // Optional custom detail, especially for 'other'
  nomorTiket?: string; // Kode booking / PNR / No Tiket
  isi: string;
  status: 'Proses' | 'Done';
  tglDone: string; // ISO string or '-'
  catatan: string; // activity notes log (can include timestamps)
}

export interface DateRangeFilter {
  preset: 'all' | 'today' | '7days' | '30days' | 'this_month' | 'last_month' | 'custom';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}
