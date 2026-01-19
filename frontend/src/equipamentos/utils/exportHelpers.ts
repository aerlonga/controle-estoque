import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Equipment } from '../data/equipments';

const statusLabels: Record<string, string> = {
  NO_DEPOSITO: 'No Depósito',
  FORA_DEPOSITO: 'Fora do Depósito',
  DESCARTADO: 'Descartado',
};

export const exportToExcel = (data: Equipment[], filename: string = 'equipamentos') => {
  const exportData = data.map(item => ({
    'ID': item.id,
    'Nome': item.nome,
    'Modelo': item.modelo,
    'Nº Série': item.numero_serie || '-',
    'Patrimônio': item.patrimonio || '-',
    'Local': item.local || '-',
    'Status': statusLabels[item.status] || item.status,
    'Responsável': item.usuario?.nome || 'N/A',
    'Cadastrado em': item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '-',
  }));

  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet([]);

  XLSX.utils.sheet_add_aoa(ws, [['Controle de Estoque']], { origin: 'A1' });

  XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A2' });

  XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A3' });

  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });

  ws['!cols'] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 },
    { wch: 18 },
    { wch: 25 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Equipamentos');

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
};

export const exportToPDF = (data: Equipment[], filename: string = 'equipamentos') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Controle de Estoque', 14, 15);
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(0.5);
  doc.line(14, 18, 283, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const dataExportacao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`Exportado em: ${dataExportacao}`, 14, 24);

  const tableData = data.map(item => [
    String(item.id),
    item.nome,
    item.modelo ?? '-',
    item.numero_serie ?? '-',
    item.patrimonio ?? '-',
    item.local ?? '-',
    statusLabels[item.status] || item.status,
    item.usuario?.nome ?? 'N/A',
    item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '-',
  ]);

  autoTable(doc, {
    head: [[
      'ID',
      'Nome',
      'Modelo',
      'Nº Série',
      'Patrimônio',
      'Local',
      'Status',
      'Responsável',
      'Cadastrado'
    ]],
    body: tableData,
    startY: 28,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 38 },
      2: { cellWidth: 32 },
      3: { cellWidth: 28 },
      4: { cellWidth: 24 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30 },
      7: { cellWidth: 35 },
      8: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`${filename}_${timestamp}.pdf`);
};
