const { Producto, Categoria } = require('../models');
// Obtener todos los productos CON categoría
exports.getAll = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { activo: true },
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo productos',
      error: error.message
    });
  }
};

// Obtener un producto por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nombre']
      }]
    });
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo producto',
      error: error.message
    });
  }
};

// Crear producto
exports.create = async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: producto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creando producto',
      error: error.message
    });
  }
};

// Actualizar producto
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Producto.update(req.body, {
      where: { id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    const producto = await Producto.findByPk(id);
    res.json({
      success: true,
      message: 'Producto actualizado',
      data: producto
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error actualizando producto',
      error: error.message
    });
  }
};

// Eliminar producto (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Producto.update(
      { activo: false },
      { where: { id } }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando producto',
      error: error.message
    });
  }
};