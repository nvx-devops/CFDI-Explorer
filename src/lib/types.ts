export interface CfdiData {
  version: string;
  folioFiscal: string;
  serie: string;
  folio: string;
  fechaInicialPago: string;
  fechaFinalPago:string;
  diasPagados: string;
  fechaPago: string;
  tipo: 'Percepción' | 'Deducción';
  claveSat: string;
  claveInterna: string;
  concepto: string;
  importeGravado: number;
  importeExento: number;
  fechaEmision: string;
  fechaTimbrado: string;
  estatus: string;
}
