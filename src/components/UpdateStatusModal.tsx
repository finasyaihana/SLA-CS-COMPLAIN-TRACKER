import React, { useState } from 'react';
import { ComplaintItem } from '../types/complaint';
import { evaluasiSLA, formatWaktu } from '../utils/sla';
import { X, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react';

interface Props {
  complaint: ComplaintItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ComplaintItem) => void;
}

export const UpdateStatusModal: React.FC<Props> = ({
  complaint,
  isOpen,
  onClose,
  onSave
}) => {
  const [status, setStatus] = useState<'Proses' | 'Done'>(complaint.status);
  const [newCatatan, setNewCatatan] = useState<string>('');

  if (!isOpen) return null;

  const evaluation = evaluasiSLA(complaint.tglKomplain, complaint.tglDone, complaint.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedTglDone = complaint.tglDone;
    if (status === 'Done' && (complaint.status !== 'Done' || !complaint.tglDone || complaint.tglDone === '-')) {
      updatedTglDone = new Date().toISOString();
    } else if (status === 'Proses') {
      updatedTglDone = '-';
    }

    let updatedCatatan = complaint.catatan;
    if (newCatatan.trim()) {
      const nowStr = formatWaktu(new Date());
      const appendStr = `[${nowStr}] ${newCatatan.trim()}`;
      updatedCatatan = updatedCatatan === '-' ? appendStr : `${updatedCatatan}<br>${appendStr}`;
    }

    const updatedItem: ComplaintItem = {
      ...complaint,
      status,
      tglDone: updatedTglDone,
      catatan: updatedCatatan
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Update Status &amp; Catatan Tindakan
            </h3>
            <p className="text-xs text-slate-500">
              {complaint.namaAgen} · {complaint.kategori}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Detail Informasi Singkat */}
          <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal Masuk:</span>
              <span className="font-medium text-slate-800">{formatWaktu(complaint.tglKomplain)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target SLA (3 Hari Kerja):</span>
              <span className="font-medium text-slate-800">{formatWaktu(evaluation.targetDeadline)}</span>
            </div>
            {complaint.nomorTiket && (
              <div className="flex justify-between">
                <span className="text-slate-500">No. Tiket / PNR:</span>
                <span className="font-mono font-medium text-slate-800">{complaint.nomorTiket}</span>
              </div>
            )}
            <div className="pt-1 border-t border-slate-200 text-slate-700">
              <strong>Isi Kendala:</strong> {complaint.isi}
            </div>
          </div>

          {/* Pilih Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ubah Status Komplain:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Proses')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  status === 'Proses'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                Masih Proses
              </button>

              <button
                type="button"
                onClick={() => setStatus('Done')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  status === 'Done'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Selesai (Done)
              </button>
            </div>
          </div>

          {/* Riwayat Catatan Sebelumnya */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Riwayat Tindakan:
            </label>
            <div
              className="max-h-28 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 space-y-1"
              dangerouslySetInnerHTML={{ __html: complaint.catatan || 'Belum ada catatan.' }}
            />
          </div>

          {/* Tambah Catatan Baru */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tambah Catatan / Update Terbaru:
            </label>
            <textarea
              rows={2}
              placeholder="Masukkan kronologi update, hasil koordinasi dengan maskapai atau agen..."
              value={newCatatan}
              onChange={(e) => setNewCatatan(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Tombol */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
