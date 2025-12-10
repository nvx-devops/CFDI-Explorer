import * as XLSX from 'xlsx';
import type { CfdiData } from './types';

const headers = [
  'Versión', 'Folio Fiscal', 'Serie', 'Folio', 'Fecha inicial pago', 'Fecha final pago', 
  'Días pagados', 'Fecha de pago', 'Tipo', 'Clave SAT', 'Clave interna', 'Concepto', 
  'Importe Gravado', 'Importe exento', 'Fecha de Emisión', 'Fecha de Timbrado', 'Estatus'
];

const mapDataToRow = (item: CfdiData) => [
  item.version, item.folioFiscal, item.serie, item.folio, item.fechaInicialPago, item.fechaFinalPago,
  item.diasPagados, item.fechaPago, item.tipo, item.claveSat, item.claveInterna, item.concepto,
  item.importeGravado, item.importeExento, item.fechaEmision, item.fechaTimbrado, item.estatus
];

export const exportToCSV = (data: CfdiData[], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...data.map(item => mapDataToRow(item).map(val => {
      const strVal = String(val);
      // Escape quotes and wrap in quotes if it contains commas
      if (strVal.includes(',')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    }).join(','))
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportToXLSX = (data: CfdiData[], filename: string) => {
  const worksheetData = [
    headers,
    ...data.map(mapDataToRow)
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 }, // Versión
    { wch: 36 }, // Folio Fiscal
    { wch: 10 }, // Serie
    { wch: 10 }, // Folio
    { wch: 20 }, // Fecha inicial pago
    { wch: 20 }, // Fecha final pago
    { wch: 12 }, // Días pagados
    { wch: 15 }, // Fecha de pago
    { wch: 12 }, // Tipo
    { wch: 12 }, // Clave SAT
    { wch: 12 }, // Clave interna
    { wch: 40 }, // Concepto
    { wch: 15 }, // Importe Gravado
    { wch: 15 }, // Importe exento
    { wch: 20 }, // Fecha de Emisión
    { wch: 20 }, // Fecha de Timbrado
    { wch: 10 }, // Estatus
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos CFDI');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
