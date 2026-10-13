import { ComplaintCategory, ComplaintItem } from '../types/complaint';

const STORAGE_KEY = 'sla_complains_v3';
const LEGACY_STORAGE_KEY = 'sla_complains_v2';

// 9 Kategori yang ditentukan:
// 1. Komunikasi agen dengan freshnel
// 2. Ketidaksesuaian order dari agen
// 3. Time limit schedule maju
// 4. Issued Tiket lama
// 5. Revisi tidak keluar-keluar dari Maskapai
// 6. Insertname tikda keluar2
// 7. Request New Booking tidak keluar2
// 8. Invoicing
// 9. other

const INITIAL_SEED_DATA: ComplaintItem[] = [
  {
    id: 101,
    tglKomplain: '2026-07-04T09:45:00.000Z',
    namaAgen: 'Rian Travel Mandiri',
    kategori: 'Issued Tiket lama',
    nomorTiket: 'GA-892109',
    isi: 'Tiket Garuda CGK-DPS sudah lunas dari 4 jam lalu tapi status issued belum selesai di portal.',
    status: 'Done',
    tglDone: '2026-07-05T14:30:00.000Z',
    catatan: '[04-07-2026 10:15] Diteruskan ke tim ticketing. [05-07-2026 14:30] Tiket berhasil issued dan dikirim ke email agen.'
  },
  {
    id: 102,
    tglKomplain: '2026-07-12T11:20:00.000Z',
    namaAgen: 'Indo Tour & Travel',
    kategori: 'Time limit schedule maju',
    nomorTiket: 'QG-55102',
    isi: 'Time limit Citilink dimajukan 6 jam lebih awal oleh maskapai tanpa ada notif SMS ke pax.',
    status: 'Done',
    tglDone: '2026-07-14T09:00:00.000Z',
    catatan: '[12-07-2026 12:00] Koordinasi ke helpdesk Citilink. [14-07-2026 09:00] Berhasil minta extend time limit 3 jam & agen sudah bayar.'
  },
  {
    id: 103,
    tglKomplain: '2026-07-21T14:10:00.000Z',
    namaAgen: 'Mitra Semesta Tour',
    kategori: 'Revisi tidak keluar-keluar dari Maskapai',
    nomorTiket: 'JT-77291',
    isi: 'Pengajuan koreksi ejaan nama penumpang Lion Air sudah kirim KTP dari kemarin belum ada respon.',
    status: 'Done',
    tglDone: '2026-07-26T16:00:00.000Z', // Lewat 3 hari kerja
    catatan: '[21-07-2026 15:00] Follow up ke PIC Lion Group. [26-07-2026 16:00] Revisi nama baru di-acc maskapai setelah eskalasi berulang.'
  },
  {
    id: 104,
    tglKomplain: '2026-08-02T10:00:00.000Z',
    namaAgen: 'Bumi Wisata Abadi',
    kategori: 'Komunikasi agen dengan freshnel',
    nomorTiket: 'FN-10492',
    isi: 'Pesan chat via Freshnel tidak direspons oleh petugas lebih dari 1 jam saat kendala urgent.',
    status: 'Done',
    tglDone: '2026-08-03T11:20:00.000Z',
    catatan: '[02-08-2026 10:30] Supervisor CS menghubungi agen langsung via telepon dan memohon maaf, tiket langsung dibantu.'
  },
  {
    id: 105,
    tglKomplain: '2026-08-11T13:45:00.000Z',
    namaAgen: 'Duta Jelajah Tour',
    kategori: 'Ketidaksesuaian order dari agen',
    nomorTiket: 'SJ-44021',
    isi: 'Agen salah memasukkan rute SUB-CGK terbalik menjadi CGK-SUB di sistem booking mandiri.',
    status: 'Done',
    tglDone: '2026-08-13T10:00:00.000Z',
    catatan: '[11-08-2026 14:00] Re-issued dengan biaya administrasi penyesuaian regulasi maskapai.'
  },
  {
    id: 106,
    tglKomplain: '2026-08-18T09:30:00.000Z',
    namaAgen: 'Panorama Borneo',
    kategori: 'Insertname tikda keluar2',
    nomorTiket: 'ID-62001',
    isi: 'Insert nama 15 pax rombongan Batik Air pending terus dan PNR belum ter-update.',
    status: 'Done',
    tglDone: '2026-08-20T15:00:00.000Z',
    catatan: '[18-08-2026 10:00] Push sinkronisasi sistem GDS. [20-08-2026 15:00] Seluruh 15 nama sudah tertera di manifest.'
  },
  {
    id: 107,
    tglKomplain: '2026-08-27T15:20:00.000Z',
    namaAgen: 'Kencana Travelindo',
    kategori: 'Invoicing',
    nomorTiket: 'INV-202608-88',
    isi: 'Potongan deposit tidak sesuai dengan invoice resmi, ada selisih tax Rp 85.000.',
    status: 'Done',
    tglDone: '2026-08-29T11:00:00.000Z',
    catatan: '[27-08-2026 16:00] Tim Finance cek rekonsiliasi. [29-08-2026 11:00] Selisih deposit direfund ke akun agen.'
  },
  {
    id: 108,
    tglKomplain: '2026-09-03T10:15:00.000Z',
    namaAgen: 'Sentosa Express',
    kategori: 'Request New Booking tidak keluar2',
    nomorTiket: 'REQ-99321',
    isi: 'Request booking grup Garuda 25 pax sudah submit form dari pagi belum dibuatkan booking code.',
    status: 'Done',
    tglDone: '2026-09-04T16:00:00.000Z',
    catatan: '[03-09-2026 11:00] Cek slot seat maskapai. [04-09-2026 16:00] Kode PNR grup diterbitkan.'
  },
  {
    id: 109,
    tglKomplain: '2026-09-08T11:00:00.000Z',
    namaAgen: 'Cahaya Timur Tour',
    kategori: 'Issued Tiket lama',
    nomorTiket: 'IU-30219',
    isi: 'Issued Super Air Jet delay karena sistem queue antrian maskapai sedang down.',
    status: 'Done',
    tglDone: '2026-09-09T14:15:00.000Z',
    catatan: '[08-09-2026 11:30] Eskalasi ke IT maskapai. [09-09-2026 14:15] E-ticket terbit.'
  },
  {
    id: 110,
    tglKomplain: '2026-09-14T09:40:00.000Z',
    namaAgen: 'Global Holiday Nusantara',
    kategori: 'Revisi tidak keluar-keluar dari Maskapai',
    nomorTiket: 'GA-77123',
    isi: 'Reschedule flight GA tanggal 18 Sep belum ada update konfirmasi selisih kelas promo.',
    status: 'Done',
    tglDone: '2026-09-19T10:00:00.000Z', // Lewat SLA
    catatan: '[14-09-2026 10:30] Konfirmasi ke bagian schedule GA. [19-09-2026 10:00] Tiket reschedule selesai dicetak.'
  },
  {
    id: 111,
    tglKomplain: '2026-09-22T14:50:00.000Z',
    namaAgen: 'Rian Travel Mandiri',
    kategori: 'Komunikasi agen dengan freshnel',
    nomorTiket: 'FN-20194',
    isi: 'Agen menanyakan status pembatalan pax tapi tiket Freshnel dialihkan berkali-kali antar staf.',
    status: 'Done',
    tglDone: '2026-09-24T12:00:00.000Z',
    catatan: '[22-09-2026 15:30] Diambil alih Senior CS Hendra. [24-09-2026 12:00] Selesai diinformasikan regulasi refund.'
  },
  {
    id: 112,
    tglKomplain: '2026-09-29T10:00:00.000Z',
    namaAgen: 'Surya Kencana Travel',
    kategori: 'other',
    kategoriDetail: 'Kendala Top-up Saldo Deposit Virtual Account',
    nomorTiket: 'VA-882910',
    isi: 'Top up deposit via VA Bank Mandiri belum masuk otomatis padahal mutasi sudah terpotong.',
    status: 'Done',
    tglDone: '2026-09-30T11:30:00.000Z',
    catatan: '[29-09-2026 10:30] Hubungi payment gateway. [30-09-2026 11:30] Saldo berhasil dikreditkan manual.'
  },
  {
    id: 113,
    tglKomplain: '2026-10-02T09:30:00.000Z',
    namaAgen: 'Nusantara Jaya Tour',
    kategori: 'Issued Tiket lama',
    nomorTiket: 'QG-88192',
    isi: 'Sudah klik issued Citilink sejak 08:30 WIB, status masih pending belum dapat nomor e-ticket 12 digit.',
    status: 'Done',
    tglDone: '2026-10-03T10:00:00.000Z',
    catatan: '[02-10-2026 10:00] Refresh queue maskapai. [03-10-2026 10:00] E-ticket terbit.'
  },
  {
    id: 114,
    tglKomplain: '2026-10-05T13:20:00.000Z',
    namaAgen: 'Purnama Wisata',
    kategori: 'Revisi tidak keluar-keluar dari Maskapai',
    nomorTiket: 'JT-99120',
    isi: 'Koreksi titel MR menjadi MRS untuk pax lansia belum diproses tim ticketing Lion Air.',
    status: 'Done',
    tglDone: '2026-10-07T15:00:00.000Z',
    catatan: '[05-10-2026 14:00] Submit remark SSR ke sistem. [07-10-2026 15:00] Koreksi title selesai di manifest.'
  },
  {
    id: 115,
    tglKomplain: '2026-10-08T10:40:00.000Z',
    namaAgen: 'Mitra Semesta Tour',
    kategori: 'Time limit schedule maju',
    nomorTiket: 'ID-71029',
    isi: 'Time limit Batik Air semula jam 17:00 dimajukan jadi jam 11:30, agen butuh waktu kordinasi pax.',
    status: 'Done',
    tglDone: '2026-10-09T14:00:00.000Z',
    catatan: '[08-10-2026 11:00] Bantu negosiasi time limit. [09-10-2026 14:00] Berhasil issued tepat waktu.'
  },
  {
    id: 116,
    tglKomplain: '2026-10-10T11:15:00.000Z',
    namaAgen: 'Indo Tour & Travel',
    kategori: 'Insertname tikda keluar2',
    nomorTiket: 'QZ-40192',
    isi: 'Input nama bayi (INF) pada AirAsia belum muncul di itinerary confirmation.',
    status: 'Proses',
    tglDone: '-',
    catatan: '[10-10-2026 11:30] Menunggu proses konfirmasi ulang pihak support AirAsia.'
  },
  {
    id: 117,
    tglKomplain: '2026-10-11T14:30:00.000Z',
    namaAgen: 'Bumi Wisata Abadi',
    kategori: 'Invoicing',
    nomorTiket: 'INV-202610-04',
    isi: 'Agen minta faktur pajak dan invoice terpisah per nomor tiket untuk klaim korporat klien.',
    status: 'Proses',
    tglDone: '-',
    catatan: '[11-10-2026 15:00] Diteruskan ke staf invoicing pajak untuk split billing.'
  },
  {
    id: 118,
    tglKomplain: '2026-10-12T09:25:00.000Z',
    namaAgen: 'Pelita Bahari Tour',
    kategori: 'Request New Booking tidak keluar2',
    nomorTiket: 'REQ-2026-88',
    isi: 'Booking rute perintis Maluku Wings Air belum keluar booking reference setelah 24 jam.',
    status: 'Proses',
    tglDone: '-',
    catatan: '[12-10-2026 09:40] Dalam proses pengecekan alokasi kursi maskapai Wings Air.'
  }
];

export function getStoredComplaints(): ComplaintItem[] {
  try {
    const v3 = localStorage.getItem(STORAGE_KEY);
    if (v3) {
      const parsed = JSON.parse(v3);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Cek versi legacy v2
    const v2 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (v2) {
      const parsedLegacy = JSON.parse(v2);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        const migrated: ComplaintItem[] = parsedLegacy.map((item: any, idx: number) => {
          // Petakan request lama ke kategori baru jika memungkinkan
          let kategori: ComplaintCategory = 'other';
          const reqStr = (item.request || '').toLowerCase();
          if (reqStr.includes('freshnel') || reqStr.includes('komunikasi')) {
            kategori = 'Komunikasi agen dengan freshnel';
          } else if (reqStr.includes('order') || reqStr.includes('salah order') || reqStr.includes('ketidaksesuaian')) {
            kategori = 'Ketidaksesuaian order dari agen';
          } else if (reqStr.includes('time limit') || reqStr.includes('schedule maju')) {
            kategori = 'Time limit schedule maju';
          } else if (reqStr.includes('issued') || reqStr.includes('tiket lama')) {
            kategori = 'Issued Tiket lama';
          } else if (reqStr.includes('revisi') || reqStr.includes('maskapai')) {
            kategori = 'Revisi tidak keluar-keluar dari Maskapai';
          } else if (reqStr.includes('insert') || reqStr.includes('nama')) {
            kategori = 'Insertname tikda keluar2';
          } else if (reqStr.includes('booking') || reqStr.includes('new booking')) {
            kategori = 'Request New Booking tidak keluar2';
          } else if (reqStr.includes('invoice') || reqStr.includes('tagihan') || reqStr.includes('pajak')) {
            kategori = 'Invoicing';
          }

          return {
            id: item.id || Date.now() + idx,
            tglKomplain: item.tglKomplain || new Date().toISOString(),
            namaAgen: item.namaAgen || 'Agen',
            kategori,
            kategoriDetail: item.request !== kategori ? item.request : undefined,
            isi: item.isi || '-',
            status: item.status === 'Done' ? 'Done' : 'Proses',
            tglDone: item.tglDone || '-',
            catatan: item.catatan || '-'
          };
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    // Jika kosong, inisialisasi dengan data seed berkualitas tinggi
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
    return INITIAL_SEED_DATA;
  } catch (err) {
    console.error('Error loading complaints from localStorage', err);
    return INITIAL_SEED_DATA;
  }
}

export function saveStoredComplaints(complaints: ComplaintItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    // Simpan juga ke format v2 untuk kompatibilitas
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(complaints.map(c => ({
      id: c.id,
      tglKomplain: c.tglKomplain,
      namaAgen: c.namaAgen,
      request: c.kategori + (c.kategoriDetail ? ` (${c.kategoriDetail})` : ''),
      isi: c.isi,
      status: c.status,
      tglDone: c.tglDone,
      catatan: c.catatan
    }))));
  } catch (err) {
    console.error('Error saving complaints', err);
  }
}

export function resetToSeedData(): ComplaintItem[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
  saveStoredComplaints(INITIAL_SEED_DATA);
  return INITIAL_SEED_DATA;
}
