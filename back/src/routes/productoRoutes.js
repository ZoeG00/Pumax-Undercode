const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const busquedas = require('../controllers/busquedasProductos');


router.get('/', productoController.getAll);
router.get('/buscar', busquedas.getProductosConFiltros);
router.get('/busqueda-rapida', busquedas.busquedaRapida);
router.get('/:id', productoController.getById);
router.post('/', productoController.create);
router.post('/verificar-stock', busquedas.verificarStock);
router.put('/:id', productoController.update);
router.delete('/:id', productoController.delete);

module.exports = router;