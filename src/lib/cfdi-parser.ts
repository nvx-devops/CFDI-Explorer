import type { CfdiData } from '@/lib/types';

const getAttr = (el: Element | undefined | null, name: string): string => {
  if (!el) return '';
  return el.getAttribute(name) || '';
};

export const parseCfdi = (xmlString: string): CfdiData[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const errorNode = xmlDoc.querySelector("parsererror");
  if (errorNode) {
    throw new Error("Error al procesar el archivo XML. Verifique que sea un XML válido.");
  }

  const comprobante = xmlDoc.getElementsByTagNameNS("http://www.sat.gob.mx/cfd/4", "Comprobante")[0];
  if (!comprobante) throw new Error("Archivo XML no válido: No se encontró el nodo 'cfdi:Comprobante'.");
  
  const emisor = comprobante.getElementsByTagNameNS("http://www.sat.gob.mx/cfd/4", "Emisor")[0];
  const receptor = comprobante.getElementsByTagNameNS("http://www.sat.gob.mx/cfd/4", "Receptor")[0];

  const timbreFiscal = xmlDoc.getElementsByTagNameNS("http://www.sat.gob.mx/TimbreFiscalDigital", "TimbreFiscalDigital")[0];
  if (!timbreFiscal) throw new Error("Archivo XML no válido: No se encontró el nodo 'tfd:TimbreFiscalDigital'.");
  
  const nomina = xmlDoc.getElementsByTagNameNS("http://www.sat.gob.mx/nomina12", "Nomina")[0];
  if (!nomina) throw new Error("Archivo XML no válido: No se encontró el nodo 'nomina12:Nomina'.");
  
  const nominaReceptor = nomina.getElementsByTagNameNS("http://www.sat.gob.mx/nomina12", "Receptor")[0];

  const percepcionesNode = nomina.getElementsByTagNameNS("http://www.sat.gob.mx/nomina12", "Percepciones")[0];
  const deduccionesNode = nomina.getElementsByTagNameNS("http://www.sat.gob.mx/nomina12", "Deducciones")[0];

  const commonData = {
    version: getAttr(comprobante, 'Version'),
    folioFiscal: getAttr(timbreFiscal, 'UUID'),
    serie: getAttr(comprobante, 'Serie'),
    folio: getAttr(comprobante, 'Folio'),
    tipoDescarga: 'Nómina',
    rfc: getAttr(receptor, 'Rfc'),
    empleado: getAttr(receptor, 'Nombre'),
    regimenFiscal: getAttr(receptor, 'RegimenFiscalReceptor'),
    codigoPostal: getAttr(comprobante, 'LugarExpedicion'),
    numEmpleado: getAttr(nominaReceptor, 'NumEmpleado'),
    numSeguroSocial: getAttr(nominaReceptor, 'NumSeguridadSocial'),
    banco: getAttr(nominaReceptor, 'Banco'),
    cuentaBancaria: getAttr(nominaReceptor, 'CuentaBancaria'),
    regimenContratacion: getAttr(nominaReceptor, 'TipoRegimen'),
    fechaInicioRelLaboral: getAttr(nominaReceptor, 'FechaInicioRelLaboral'),
    departamento: getAttr(nominaReceptor, 'Departamento'),
    puesto: getAttr(nominaReceptor, 'Puesto'),
    riesgo: getAttr(nominaReceptor, 'RiesgoPuesto'),
    tipoContrato: getAttr(nominaReceptor, 'TipoContrato'),
    periodicidadPago: getAttr(nominaReceptor, 'PeriodicidadPago'),
    tipoJornada: getAttr(nominaReceptor, 'TipoJornada'),
    sbc: getAttr(nominaReceptor, 'SalarioBaseCotApor'),
    sdi: getAttr(nominaReceptor, 'SalarioDiarioIntegrado'),
    tipoNomina: getAttr(nomina, 'TipoNomina'),
    fechaInicialPago: getAttr(nomina, 'FechaInicialPago'),
    fechaFinalPago: getAttr(nomina, 'FechaFinalPago'),
    diasPagados: getAttr(nomina, 'NumDiasPagados'),
    fechaPago: getAttr(nomina, 'FechaPago'),
    fechaEmision: getAttr(comprobante, 'Fecha'),
    fechaTimbrado: getAttr(timbreFiscal, 'FechaTimbrado'),
    estatus: 'Vigente',
  };

  const dataRows: CfdiData[] = [];

  if (percepcionesNode) {
    const percepciones = percepcionesNode.getElementsByTagNameNS("http://www.sat.gob.mx/nomina12", "Percepcion");
    for (let i = 0; i < percepciones.length; i++) {
      const p = percepciones[i];
      dataRows.push({
        ...commonData,
        tipo: 'Percepción',
        claveSat: getAttr(p, 'TipoPercepcion'),
        claveInterna: getAttr(p, 'Clave'),
        concepto: getAttr(p, 'Concepto'),
        importeGravado: parseFloat(getAttr(p, 'ImporteGravado') || '0'),
        importeExento: parseFloat(getAttr(p, 'ImporteExento') || '0'),
      });
    }
  }

  if (deduccionesNode) {
    const deducciones = deduccionesNode.getElementsByTagNameNS("http://www.sat.gob.mx/nomina12", "Deduccion");
    for (let i = 0; i < deducciones.length; i++) {
      const d = deducciones[i];
      dataRows.push({
        ...commonData,
        tipo: 'Deducción',
        claveSat: getAttr(d, 'TipoDeduccion'),
        claveInterna: getAttr(d, 'Clave'),
        concepto: getAttr(d, 'Concepto'),
        importeGravado: parseFloat(getAttr(d, 'Importe') || '0'),
        importeExento: 0,
      });
    }
  }

  if (dataRows.length === 0) {
    throw new Error("No se encontraron percepciones o deducciones en el archivo CFDI.");
  }

  return dataRows;
};
