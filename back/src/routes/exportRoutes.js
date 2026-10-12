const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

/**
 * RUTAS DE EXPORTACIÓN - PUMAX
 * Endpoints para descargar reportes en Excel y CSV
 */

// ============================================
// EXPORTAR A EXCEL
// ============================================

/**
 * GET /api/exportar/ventas/excel
 * Exporta reporte de ventas a Excel
 * Query params:
 *   - fecha_desde: YYYY-MM-DD (requerido)
 *   - fecha_hasta: YYYY-MM-DD (requerido)
 *   - tipo_operacion: BLANCO | NEGRO (opcional)
 */
router.get('/ventas/excel', exportController.exportarVentasExcel);

/**
 * GET /api/exportar/productos/excel
 * Exporta catálogo de productos a Excel
 * Query params:
 *   - categoria_id: número (opcional)
 *   - stock_bajo: true | false (opcional)
 */
router.get('/productos/excel', exportController.exportarProductosExcel);

/**
 * GET /api/exportar/facturacion/excel
 * Exporta reporte de facturación a Excel
 * Query params:
 *   - fecha_desde: YYYY-MM-DD (requerido)
 *   - fecha_hasta: YYYY-MM-DD (requerido)
 *   - tipo_factura: A | B | C | NEGRO (opcional)
 */
router.get('/facturacion/excel', exportController.exportarFacturacionExcel);

// ============================================
// EXPORTAR A CSV
// ============================================

/**
 * GET /api/exportar/csv
 * Exporta reportes a formato CSV
 * Query params:
 *   - tipo: ventas | productos | facturacion (requerido)
 *   - fecha_desde: YYYY-MM-DD (requerido para ventas y facturacion)
 *   - fecha_hasta: YYYY-MM-DD (requerido para ventas y facturacion)
 */
router.get('/csv', exportController.exportarCSV);

module.exports = router;