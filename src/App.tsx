import React, { useState, useEffect, useMemo } from 'react';
import { ComplaintCategory, ComplaintItem } from './types/complaint';
import { getStoredComplaints, saveStoredComplaints, resetToSeedData } from './utils/seedData';
import { getCategoryPerformance, getMonthlyTrend, getOverallKpi } from './utils/analytics';
import { formatWaktu } from './utils/sla';
import { KpiOverview } from './components/analytics/KpiOverview';
import { MonthlyTrendChart } from './components/analytics/MonthlyTrendChart';
import { CategoryPerformanceView } from './components/analytics/CategoryPerformanceView';
import { CategoryDonutChart } from './components/analytics/CategoryDonutChart';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTable } from './components/ComplaintTable';
import { UpdateStatusModal } from './components/UpdateStatusModal';
import { ExportModal } from './components/ExportModal';
import {
  FileSpreadsheet,
  Download,
  BarChart3,
  ListFilter,
  PlusCircle,
  RotateCcw,
  Clock,
  Layers,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [activeTab, setActiveTab] = useState<'records' | 'analytics' | 'export'>('records');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [trendMonthsCount, setTrendMonthsCount] = useState<number>(6);

  // Modals state
  const [editingComplaint, setEditingComplaint] = useState<ComplaintItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(true);

  // Load complaints from localStorage
  useEffect(() => {
    const data = getStoredComplaints();
    setComplaints(data);
  }, []);

  // Sync state to storage
  const handleUpdateList = (newItems: ComplaintItem[]) => {
    setComplaints(newItems);
    saveStoredComplaints(newItems);
  };

  const handleAddComplaint = (newComp: ComplaintItem) => {
    const updated = [newComp, ...complaints];
    handleUpdateList(updated);
  };

  const handleSaveUpdatedComplaint = (updatedItem: ComplaintItem) => {
    const updated = complaints.map(c => (c.id === updatedItem.id ? updatedItem : c));
    handleUpdateList(updated);
  };

  const handleDeleteComplaint = (id: string | number) => {
    const updated = complaints.filter(c => c.id !== id);
    handleUpdateList(updated);
  };

  const handleResetData = () => {
    if (confirm('Yakin ingin mereset seluruh data kembali ke data standar contoh? Tindakan ini tidak dapat dibatalkan.')) {
      const reset = resetToSeedData();
      setComplaints(reset);
    }
  };

  // Analytics derivations
  const kpiData = useMemo(() => getOverallKpi(complaints), [complaints]);
  const monthlyTrends = useMemo(() => getMonthlyTrend(complaints, trendMonthsCount), [complaints, trendMonthsCount]);
  const categoryPerformance = useMemo(() => getCategoryPerformance(complaints), [complaints]);

  // Click on category from chart jumps to table filtered by category
  const handleSelectCategoryFromChart = (catKey: string) => {
    setSelectedCategoryFilter(catKey);
    setActiveTab('records');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Top Header Contract */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              CS
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Rekapan &amp; SLA Komplain CS
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block whitespace-nowrap">
                Monitoring Komplain Agen · Tiket &amp; Freshnel
              </p>
            </div>
          </div>

          {/* Operational Hours Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Target SLA: <strong className="text-white">3 Hari Kerja</strong></span>
            <span className="text-slate-500">·</span>
            <span>Sen-Jum (09.20-16.25) · Sab (09.20-11.55)</span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Periode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Overview Summary Banner */}
        <KpiOverview kpi={kpiData} />

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'records'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-blue-600" />
              <span>Daftar Rekapan Komplain</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                {complaints.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Analisis Tren &amp; Performa Visual</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor &amp; Download Periode</span>
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-2 text-xs">
            {activeTab === 'records' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showForm ? 'Sembunyikan Form' : 'Buka Form Input'}</span>
              </button>
            )}

            <button
              onClick={handleResetData}
              title="Reset ke contoh data standar"
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
          </div>
        </div>

        {/* TAB 1: REKAPAN KOMPLAIN */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Form Input Komplain (Collapsible) */}
            {showForm && (
              <ComplaintForm onAddComplaint={handleAddComplaint} />
            )}

            {/* Tabel Data Rekapan */}
            <ComplaintTable
              complaints={complaints}
              onOpenUpdateModal={(item) => setEditingComplaint(item)}
              onDeleteComplaint={handleDeleteComplaint}
              initialCategoryFilter={selectedCategoryFilter}
            />
          </div>
        )}

        {/* TAB 2: ANALISIS & TREN VISUAL */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Insight info header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900">
                    Pusat Analisis Visual SLA Customer Service:
                  </span>{' '}
                  <span className="text-slate-600">
                    Kepatuhan SLA keseluruhan saat ini berada pada angka{' '}
                    <strong className="text-blue-700 font-semibold">{kpiData.slaComplianceRate}%</strong>, dengan rata-rata
                    waktu penyelesaian{' '}
                    <strong className="text-blue-700 font-semibold">
                      {kpiData.avgResolutionHours < 24
                        ? `${kpiData.avgResolutionHours} jam`
                        : `${(kpiData.avgResolutionHours / 24).toFixed(1)} hari kerja`}
                    </strong>.
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Klik kategori pada grafik untuk memfilter tabel komplain
              </div>
            </div>

            {/* Chart 1: Tren Komplain Bulanan */}
            <MonthlyTrendChart
              trendData={monthlyTrends}
              monthsCount={trendMonthsCount}
              onRangeChange={setTrendMonthsCount}
            />

            {/* Split Row: Donut Chart + Category Performance List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <CategoryDonutChart
                  data={categoryPerformance}
                  onSelectCategory={handleSelectCategoryFromChart}
                />
              </div>

              <div className="lg:col-span-8">
                <CategoryPerformanceView
                  data={categoryPerformance}
                  onSelectCategory={handleSelectCategoryFromChart}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EKSPOR & DOWNLOAD PERIODE */}
        {activeTab === 'export' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Pusat Ekspor &amp; Unduh Laporan Periode
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Unduh rekap data komplain CS untuk keperluan audit SLA, rapat mingguan, evaluasi maskapai, atau rekonsiliasi finance.
              </p>
            </div>

            {/* Shortcut Export Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-700">Ekspor Cepat</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">Rekap Periode Kustom</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pilih rentang tanggal tertentu atau preset bulan ini/lalu dengan evaluasi SLA.
                  </p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Buka Opsi Periode
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-700">Format Spreadsheet</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">Microsoft Excel (.xls)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Dilengkapi header terstruktur, styling warna status, ringkasan KPI, dan durasi pengerjaan.
                  </p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Download Excel
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700">Universal CSV</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">Data CSV (.csv)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Mudah diimpor langsung ke Google Sheets, database internal, atau visualisasi BI.
                  </p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Download CSV
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-purple-300 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-700">File Mandiri (Offline)</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">Standalone HTML</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Versi 1-file utuh yang dapat dibuka langsung di browser manapun tanpa instalasi server.
                  </p>
                </div>
                <a
                  href="/standalone_aplikasi_komplain_sla.html"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-semibold text-xs py-2 px-3 rounded-lg transition-colors block cursor-pointer"
                >
                  Buka Standalone HTML
                </a>
              </div>
            </div>

            {/* Quick Summary Table inside export view */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 mb-3">
                Ringkasan Data Komplain per Kategori yang Tersimpan ({complaints.length} Total):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categoryPerformance.map(cat => (
                  <div
                    key={cat.key}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-700 truncate pr-2">
                      {cat.shortLabel}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {cat.total}
                      </span>
                      <span className="text-slate-400">tiket</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit/Update Status Modal */}
      {editingComplaint && (
        <UpdateStatusModal
          complaint={editingComplaint}
          isOpen={true}
          onClose={() => setEditingComplaint(null)}
          onSave={handleSaveUpdatedComplaint}
        />
      )}

      {/* Download/Export Period Modal */}
      <ExportModal
        complaints={complaints}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
