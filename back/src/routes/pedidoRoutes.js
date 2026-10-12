const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const busquedas = require('../controllers/busquedasPedidos');

router.get('/', pedidoController.getAll);
router.get('/buscar', busquedas.getPedidosConFiltros);
router.get('/:id', pedidoController.getById);
router.post('/', pedidoController.create);
router.patch('/:id/estado', pedidoController.updateEstado);
router.get('/pendientes/cliente/:cliente_id', busquedas.getPedidosPendientesPorCliente);
router.get('/estadisticas/estados', busquedas.getEstadisticasPorEstado);

module.exports = router;