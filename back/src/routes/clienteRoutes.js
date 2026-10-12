const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const busquedas = require('../controllers/busquedasClientesFacturas');

router.get('/', clienteController.getAll);
router.get('/buscar', busquedas.getClientesConFiltros);
router.get('/:id', clienteController.getById);
router.post('/', clienteController.create);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.delete);
router.get('/busqueda-rapida', busquedas.busquedaRapidaClientes);

module.exports = router;