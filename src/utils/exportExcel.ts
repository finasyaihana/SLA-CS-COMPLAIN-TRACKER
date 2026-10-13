import { ComplaintItem } from '../types/complaint';
import { evaluasiSLA, formatTanggal, formatWaktu, hitungDurasi } from './sla';

export interface ExportOptions {
  periodLabel: string;
  startDate?: string;
  endDate?: string;
  categoryFilter?: string;
  statusFilter?: string;
}

/**
 * Filter daftar komplain berdasarkan opsi periode
 */
export function filterComplaintsByPeriod(
  items: ComplaintItem[],
  options: {
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
  }
): ComplaintItem[] {
  return items.filter(item => {
    const itemDate = new Date(item.tglKomplain);

    if (options.startDate) {
      const start = new Date(options.startDate);
      start.setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }

    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) return false;
    }

    if (options.category && options.category !== 'ALL') {
      if (item.kategori !== options.category) return false;
    }

    if (options.status && options.status !== 'ALL') {
      if (item.status !== options.status) return false;
    }

    return true;
  });
}

/**
 * Download file Excel (.xls) dengan format XML rapi yang dapat langsung dibuka
 * di Microsoft Excel, Google Sheets, LibreOffice, atau Apple Numbers.
 */
export function downloadExcelFile(
  items: ComplaintItem[],
  options: ExportOptions
): void {
  const filtered = filterComplaintsByPeriod(items, {
    startDate: options.startDate,
    endDate: options.endDate,
    category: options.categoryFilter,
    status: options.statusFilter
  });

  if (filtered.length === 0) {
    throw new Error('Tidak ada data komplain pada periode yang dipilih!');
  }

  // Hitung ringkasan statistik
  let countDone = 0;
  let countProses = 0;
  let countOnTime = 0;
  let countLate = 0;

  filtered.forEach(k => {
    if (k.status === 'Done') countDone++;
    else countProses++;

    const evalResult = evaluasiSLA(k.tglKomplain, k.tglDone, k.status);
    if (evalResult.statusType === 'ON_TIME') countOnTime++;
    if (evalResult.statusType === 'LATE' || evalResult.statusType === 'PROCESS_OVERDUE') countLate++;
  });

  const onTimeRate = countDone > 0 ? Math.round((countOnTime / countDone) * 100) : 0;
  const nowStr = formatWaktu(new Date());

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Rekap Komplain &amp; SLA CS</Title>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderTitle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1E293B"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B" ss:Italic="1"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="KpiLabel">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#334155"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="KpiVal">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowEven">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Top"/>
  </Style>
  <Style ss:ID="RowOdd">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Top"/>
  </Style>
  <Style ss:ID="StatusDone">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#166534"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="StatusProses">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#9A3412"/>
   <Interior ss:Color="#FFEDD5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SlaOk">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#166534"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SlaLate">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#991B1B"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Rekapan Komplain">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="30"/>
   <Column ss:Width="110"/>
   <Column ss:Width="130"/>
   <Column ss:Width="190"/>
   <Column ss:Width="90"/>
   <Column ss:Width="230"/>
   <Column ss:Width="70"/>
   <Column ss:Width="110"/>
   <Column ss:Width="70"/>
   <Column ss:Width="160"/>
   <Column ss:Width="240"/>

   <Row ss:Height="26">
    <Cell ss:MergeAcross="10" ss:StyleID="HeaderTitle">
     <Data ss:Type="String">LAPORAN REKAPITULASI KOMPLAIN &amp; SLA CUSTOMER SERVICE</Data>
    </Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="10" ss:StyleID="SubHeader">
     <Data ss:Type="String">Periode Ekspor: ${options.periodLabel} | Diunduh pada: ${nowStr} | Target SLA: 3 Hari Kerja</Data>
    </Cell>
   </Row>
   <Row ss:Height="10"/>

   <!-- Ringkasan KPI -->
   <Row ss:Height="20">
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Total Komplain</Data></Cell>
    <Cell ss:StyleID="KpiVal"><Data ss:Type="Number">${filtered.length}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Status Selesai (Done)</Data></Cell>
    <Cell ss:StyleID="KpiVal"><Data ss:Type="Number">${countDone}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Status Masih Proses</Data></Cell>
    <Cell ss:StyleID="KpiVal"><Data ss:Type="Number">${countProses}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">SLA Terpenuhi Tepat Waktu</Data></Cell>
    <Cell ss:StyleID="KpiVal"><Data ss:Type="Number">${countOnTime}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Kepatuhan SLA</Data></Cell>
    <Cell ss:StyleID="KpiVal"><Data ss:Type="String">${onTimeRate}%</Data></Cell>
   </Row>
   <Row ss:Height="14"/>

   <!-- Table Headers -->
   <Row ss:Height="26">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tgl Komplain</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Nama Agen / PIC</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Kategori Komplain</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Kode / No Tiket</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Isi Komplain / Kendala</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tgl Selesai</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Durasi</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Indikator SLA (3 Hari Kerja)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Update / Catatan Log</Data></Cell>
   </Row>
`;

  filtered.forEach((k, idx) => {
    const rowStyle = idx % 2 === 0 ? 'RowEven' : 'RowOdd';
    const evalResult = evaluasiSLA(k.tglKomplain, k.tglDone, k.status);
    const durasiText = hitungDurasi(k.tglKomplain, k.tglDone);
    const statusStyle = k.status === 'Done' ? 'StatusDone' : 'StatusProses';
    const slaStyle = evalResult.isBreached ? 'SlaLate' : 'SlaOk';
    const categoryFull = k.kategori + (k.kategoriDetail ? ` (${k.kategoriDetail})` : '');
    const cleanNotes = (k.catatan || '-').replace(/<br>/g, ' | ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cleanIsi = (k.isi || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    xml += `
   <Row ss:Height="24">
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${formatWaktu(k.tglKomplain)}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(k.namaAgen)}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(categoryFull)}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(k.nomorTiket || '-')}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${cleanIsi}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${k.status}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${formatWaktu(k.tglDone)}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${durasiText}</Data></Cell>
    <Cell ss:StyleID="${slaStyle}"><Data ss:Type="String">${escapeXml(evalResult.label)}</Data></Cell>
    <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${cleanNotes}</Data></Cell>
   </Row>
`;
  });

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = formatTanggal(new Date()).replace(/-/g, '');
  const cleanPeriod = options.periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Rekap_Komplain_SLA_${cleanPeriod}_${dateStr}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download format CSV dengan UTF-8 BOM
 */
export function downloadCsvFile(
  items: ComplaintItem[],
  options: ExportOptions
): void {
  const filtered = filterComplaintsByPeriod(items, {
    startDate: options.startDate,
    endDate: options.endDate,
    category: options.categoryFilter,
    status: options.statusFilter
  });

  if (filtered.length === 0) {
    throw new Error('Tidak ada data komplain pada periode yang dipilih!');
  }

  const headers = [
    'No',
    'Tgl Komplain',
    'Nama Agen / PIC',
    'Kategori Komplain',
    'Detail Kategori / Request',
    'No Tiket / PNR',
    'Isi Komplain',
    'Status',
    'Tgl Selesai',
    'Durasi',
    'Indikator SLA',
    'Update / Catatan Log'
  ];

  const rows: string[][] = [headers];

  filtered.forEach((k, idx) => {
    const evalResult = evaluasiSLA(k.tglKomplain, k.tglDone, k.status);
    const durasiText = hitungDurasi(k.tglKomplain, k.tglDone);
    const notesClean = (k.catatan || '-').replace(/<br>/g, ' | ').replace(/"/g, '""');
    const isiClean = (k.isi || '').replace(/"/g, '""');

    rows.push([
      String(idx + 1),
      formatWaktu(k.tglKomplain),
      k.namaAgen,
      k.kategori,
      k.kategoriDetail || '-',
      k.nomorTiket || '-',
      isiClean,
      k.status,
      formatWaktu(k.tglDone),
      durasiText,
      evalResult.label,
      notesClean
    ]);
  });

  const csvContent = '\uFEFF' + rows.map(r => r.map(col => `"${col}"`).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = formatTanggal(new Date()).replace(/-/g, '');
  const cleanPeriod = options.periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `Rekap_Komplain_SLA_${cleanPeriod}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
