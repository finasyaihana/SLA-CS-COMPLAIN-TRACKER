import React, { useState, useMemo } from 'react';
import { COMPLAINT_CATEGORIES, ComplaintCategory, ComplaintItem } from '../types/complaint';
import { downloadCsvFile, downloadExcelFile, filterComplaintsByPeriod } from '../utils/exportExcel';
import { formatTanggal, formatWaktu } from '../utils/sla';
import { FileSpreadsheet, Download, Calendar, Filter, X, CheckCircle, FileText } from 'lucide-react';

interface Props {
  complaints: ComplaintItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({
  complaints,
  isOpen,
  onClose
}) => {
  const [preset, setPreset] = useState<'all' | 'today' | '7days' | '30days' | 'this_month' | 'last_month' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Kalkulasi rentang tanggal otomatis saat preset berubah
  const handlePresetChange = (newPreset: typeof preset) => {
    setPreset(newPreset);
    const now = new Date();

    if (newPreset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (newPreset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (newPreset === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (newPreset === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (newPreset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (newPreset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const periodLabel = useMemo(() => {
    if (preset === 'all') return 'Semua Data';
    if (preset === 'today') return `Hari Ini (${startDate})`;
    if (preset === 'this_month') return 'Bulan Ini';
    if (preset === 'last_month') return 'Bulan Lalu';
    if (preset === '7days') return '7 Hari Terakhir';
    if (preset === '30days') return '30 Hari Terakhir';
    return `${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`;
  }, [preset, startDate, endDate]);

  const filteredItems = useMemo(() => {
    return filterComplaintsByPeriod(complaints, {
      startDate: preset === 'all' ? undefined : startDate,
      endDate: preset === 'all' ? undefined : endDate,
      category: categoryFilter,
      status: statusFilter
    });
  }, [complaints, preset, startDate, endDate, categoryFilter, statusFilter]);

  if (!isOpen) return null;

  const handleDownloadExcel = () => {
    try {
      downloadExcelFile(complaints, {
        periodLabel,
        startDate: preset === 'all' ? undefined : startDate,
        endDate: preset === 'all' ? undefined : endDate,
        categoryFilter,
        statusFilter
      });
      setExportSuccess('File Excel (.xls) berhasil diunduh!');
      setTimeout(() => setExportSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh file!');
    }
  };

  const handleDownloadCsv = () => {
    try {
      downloadCsvFile(complaints, {
        periodLabel,
        startDate: preset === 'all' ? undefined : startDate,
        endDate: preset === 'all' ? undefined : endDate,
        categoryFilter,
        statusFilter
      });
      setExportSuccess('File CSV (.csv) berhasil diunduh!');
      setTimeout(() => setExportSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh file!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Download Rekap Data Komplain Berdasarkan Periode
              </h3>
              <p className="text-xs text-slate-500">
                Pilih rentang tanggal, kategori, dan format file laporan yang diinginkan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-6 space-y-4">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Pilih Periode Waktu:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'this_month', label: 'Bulan Ini' },
                { id: 'last_month', label: 'Bulan Lalu' },
                { id: '7days', label: '7 Hari Terakhir' },
                { id: '30days', label: '30 Hari Terakhir' },
                { id: 'all', label: 'Semua Data' },
                { id: 'custom', label: 'Kustom Tanggal' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePresetChange(item.id as any)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    preset === item.id
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold ring-1 ring-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date pickers (Shown when not 'all') */}
          {preset !== 'all' && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Filter Tambahan (Kategori & Status) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Kategori:
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua 9 Kategori</option>
                {COMPLAINT_CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>
                    {c.id}. {c.shortLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua Status (Done &amp; Proses)</option>
                <option value="Done">Hanya Selesai (Done)</option>
                <option value="Proses">Hanya Masih Proses</option>
              </select>
            </div>
          </div>

          {/* Status Preview Bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs">
            <div className="text-slate-700">
              Periode: <strong className="text-blue-900">{periodLabel}</strong>
            </div>
            <div className="font-semibold text-blue-900 tabular-nums">
              {filteredItems.length} data komplain siap diunduh
            </div>
          </div>

          {exportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {exportSuccess}
            </div>
          )}

          {/* Download Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={filteredItems.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel (.xls)
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={filteredItems.length === 0}
              className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FileText className="w-4 h-4" />
              Download CSV (.csv)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
