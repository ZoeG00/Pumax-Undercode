const Categoria = require('../models/Categoria');

// Obtener todas las categorías
exports.getAll = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { activo: true }
    });
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías',
      error: error.message
    });
  }
};

// Crear categoría
exports.create = async (req, res) => {
  try {
    const categoria = await Categoria.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoria
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creando categoría',
      error: error.message
    });
  }
};

// Actualizar categoría
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Categoria.update(req.body, {
      where: { id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    const categoria = await Categoria.findByPk(id);
    res.json({
      success: true,
      message: 'Categoría actualizada',
      data: categoria
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error actualizando categoría',
      error: error.message
    });
  }
};

// Eliminar categoría (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Categoria.update(
      { activo: false },
      { where: { id } }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Categoría eliminada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando categoría',
      error: error.message
    });
  }
};