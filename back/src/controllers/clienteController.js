const { Cliente } = require('../models');

// Obtener todos los clientes
exports.getAll = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      where: { activo: true }
    });
    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo clientes',
      error: error.message
    });
  }
};

// Obtener cliente por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cliente',
      error: error.message
    });
  }
};

// Crear cliente
exports.create = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: cliente
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creando cliente',
      error: error.message
    });
  }
};

// Actualizar cliente
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Cliente.update(req.body, {
      where: { id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    const cliente = await Cliente.findByPk(id);
    res.json({
      success: true,
      message: 'Cliente actualizado',
      data: cliente
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error actualizando cliente',
      error: error.message
    });
  }
};

// Eliminar cliente (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Cliente.update(
      { activo: false },
      { where: { id } }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente eliminado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando cliente',
      error: error.message
    });
  }
};