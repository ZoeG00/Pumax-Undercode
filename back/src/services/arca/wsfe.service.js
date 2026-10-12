const { XMLParser } = require('fast-xml-parser');
const config = require('./config');

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false // Para mantener los CUITs y CAEs como strings sin pérdida de precisión numérica
});

/**
 * Función genérica para enviar peticiones SOAP a WSFEv1
 */
async function enviarSoapRequest(soapAction, bodyXml) {
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    ${bodyXml}
  </soapenv:Body>
</soapenv:Envelope>`;

  const response = await fetch(config.urls.wsfe, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `"http://ar.gov.afip.dif.FEV1/${soapAction}"`
    },
    body: envelope
  });

  const responseText = await response.text();

  if (!response.ok && response.status !== 500) {
    throw new Error(`WSFE HTTP Error ${response.status}: ${responseText}`);
  }

  const parsed = parser.parse(responseText);
  const body = parsed['soapenv:Envelope']?.['soapenv:Body'] || parsed['soap:Envelope']?.['soap:Body'];

  if (body?.['soapenv:Fault'] || body?.['soap:Fault']) {
    const fault = body?.['soapenv:Fault'] || body?.['soap:Fault'];
    throw new Error(`SOAP Fault de ARCA: ${fault.faultstring || 'Error desconocido'}`);
  }

  return body;
}

/**
 * 1. FEDummy: Ping de verificación de estado de infraestructura de ARCA
 */
async function feDummy() {
  const bodyXml = `<ar:FEDummy/>`;
  const body = await enviarSoapRequest('FEDummy', bodyXml);
  const result = body?.['FEDummyResponse']?.['FEDummyResult'] || {};

  return {
    appServer: result.AppServer,
    dbServer: result.DbServer,
    authServer: result.AuthServer
  };
}

/**
 * 2. FECompUltimoAutorizado: Retorna el último número emitido para un PtoVta y CbteTipo
 */
async function feCompUltimoAutorizado(auth, ptoVta, cbteTipo) {
  const bodyXml = `
  <ar:FECompUltimoAutorizado>
    <ar:Auth>
      <ar:Token>${auth.token}</ar:Token>
      <ar:Sign>${auth.sign}</ar:Sign>
      <ar:Cuit>${auth.cuit}</ar:Cuit>
    </ar:Auth>
    <ar:PtoVta>${ptoVta}</ar:PtoVta>
    <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
  </ar:FECompUltimoAutorizado>`;

  const body = await enviarSoapRequest('FECompUltimoAutorizado', bodyXml);
  const result = body?.['FECompUltimoAutorizadoResponse']?.['FECompUltimoAutorizadoResult'] || {};

  if (result.Errors) {
    const err = result.Errors.Err;
    const msg = Array.isArray(err) ? err.map(e => `[${e.Code}] ${e.Msg}`).join(', ') : `[${err.Code}] ${err.Msg}`;
    throw new Error(`Error en FECompUltimoAutorizado: ${msg}`);
  }

  return parseInt(result.CbteNro || '0', 10);
}

/**
 * 3. FECAESolicitar: Solicita el CAE para una o varias facturas
 */
async function fecaeSolicitar(auth, feCAEReq) {
  // Construir XML del detalle
  const detXml = feCAEReq.detalles.map(d => {
    // Array de alícuotas de IVA
    let ivaXml = '';
    if (d.iva && d.iva.length > 0) {
      ivaXml = `
      <ar:Iva>
        ${d.iva.map(i => `
          <ar:AlicIva>
            <ar:Id>${i.id}</ar:Id>
            <ar:BaseImp>${Number(i.baseImp).toFixed(2)}</ar:BaseImp>
            <ar:Importe>${Number(i.importe).toFixed(2)}</ar:Importe>
          </ar:AlicIva>
        `).join('')}
      </ar:Iva>`;
    }

    // Comprobantes asociados (para notas de crédito/débito)
    let cbtesAsocXml = '';
    if (d.cbtesAsoc && d.cbtesAsoc.length > 0) {
      cbtesAsocXml = `
      <ar:CbtesAsoc>
        ${d.cbtesAsoc.map(c => `
          <ar:CbteAsoc>
            <ar:Tipo>${c.tipo}</ar:Tipo>
            <ar:PtoVta>${c.ptoVta}</ar:PtoVta>
            <ar:Nro>${c.nro}</ar:Nro>
            <ar:Cuit>${c.cuit || auth.cuit}</ar:Cuit>
          </ar:CbteAsoc>
        `).join('')}
      </ar:CbtesAsoc>`;
    }

    return `
    <ar:FECAEDetRequest>
      <ar:Concepto>${d.concepto || 1}</ar:Concepto>
      <ar:DocTipo>${d.docTipo}</ar:DocTipo>
      <ar:DocNro>${d.docNro}</ar:DocNro>
      <ar:CbteDesde>${d.cbteDesde}</ar:CbteDesde>
      <ar:CbteHasta>${d.cbteHasta}</ar:CbteHasta>
      <ar:CbteFch>${d.cbteFch}</ar:CbteFch>
      <ar:ImpTotal>${Number(d.impTotal).toFixed(2)}</ar:ImpTotal>
      <ar:ImpTotConc>${Number(d.impTotConc || 0).toFixed(2)}</ar:ImpTotConc>
      <ar:ImpNeto>${Number(d.impNeto).toFixed(2)}</ar:ImpNeto>
      <ar:ImpOpEx>${Number(d.impOpEx || 0).toFixed(2)}</ar:ImpOpEx>
      <ar:ImpTrib>${Number(d.impTrib || 0).toFixed(2)}</ar:ImpTrib>
      <ar:ImpIVA>${Number(d.impIVA || 0).toFixed(2)}</ar:ImpIVA>
      <ar:MonId>${d.monId || 'PES'}</ar:MonId>
      <ar:MonCotiz>${d.monCotiz || 1}</ar:MonCotiz>
      ${d.condicionIvaReceptorId ? `<ar:CondicionIVAReceptorId>${d.condicionIvaReceptorId}</ar:CondicionIVAReceptorId>` : ''}
      ${cbtesAsocXml}
      ${ivaXml}
    </ar:FECAEDetRequest>`;
  }).join('');

  const bodyXml = `
  <ar:FECAESolicitar>
    <ar:Auth>
      <ar:Token>${auth.token}</ar:Token>
      <ar:Sign>${auth.sign}</ar:Sign>
      <ar:Cuit>${auth.cuit}</ar:Cuit>
    </ar:Auth>
    <ar:FeCAEReq>
      <ar:FeCabReq>
        <ar:CantReg>${feCAEReq.detalles.length}</ar:CantReg>
        <ar:PtoVta>${feCAEReq.cabecera.ptoVta}</ar:PtoVta>
        <ar:CbteTipo>${feCAEReq.cabecera.cbteTipo}</ar:CbteTipo>
      </ar:FeCabReq>
      <ar:FeDetReq>
        ${detXml}
      </ar:FeDetReq>
    </ar:FeCAEReq>
  </ar:FECAESolicitar>`;

  const body = await enviarSoapRequest('FECAESolicitar', bodyXml);
  const result = body?.['FECAESolicitarResponse']?.['FECAESolicitarResult'] || {};

  // Manejar errores de cabecera/generales
  if (result.Errors) {
    const err = result.Errors.Err;
    const msg = Array.isArray(err) ? err.map(e => `[${e.Code}] ${e.Msg}`).join(', ') : `[${err.Code}] ${err.Msg}`;
    throw new Error(`Error general de ARCA en FECAESolicitar: ${msg}`);
  }

  const cabeceraResp = result.FeCabResp;
  const detalleResp = result.FeDetResp?.FEDetResponse;

  // Si se envió un único comprobante, normalizar a array
  const detallesArray = Array.isArray(detalleResp) ? detalleResp : [detalleResp];
  const primerComprobante = detallesArray[0] || {};

  // Verificar si fue rechazado
  if (primerComprobante.Resultado === 'R') {
    let observaciones = 'Comprobante rechazado por ARCA';
    if (primerComprobante.Observaciones?.Obs) {
      const obs = primerComprobante.Observaciones.Obs;
      observaciones = Array.isArray(obs) ? obs.map(o => `[${o.Code}] ${o.Msg}`).join(', ') : `[${obs.Code}] ${obs.Msg}`;
    }
    throw new Error(`Rechazo de factura en ARCA: ${observaciones}`);
  }

  return {
    resultado: primerComprobante.Resultado, // 'A' = Aprobado, 'P' = Parcial
    cae: primerComprobante.CAE,
    vencimientoCae: primerComprobante.CAEFchVto, // Formato YYYYMMDD
    numeroComprobante: primerComprobante.CbteDesde,
    fechaEmision: primerComprobante.CbteFch,
    observaciones: primerComprobante.Observaciones?.Obs || null
  };
}

/**
 * 4. FECompConsultar: Consulta una factura ya emitida
 */
async function feCompConsultar(auth, cbteTipo, cbteNro, ptoVta) {
  const bodyXml = `
  <ar:FECompConsultar>
    <ar:Auth>
      <ar:Token>${auth.token}</ar:Token>
      <ar:Sign>${auth.sign}</ar:Sign>
      <ar:Cuit>${auth.cuit}</ar:Cuit>
    </ar:Auth>
    <ar:FeCompConsReq>
      <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
      <ar:CbteNro>${cbteNro}</ar:CbteNro>
      <ar:PtoVta>${ptoVta}</ar:PtoVta>
    </ar:FeCompConsReq>
  </ar:FECompConsultar>`;

  const body = await enviarSoapRequest('FECompConsultar', bodyXml);
  const result = body?.['FECompConsultarResponse']?.['FECompConsultarResult'] || {};

  if (result.Errors) {
    const err = result.Errors.Err;
    const msg = Array.isArray(err) ? err.map(e => `[${e.Code}] ${e.Msg}`).join(', ') : `[${err.Code}] ${err.Msg}`;
    throw new Error(`Error en FECompConsultar: ${msg}`);
  }

  return result.ResultGet;
}

/**
 * 5. Consultar Puntos de Venta habilitados para Web Services
 */
async function feParamGetPtosVenta(auth) {
  const bodyXml = `
  <ar:FEParamGetPtosVenta>
    <ar:Auth>
      <ar:Token>${auth.token}</ar:Token>
      <ar:Sign>${auth.sign}</ar:Sign>
      <ar:Cuit>${auth.cuit}</ar:Cuit>
    </ar:Auth>
  </ar:FEParamGetPtosVenta>`;

  const body = await enviarSoapRequest('FEParamGetPtosVenta', bodyXml);
  const result = body?.['FEParamGetPtosVentaResponse']?.['FEParamGetPtosVentaResult'] || {};

  return result.ResultGet?.PtoVenta || [];
}

module.exports = {
  feDummy,
  feCompUltimoAutorizado,
  fecaeSolicitar,
  feCompConsultar,
  feParamGetPtosVenta
};
