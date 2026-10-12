const fs = require('fs');
const config = require('./config');
const wsaaService = require('./wsaa.service');
const wsfeService = require('./wsfe.service');
const arcaAdapter = require('./arca.adapter');

/**
 * Servicio principal de facturación electrónica con ARCA
 */
class ArcaService {
  /**
   * Verifica si los certificados físicos están configurados
   */
  tieneCertificados() {
    return fs.existsSync(config.certPath) && fs.existsSync(config.keyPath);
  }

  /**
   * Consulta el estado general de los servicios de ARCA y la configuración local
   */
  async verificarEstado() {
    const certExiste = fs.existsSync(config.certPath);
    const keyExiste = fs.existsSync(config.keyPath);
    let dummyResult = null;
    let dummyError = null;

    try {
      dummyResult = await wsfeService.feDummy();
    } catch (err) {
      dummyError = err.message;
    }

    return {
      ambiente: config.env,
      urls: config.urls,
      cuit: config.cuit,
      puntoVenta: config.puntoVenta,
      certificados: {
        certExiste,
        keyExiste,
        certPath: config.certPath,
        keyPath: config.keyPath,
        configurado: certExiste && keyExiste
      },
      servidoresArca: dummyResult,
      errorConectividad: dummyError
    };
  }

  /**
   * Obtiene el próximo número correlativo oficial de ARCA para un tipo y punto de venta
   */
  async obtenerProximoNumero(tipoFactura, puntoVenta = config.puntoVenta) {
    if (!this.tieneCertificados() || config.env === 'simulado') {
      return null;
    }

    const auth = await wsaaService.obtenerCredenciales();
    const cbteTipo = arcaAdapter.obtenerCbteTipo(tipoFactura);
    const ultimo = await wsfeService.feCompUltimoAutorizado(auth, puntoVenta, cbteTipo);
    return ultimo + 1;
  }

  /**
   * Solicita el CAE para una factura legal ante ARCA
   */
  async solicitarCAE({
    tipoFactura,
    puntoVenta = config.puntoVenta,
    numeroComprobante,
    cliente,
    subtotal,
    iva21 = 0,
    iva105 = 0,
    total,
    fechaEmision = new Date()
  }) {
    // Si no están los certificados o está en modo simulado, generar respuesta simulada
    if (!this.tieneCertificados() || config.env === 'simulado') {
      console.log(`[ARCA] Modo simulado activo (Sin certificados o ARCA_ENV=simulado). Generando CAE simulado.`);
      const caeSimulado = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
      const vencimiento = new Date();
      vencimiento.setDate(vencimiento.getDate() + 10);

      return {
        success: true,
        modo: 'simulado',
        cae: caeSimulado,
        vencimiento_cae: vencimiento.toISOString().split('T')[0],
        punto_venta: String(puntoVenta).padStart(5, '0'),
        numero_comprobante: numeroComprobante
      };
    }

    // 1. Obtener credenciales activas del WSAA (Token + Sign con caché 12hs)
    const auth = await wsaaService.obtenerCredenciales();

    // 2. Si no se especificó un número, consultar el próximo oficial a ARCA
    let nroCbte = numeroComprobante;
    if (!nroCbte) {
      const cbteTipo = arcaAdapter.obtenerCbteTipo(tipoFactura);
      const ultimo = await wsfeService.feCompUltimoAutorizado(auth, puntoVenta, cbteTipo);
      nroCbte = ultimo + 1;
    }

    // 3. Construir requerimiento exacto para WSFEv1
    const feCAEReq = arcaAdapter.construirRequerimientoCAE({
      tipoFactura,
      puntoVenta,
      numeroComprobante: nroCbte,
      cliente,
      subtotal,
      iva21,
      iva105,
      total,
      fechaEmision
    });

    // 4. Enviar a ARCA
    const respuesta = await wsfeService.fecaeSolicitar(auth, feCAEReq);

    // Formato de vencimiento devuelto por ARCA: YYYYMMDD -> YYYY-MM-DD
    let vencimientoFormateado = respuesta.vencimientoCae;
    if (vencimientoFormateado && vencimientoFormateado.length === 8) {
      vencimientoFormateado = `${vencimientoFormateado.slice(0, 4)}-${vencimientoFormateado.slice(4, 6)}-${vencimientoFormateado.slice(6, 8)}`;
    }

    return {
      success: true,
      modo: 'arca_real',
      resultado: respuesta.resultado,
      cae: String(respuesta.cae),
      vencimiento_cae: vencimientoFormateado,
      punto_venta: String(puntoVenta).padStart(5, '0'),
      numero_comprobante: parseInt(respuesta.numeroComprobante || nroCbte, 10),
      observaciones: respuesta.observaciones
    };
  }
}

module.exports = new ArcaService();
