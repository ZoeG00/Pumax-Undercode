const { Proveedor } = require('../models');

// Obtener todos los proveedores
exports.getAll = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });
    res.json({
      success: true,
      data: proveedores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo proveedores',
      error: error.message
    });
  }
};

// Obtener proveedor por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);
    
    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: proveedor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo proveedor',
      error: error.message
    });
  }
};

// Crear proveedor
exports.create = async (req, res) => {
  try {
    const proveedor = await Proveedor.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: proveedor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creando proveedor',
      error: error.message
    });
  }
};

// Actualizar proveedor
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Proveedor.update(req.body, {
      where: { id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }
    
    const proveedor = await Proveedor.findByPk(id);
    res.json({
      success: true,
      message: 'Proveedor actualizado',
      data: proveedor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error actualizando proveedor',
      error: error.message
    });
  }
};

// Eliminar proveedor (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Proveedor.update(
      { activo: false },
      { where: { id } }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Proveedor eliminado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando proveedor',
      error: error.message
    });
  }
};