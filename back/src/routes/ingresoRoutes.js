const express = require('express');
const router = express.Router();
const ingresoController = require('../controllers/ingresoController');

router.get('/', ingresoController.getAll);
router.get('/:id', ingresoController.getById);
router.post('/', ingresoController.create);
router.patch('/:id/verificar', ingresoController.verificar);
router.patch('/:id/completar', ingresoController.completar);

module.exports = router;