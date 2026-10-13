import React, { useState, useEffect } from 'react';
import { COMPLAINT_CATEGORIES, ComplaintCategory, ComplaintItem } from '../types/complaint';
import { formatWaktu } from '../utils/sla';
import { PlusCircle, FileText, User, Tag, Ticket, Clock, Check, AlertCircle } from 'lucide-react';

interface Props {
  onAddComplaint: (newComplaint: ComplaintItem) => void;
}

export const ComplaintForm: React.FC<Props> = ({ onAddComplaint }) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [namaAgen, setNamaAgen] = useState<string>('');
  const [kategori, setKategori] = useState<ComplaintCategory>('Issued Tiket lama');
  const [kategoriDetail, setKategoriDetail] = useState<string>('');
  const [nomorTiket, setNomorTiket] = useState<string>('');
  const [isi, setIsi] = useState<string>('');
  const [catatanAwal, setCatatanAwal] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentDateTime(new Date().toISOString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaAgen.trim() || !isi.trim()) {
      return;
    }

    const now = new Date().toISOString();
    const initialNotes = catatanAwal.trim()
      ? `[${formatWaktu(now)}] ${catatanAwal.trim()}`
      : '-';

    const newRecord: ComplaintItem = {
      id: Date.now(),
      tglKomplain: now,
      namaAgen: namaAgen.trim(),
      kategori,
      kategoriDetail: kategori === 'other' && kategoriDetail.trim() ? kategoriDetail.trim() : undefined,
      nomorTiket: nomorTiket.trim() || undefined,
      isi: isi.trim(),
      status: 'Proses',
      tglDone: '-',
      catatan: initialNotes
    };

    onAddComplaint(newRecord);

    // Reset form
    setNamaAgen('');
    setNomorTiket('');
    setIsi('');
    setCatatanAwal('');
    setKategoriDetail('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Form Input Komplain Baru
            </h3>
            <p className="text-xs text-slate-500">
              Target SLA otomatis: 3 Hari Kerja (Sen-Jum 09:20-16:25, Sab 09:20-11:55)
            </p>
          </div>
        </div>

        {isSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            Komplain Berhasil Disimpan!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Tanggal & Jam (Auto) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Tgl &amp; Jam Masuk (Auto):
            </label>
            <input
              type="text"
              readOnly
              value={formatWaktu(currentDateTime)}
              className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-700 cursor-not-allowed select-none"
            />
          </div>

          {/* 2. Nama Agen / PIC */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Agen / PIC Penerima: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Rian Tour / Ags-CS"
              value={namaAgen}
              onChange={(e) => setNamaAgen(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 3. Kategori Komplain (DROPDOWN WAJIB) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Kategori Komplain: <span className="text-rose-500">*</span>
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as ComplaintCategory)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.id}. {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baris Opsional: Jika "other" dipilih ATAU No Tiket/PNR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kategori === 'other' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan Kategori Lainnya (Khusus Other):
              </label>
              <input
                type="text"
                placeholder="Sebutkan jenis kendala spesifik..."
                value={kategoriDetail}
                onChange={(e) => setKategoriDetail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-slate-400" />
                Nomor Tiket / PNR / Booking Code (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: GA-892109 / PNR: 4X9KZP"
                value={nomorTiket}
                onChange={(e) => setNomorTiket(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {kategori === 'other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-slate-400" />
                Nomor Tiket / PNR (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: GA-892109 / PNR: 4X9KZP"
                value={nomorTiket}
                onChange={(e) => setNomorTiket(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* 4. Isi Komplain */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Isi Komplain / Rincian Kendala: <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            placeholder="Jelaskan detail kronologi, kendala penumpang/agen, dan permintaan tindakan..."
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* 5. Catatan Awal (Opsional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Update / Catatan Awal Tindakan (Opsional):
          </label>
          <input
            type="text"
            placeholder="Misal: Sudah diteruskan ke tim ticketing / Helpdesk maskapai..."
            value={catatanAwal}
            onChange={(e) => setCatatanAwal(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Simpan Komplain Baru
          </button>
        </div>
      </form>
    </div>
  );
};
