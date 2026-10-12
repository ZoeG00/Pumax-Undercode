const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

/**
 * RUTAS DE REPORTES - PUMAX
 * Todas las rutas para consultas de análisis de negocio
 */

// ============================================
// DASHBOARD PRINCIPAL
// ============================================
/**
 * GET /api/reportes/dashboard
 * Dashboard completo con KPIs y datos para gráficas
 * Incluye:
 *   - 8 KPIs principales (ventas, facturación, ticket, alertas, etc)
 *   - Ventas BLANCO vs NEGRO (pie chart)
 *   - Evolución de ventas por mes (line chart)
 *   - Top 5 productos más vendidos (bar chart)
 *   - Top 5 clientes del mes (tabla)
 *   - Facturación por tipo A/B/C/NEGRO (donut chart)
 *   - Pedidos por estado (bar chart)
 * No requiere parámetros
 */
router.get('/dashboard', reporteController.getDashboard);

// ============================================
// REPORTES DE VENTAS
// ============================================
/**
 * GET /api/reportes/ventas
 * Reporte detallado de ventas por período
 * Query params:
 *   - fecha_desde: YYYY-MM-DD (requerido)
 *   - fecha_hasta: YYYY-MM-DD (requerido)
 *   - tipo_operacion: BLANCO | NEGRO (opcional)
 */
router.get('/ventas', reporteController.getVentasPorPeriodo);

/**
 * GET /api/reportes/top-productos
 * Productos más vendidos en un período
 * Query params:
 *   - fecha_desde: YYYY-MM-DD (requerido)
 *   - fecha_hasta: YYYY-MM-DD (requerido)
 *   - limit: número (opcional, default: 20)
 *   - categoria_id: número (opcional, filtra por categoría)
 */
router.get('/top-productos', reporteController.getTopProductos);

/**
 * GET /api/reportes/top-clientes
 * Clientes con mayores compras en un período
 * Query params:
 *   - fecha_desde: YYYY-MM-DD (requerido)
 *   - fecha_hasta: YYYY-MM-DD (requerido)
 *   - limit: número (opcional, default: 20)
 */
router.get('/top-clientes', reporteController.getTopClientes);

// ============================================
// REPORTES DE STOCK
// ============================================
/**
 * GET /api/reportes/stock-critico
 * Productos con stock bajo o agotado
 * Query params:
 *   - categoria_id: número (opcional, filtra por categoría)
 */
router.get('/stock-critico', reporteController.getStockCritico);

/**
 * GET /api/reportes/movimientos-stock
 * Historial de movimientos de stock
 * Query params:
 *   - producto_id: número (opcional)
 *   - fecha_desde: YYYY-MM-DD (opcional)
 *   - fecha_hasta: YYYY-MM-DD (opcional)
 *   - tipo_movimiento: ENTRADA | SALIDA | AJUSTE (opcional)
 */
router.get('/movimientos-stock', reporteController.getMovimientosStock);

// ============================================
// REPORTES DE FACTURACIÓN
// ============================================
/**
 * GET /api/reportes/facturacion
 * Reporte de facturación detallado por período
 * Query params:
 *   - fecha_desde: YYYY-MM-DD (requerido)
 *   - fecha_hasta: YYYY-MM-DD (requerido)
 *   - tipo_factura: A | B | C | NEGRO (opcional)
 */
router.get('/facturacion', reporteController.getReporteFacturacion);

// ============================================
// REPORTES DE RENTABILIDAD
// ============================================
/**
 * GET /api/reportes/rentabilidad-categorias
 * Análisis de rentabilidad por categoría de productos
 * Query params:
 *   - fecha_desde: YYYY-MM-DD (requerido)
 *   - fecha_hasta: YYYY-MM-DD (requerido)
 *   - categoria_id: número (opcional, filtra categoría específica)
 */
router.get('/rentabilidad-categorias', reporteController.getRentabilidadCategorias);

module.exports = router;