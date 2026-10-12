const config = require('./config');

/**
 * Mapea la condición de IVA interna a los códigos oficiales de ARCA
 * (Resolución General 5616 / Manual pág. 202)
 */
function obtenerCondicionIvaReceptorId(condicionIva) {
  const normalizada = (condicionIva || '').toUpperCase().trim();

  switch (normalizada) {
    case 'RI':
    case 'RESPONSABLE_INSCRIPTO':
      return config.CONDICION_IVA_RECEPTOR.RESPONSABLE_INSCRIPTO; // 1
    case 'EXENTO':
      return config.CONDICION_IVA_RECEPTOR.EXENTO; // 4
    case 'MONOTRIBUTO':
      return config.CONDICION_IVA_RECEPTOR.MONOTRIBUTO; // 6
    case 'NO_CATEGORIZADO':
      return config.CONDICION_IVA_RECEPTOR.NO_CATEGORIZADO; // 7
    case 'CONSUMIDOR_FINAL':
    default:
      return config.CONDICION_IVA_RECEPTOR.CONSUMIDOR_FINAL; // 5
  }
}

/**
 * Determina el tipo de documento del receptor según la condición y datos
 */
function determinarDocTipoYNro(cliente, tipoFactura) {
  const cuitLimpio = (cliente.cuit || '').replace(/\D/g, '');

  if (tipoFactura === 'A') {
    // Factura A siempre exige CUIT (80)
    if (!cuitLimpio || cuitLimpio.length !== 11) {
      throw new Error(`Para Factura A es obligatorio un CUIT válido de 11 dígitos. CUIT actual: ${cliente.cuit || 'ninguno'}`);
    }
    return {
      docTipo: config.DOC_TIPO.CUIT,
      docNro: cuitLimpio
    };
  }

  // Para Factura B o C
  if (cuitLimpio && cuitLimpio.length === 11) {
    return {
      docTipo: config.DOC_TIPO.CUIT,
      docNro: cuitLimpio
    };
  }

  // Si tiene DNI
  const dniLimpio = (cliente.dni || '').replace(/\D/g, '');
  if (dniLimpio && dniLimpio.length >= 7) {
    return {
      docTipo: config.DOC_TIPO.DNI,
      docNro: dniLimpio
    };
  }

  // Consumidor Final sin identificar (DocTipo: 99, DocNro: 0)
  return {
    docTipo: config.DOC_TIPO.CONSUMIDOR_FINAL,
    docNro: '0'
  };
}

/**
 * Mapea el tipo de factura interna (A, B, C) al CbteTipo numérico de ARCA
 */
function obtenerCbteTipo(tipoFactura) {
  switch (tipoFactura.toUpperCase()) {
    case 'A':
      return config.CBTE_TIPO.FACTURA_A; // 1
    case 'B':
      return config.CBTE_TIPO.FACTURA_B; // 6
    case 'C':
      return config.CBTE_TIPO.FACTURA_C; // 11
    default:
      throw new Error(`Tipo de factura legal inválido para ARCA: ${tipoFactura}. Solo se admiten A, B o C.`);
  }
}

/**
 * Convierte los datos de la factura y cliente al objeto de requerimiento FECAEReq
 */
function construirRequerimientoCAE({
  tipoFactura,
  puntoVenta,
  numeroComprobante,
  cliente,
  subtotal,
  iva21 = 0,
  iva105 = 0,
  total,
  fechaEmision = new Date()
}) {
  const cbteTipo = obtenerCbteTipo(tipoFactura);
  const { docTipo, docNro } = determinarDocTipoYNro(cliente, tipoFactura);
  const condicionIvaReceptorId = obtenerCondicionIvaReceptorId(cliente.condicion_iva);

  // Formato de fecha ARCA: YYYYMMDD
  const anio = fechaEmision.getFullYear();
  const mes = String(fechaEmision.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaEmision.getDate()).padStart(2, '0');
  const cbteFch = `${anio}${mes}${dia}`;

  let impNeto = 0;
  let impIVA = 0;
  let impTotal = 0;
  let arrayIva = [];

  if (tipoFactura === 'A') {
    // Factura A: IVA discriminado
    impNeto = Math.round(parseFloat(subtotal) * 100) / 100;
    impIVA = Math.round((parseFloat(iva21) + parseFloat(iva105)) * 100) / 100;
    impTotal = Math.round((impNeto + impIVA) * 100) / 100;

    if (parseFloat(iva21) > 0) {
      arrayIva.push({
        id: config.ALICUOTAS_IVA.IVA_21,
        baseImp: impNeto,
        importe: parseFloat(iva21)
      });
    } else if (parseFloat(iva105) > 0) {
      arrayIva.push({
        id: config.ALICUOTAS_IVA.IVA_10_5,
        baseImp: impNeto,
        importe: parseFloat(iva105)
      });
    } else {
      // Default alícuota 21%
      const ivaCalc = Math.round(impNeto * 0.21 * 100) / 100;
      impIVA = ivaCalc;
      impTotal = Math.round((impNeto + impIVA) * 100) / 100;
      arrayIva.push({
        id: config.ALICUOTAS_IVA.IVA_21,
        baseImp: impNeto,
        importe: ivaCalc
      });
    }

  } else if (tipoFactura === 'B') {
    // Factura B: El total incluye IVA. Para ARCA desglosamos neto e IVA
    impTotal = Math.round(parseFloat(total || subtotal) * 100) / 100;
    impNeto = Math.round((impTotal / 1.21) * 100) / 100;
    impIVA = Math.round((impTotal - impNeto) * 100) / 100;

    arrayIva.push({
      id: config.ALICUOTAS_IVA.IVA_21,
      baseImp: impNeto,
      importe: impIVA
    });

  } else if (tipoFactura === 'C') {
    // Factura C: Sin IVA
    impTotal = Math.round(parseFloat(total || subtotal) * 100) / 100;
    impNeto = impTotal;
    impIVA = 0;
    arrayIva = []; // En comprobantes tipo C no debe informarse IVA
  }

  return {
    cabecera: {
      cantReg: 1,
      ptoVta: puntoVenta,
      cbteTipo
    },
    detalles: [
      {
        concepto: config.CONCEPTO.PRODUCTOS,
        docTipo,
        docNro,
        cbteDesde: numeroComprobante,
        cbteHasta: numeroComprobante,
        cbteFch,
        impTotal,
        impTotConc: 0,
        impNeto,
        impOpEx: 0,
        impTrib: 0,
        impIVA,
        monId: 'PES',
        monCotiz: 1,
        condicionIvaReceptorId,
        iva: arrayIva
      }
    ]
  };
}

module.exports = {
  obtenerCondicionIvaReceptorId,
  determinarDocTipoYNro,
  obtenerCbteTipo,
  construirRequerimientoCAE
};
