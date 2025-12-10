import * as XLSX from 'xlsx';
import type { CfdiData } from './types';

const headers = [
  'Versión complemento', 'Folio Fiscal', 'Serie', 'Folio', 'Tipo descarga', 'RFC', 'Empleado', 
  'Regimen Fiscal', 'Codigo Postal', 'No. Empleado', 'No. seguro social', 'Banco', 'Cuenta bancaria', 
  'Régimen contratación', 'Fecha inicio relación Laboral', 'Departamento', 'Puesto', 'Riesgo', 
  'Tipo contrato', 'Periodicidad pago', 'Tipo jornada', 'S.B.C', 'S.D.I', 'Tipo de nómina', 
  'Fecha inicial pago', 'Fecha final pago', 'Días pagados', 'Fecha de pago', 'Tipo', 'Clave SAT', 
  'Clave interna', 'Concepto', 'Importe Gravado', 'Importe exento', 'Fecha de Emisión', 
  'Fecha de Timbrado', 'Estatus'
];

const mapDataToRow = (item: CfdiData) => [
  item.version, item.folioFiscal, item.serie, item.folio, item.tipoDescarga, item.rfc, item.empleado,
  item.regimenFiscal, item.codigoPostal, item.numEmpleado, item.numSeguroSocial, item.banco, item.cuentaBancaria,
  item.regimenContratacion, item.fechaInicioRelLaboral, item.departamento, item.puesto, item.riesgo,
  item.tipoContrato, item.periodicidadPago, item.tipoJornada, item.sbc, item.sdi, item.tipoNomina,
  item.fechaInicialPago, item.fechaFinalPago, item.diasPagados, item.fechaPago, item.tipo, item.claveSat,
  item.claveInterna, item.concepto, item.importeGravado, item.importeExento, item.fechaEmision,
  item.fechaTimbrado, item.estatus
];

export const exportToCSV = (data: CfdiData[], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...data.map(item => mapDataToRow(item).map(val => {
      const strVal = String(val);
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

  worksheet['!cols'] = headers.map(h => ({ wch: h.length + 5 }));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos CFDI');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
