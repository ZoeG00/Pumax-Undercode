const express = require('express');
const router = express.Router();

const productoBusquedas = require('../controllers/busquedasProductos');
const pedidoBusquedas = require('../controllers/busquedasPedidos');
const clienteFacturaBusquedas = require('../controllers/busquedasClientesFacturas');

/**
 * RUTAS DE BÚSQUEDAS Y FILTROS AVANZADOS
 * Endpoint base: /api/busquedas
 */

// ============================================
// PRODUCTOS
// ============================================

/**
 * GET /api/busquedas/productos
 * Búsqueda avanzada de productos con múltiples filtros
 * 
 * Query params:
 *   - buscar: string (busca en código o descripción)
 *   - categoria_id: number
 *   - stock_bajo: true/false (stock <= stock_minimo)
 *   - sin_stock: true/false (stock = 0)
 *   - activo: true/false
 *   - precio_min: number
 *   - precio_max: number
 *   - order_by: codigo | descripcion | precio_venta | stock
 *   - order: ASC | DESC
 *   - limit: number (default: 50)
 *   - offset: number (default: 0)
 * 
 * Ejemplos:
 *   /api/busquedas/productos?buscar=cable&categoria_id=1
 *   /api/busquedas/productos?stock_bajo=true&order_by=stock&order=ASC
 *   /api/busquedas/productos?precio_min=1000&precio_max=5000
 */
router.get('/productos', productoBusquedas.getProductosConFiltros);

/**
 * GET /api/busquedas/productos/rapida
 * Búsqueda rápida para autocomplete (máximo 10 resultados)
 * 
 * Query params:
 *   - q: string (mínimo 2 caracteres)
 * 
 * Ejemplo:
 *   /api/busquedas/productos/rapida?q=led
 */
router.get('/productos/rapida', productoBusquedas.busquedaRapida);

/**
 * POST /api/busquedas/productos/verificar-stock
 * Verificar disponibilidad de stock para múltiples productos
 * 
 * Body:
 *   {
 *     "items": [
 *       { "producto_id": 1, "cantidad": 10 },
 *       { "producto_id": 2, "cantidad": 5 }
 *     ]
 *   }
 * 
 * Response:
 *   {
 *     "todo_disponible": true/false,
 *     "verificacion": [...]
 *   }
 */
router.post('/productos/verificar-stock', productoBusquedas.verificarStock);

// ============================================
// PEDIDOS
// ============================================

/**
 * GET /api/busquedas/pedidos
 * Búsqueda avanzada de pedidos con múltiples filtros
 * 
 * Query params:
 *   - numero_pedido: string
 *   - cliente_id: number
 *   - estado: PENDIENTE | PREPARANDO | LISTO | ENTREGADO | CANCELADO
 *   - tipo_operacion: BLANCO | NEGRO
 *   - fecha_desde: YYYY-MM-DD
 *   - fecha_hasta: YYYY-MM-DD
 *   - monto_min: number
 *   - monto_max: number
 *   - usuario_id: number
 *   - order_by: numero_pedido | fecha_pedido | total | estado
 *   - order: ASC | DESC
 *   - limit: number
 *   - offset: number
 * 
 * Ejemplos:
 *   /api/busquedas/pedidos?estado=PENDIENTE&tipo_operacion=BLANCO
 *   /api/busquedas/pedidos?cliente_id=5&fecha_desde=2024-10-01&fecha_hasta=2024-10-31
 *   /api/busquedas/pedidos?monto_min=10000&order_by=total&order=DESC
 */
router.get('/pedidos', pedidoBusquedas.getPedidosConFiltros);

/**
 * GET /api/busquedas/pedidos/pendientes/:cliente_id
 * Obtener todos los pedidos pendientes de un cliente
 * 
 * Ejemplo:
 *   /api/busquedas/pedidos/pendientes/5
 */
router.get('/pedidos/pendientes/:cliente_id', pedidoBusquedas.getPedidosPendientesPorCliente);

/**
 * GET /api/busquedas/pedidos/estadisticas
 * Estadísticas de pedidos agrupadas por estado
 * 
 * Response:
 *   {
 *     "estadisticas": [
 *       { "estado": "PENDIENTE", "cantidad": 5, "total_monto": 50000 },
 *       ...
 *     ]
 *   }
 */
router.get('/pedidos/estadisticas', pedidoBusquedas.getEstadisticasPorEstado);

// ============================================
// CLIENTES
// ============================================

/**
 * GET /api/busquedas/clientes
 * Búsqueda avanzada de clientes con múltiples filtros
 * 
 * Query params:
 *   - buscar: string (busca en nombre, razón social o CUIT)
 *   - tipo_cliente: MINORISTA | MAYORISTA
 *   - condicion_iva: RI | MONOTRIBUTO | EXENTO | CONSUMIDOR_FINAL
 *   - provincia: string
 *   - localidad: string
 *   - activo: true/false
 *   - con_deuda: true/false (saldo_actual > 0)
 *   - order_by: nombre | tipo_cliente | saldo_actual
 *   - order: ASC | DESC
 *   - limit: number
 *   - offset: number
 * 
 * Ejemplos:
 *   /api/busquedas/clientes?tipo_cliente=MAYORISTA&provincia=Mendoza
 *   /api/busquedas/clientes?buscar=garcia&activo=true
 *   /api/busquedas/clientes?con_deuda=true&order_by=saldo_actual&order=DESC
 */
router.get('/clientes', clienteFacturaBusquedas.getClientesConFiltros);

/**
 * GET /api/busquedas/clientes/rapida
 * Búsqueda rápida de clientes para autocomplete
 * 
 * Query params:
 *   - q: string (mínimo 2 caracteres)
 * 
 * Ejemplo:
 *   /api/busquedas/clientes/rapida?q=distrib
 */
router.get('/clientes/rapida', clienteFacturaBusquedas.busquedaRapidaClientes);

// ============================================
// FACTURAS
// ============================================

/**
 * GET /api/busquedas/facturas
 * Búsqueda avanzada de facturas con múltiples filtros
 * 
 * Query params:
 *   - numero_factura: string
 *   - cliente_id: number
 *   - tipo_factura: A | B | C | NEGRO
 *   - estado: EMITIDA | ANULADA
 *   - fecha_desde: YYYY-MM-DD
 *   - fecha_hasta: YYYY-MM-DD
 *   - monto_min: number
 *   - monto_max: number
 *   - con_cae: true/false (solo facturas con CAE)
 *   - order_by: numero_factura | fecha_emision | total | tipo_factura
 *   - order: ASC | DESC
 *   - limit: number
 *   - offset: number
 * 
 * Ejemplos:
 *   /api/busquedas/facturas?tipo_factura=NEGRO&fecha_desde=2024-10-01
 *   /api/busquedas/facturas?cliente_id=5&estado=EMITIDA
 *   /api/busquedas/facturas?monto_min=50000&order_by=total&order=DESC
 */
router.get('/facturas', clienteFacturaBusquedas.getFacturasConFiltros);

/**
 * GET /api/busquedas/facturas/cliente/:cliente_id
 * Obtener todas las facturas de un cliente específico
 * 
 * Query params opcionales:
 *   - estado: EMITIDA | ANULADA
 *   - tipo_factura: A | B | C | NEGRO
 * 
 * Ejemplos:
 *   /api/busquedas/facturas/cliente/5
 *   /api/busquedas/facturas/cliente/5?tipo_factura=NEGRO
 */
router.get('/facturas/cliente/:cliente_id', clienteFacturaBusquedas.getFacturasPorCliente);

module.exports = router;