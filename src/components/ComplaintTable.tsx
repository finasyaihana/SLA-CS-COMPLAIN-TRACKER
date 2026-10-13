import React, { useState, useMemo } from 'react';
import { COMPLAINT_CATEGORIES, ComplaintCategory, ComplaintItem } from '../types/complaint';
import { evaluasiSLA, formatWaktu, getCategoryInfo, hitungDurasi } from '../utils/sla';
import { Search, Filter, Edit3, Trash2, CheckCircle2, Clock, AlertTriangle, ArrowUpDown, Tag } from 'lucide-react';

interface Props {
  complaints: ComplaintItem[];
  onOpenUpdateModal: (item: ComplaintItem) => void;
  onDeleteComplaint: (id: string | number) => void;
  initialCategoryFilter?: string;
}

export const ComplaintTable: React.FC<Props> = ({
  complaints,
  onOpenUpdateModal,
  onDeleteComplaint,
  initialCategoryFilter = 'ALL'
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategoryFilter);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [slaFilter, setSlaFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Sync if initialCategoryFilter prop updates
  React.useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  const filteredItems = useMemo(() => {
    return complaints.filter(item => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchAgent = item.namaAgen.toLowerCase().includes(term);
        const matchIsi = item.isi.toLowerCase().includes(term);
        const matchTiket = (item.nomorTiket || '').toLowerCase().includes(term);
        const matchCat = item.kategori.toLowerCase().includes(term);
        const matchCatDetail = (item.kategoriDetail || '').toLowerCase().includes(term);
        if (!matchAgent && !matchIsi && !matchTiket && !matchCat && !matchCatDetail) {
          return false;
        }
      }

      // 2. Category filter
      if (categoryFilter !== 'ALL') {
        if (item.kategori !== categoryFilter) return false;
      }

      // 3. Status filter
      if (statusFilter !== 'ALL') {
        if (item.status !== statusFilter) return false;
      }

      // 4. SLA Indicator filter
      if (slaFilter !== 'ALL') {
        const evalRes = evaluasiSLA(item.tglKomplain, item.tglDone, item.status);
        if (slaFilter === 'ON_TIME' && evalRes.statusType !== 'ON_TIME') return false;
        if (slaFilter === 'LATE' && evalRes.statusType !== 'LATE') return false;
        if (slaFilter === 'OVERDUE' && !evalRes.isBreached) return false;
      }

      return true;
    });
  }, [complaints, searchTerm, categoryFilter, statusFilter, slaFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari agen, tiket/PNR, atau detail keluhan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="min-w-[190px]">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Kategori (9)</option>
              {COMPLAINT_CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.id}. {cat.shortLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[130px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Proses">Masih Proses</option>
              <option value="Done">Selesai (Done)</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div className="min-w-[150px]">
            <select
              value={slaFilter}
              onChange={(e) => {
                setSlaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Indikator SLA</option>
              <option value="ON_TIME">Tepat Waktu Selesai</option>
              <option value="LATE">Terlambat Selesai</option>
              <option value="OVERDUE">Semua Breached / Overdue</option>
            </select>
          </div>
        </div>

        {/* Status count info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Menampilkan <strong className="text-slate-800 tabular-nums">{filteredItems.length}</strong> data komplain
            {categoryFilter !== 'ALL' && (
              <span> · Kategori: <strong className="text-blue-600">{categoryFilter}</strong></span>
            )}
          </div>
          {(searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || slaFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setSlaFilter('ALL');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:underline cursor-pointer font-medium"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[560px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-white sticky top-0 z-10 select-none">
              <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Tgl Masuk</th>
              <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Nama Agen</th>
              <th className="py-3 px-3.5 font-semibold whitespace-nowrap">Kategori Komplain</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">No Tiket / PNR</th>
              <th className="py-3 px-4 font-semibold min-w-[200px]">Isi Komplain</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap text-center">Status</th>
              <th className="py-3 px-3.5 font-semibold whitespace-nowrap text-center">Indikator SLA (3 Hari Kerja)</th>
              <th className="py-3 px-4 font-semibold min-w-[180px]">Catatan / Update</th>
              <th className="py-3 px-3 font-semibold text-center whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-slate-300" />
                    <span>Tidak ada data komplain yang sesuai dengan filter pencarian.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((k) => {
                const evalResult = evaluasiSLA(k.tglKomplain, k.tglDone, k.status);
                const catInfo = getCategoryInfo(k.kategori);

                return (
                  <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Tgl Masuk */}
                    <td className="py-3 px-3.5 text-slate-600 font-mono whitespace-nowrap align-top">
                      {formatWaktu(k.tglKomplain)}
                    </td>

                    {/* Nama Agen */}
                    <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap align-top">
                      {k.namaAgen}
                    </td>

                    {/* Kategori Komplain (REPLACING REQUEST COLUMN) */}
                    <td className="py-3 px-3.5 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${catInfo.badgeBg}`}
                        >
                          {catInfo.id}. {catInfo.shortLabel}
                        </span>
                        {k.kategoriDetail && (
                          <span className="text-[10px] text-slate-500 italic">
                            Detail: {k.kategoriDetail}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* No Tiket / PNR */}
                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap align-top">
                      {k.nomorTiket || '-'}
                    </td>

                    {/* Isi Komplain */}
                    <td className="py-3 px-4 text-slate-800 leading-relaxed align-top">
                      {k.isi}
                    </td>

                    {/* Status & Selesai */}
                    <td className="py-3 px-3 text-center align-top whitespace-nowrap">
                      {k.status === 'Done' ? (
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Done
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {formatWaktu(k.tglDone)}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Proses
                        </span>
                      )}
                    </td>

                    {/* Indikator SLA */}
                    <td className="py-3 px-3.5 text-center align-top whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${evalResult.badgeClass}`}
                      >
                        {evalResult.label}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Target: {formatWaktu(evalResult.targetDeadline)}
                      </div>
                    </td>

                    {/* Catatan / Update */}
                    <td className="py-3 px-4 text-slate-600 align-top">
                      <div
                        className="max-h-20 overflow-y-auto text-[11px] space-y-0.5"
                        dangerouslySetInnerHTML={{ __html: k.catatan || '-' }}
                      />
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-3 text-center align-top whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenUpdateModal(k)}
                          title="Update Status / Catatan"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data komplain agen "${k.namaAgen}"?`)) {
                              onDeleteComplaint(k.id);
                            }
                          }}
                          title="Hapus Data"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Halaman <strong className="text-slate-800">{currentPage}</strong> dari{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
