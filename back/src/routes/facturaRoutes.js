const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');
const busquedas = require('../controllers/busquedasClientesFacturas');

router.get('/', facturaController.getAll);
router.get('/buscar', busquedas.getFacturasConFiltros);
router.get('/arca/status', facturaController.getArcaStatus);
router.get('/:id', facturaController.getById);
router.get('/:id/pdf', facturaController.getPDF);
router.get('/cliente/:cliente_id', busquedas.getFacturasPorCliente);
router.post('/negro', facturaController.createNegro);
router.post('/legal', facturaController.createLegal);
router.patch('/:id/anular', facturaController.anular);


module.exports = router;