const { Op } = require('sequelize');
const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');

/**
 * BÚSQUEDAS Y FILTROS AVANZADOS - PRODUCTOS
 * GET /api/productos con múltiples parámetros de búsqueda
 */

const getProductosConFiltros = async (req, res) => {
  try {
    const { 
      buscar,           // Busca en código o descripción
      categoria_id,     // Filtro por categoría
      stock_bajo,       // true = solo stock <= stock_minimo
      sin_stock,        // true = solo stock = 0
      activo,           // true/false
      precio_min,       // Precio mínimo
      precio_max,       // Precio máximo
      order_by,         // Campo para ordenar: codigo, descripcion, precio, stock
      order,            // ASC o DESC
      limit,            // Cantidad de resultados
      offset            // Para paginación
    } = req.query;

    // Construir condiciones WHERE
    let whereConditions = {};

    // Búsqueda por texto (código o descripción)
    if (buscar) {
      whereConditions[Op.or] = [
        { codigo: { [Op.like]: `%${buscar}%` } },
        { descripcion: { [Op.like]: `%${buscar}%` } }
      ];
    }

    // Filtro por categoría
    if (categoria_id) {
      whereConditions.categoria_id = categoria_id;
    }

    // Filtro por estado activo
    if (activo !== undefined) {
      whereConditions.activo = activo === 'true';
    }

    // Filtro por rango de precios
    if (precio_min) {
      whereConditions.precio_venta = { 
        ...whereConditions.precio_venta,
        [Op.gte]: parseFloat(precio_min) 
      };
    }
    if (precio_max) {
      whereConditions.precio_venta = { 
        ...whereConditions.precio_venta,
        [Op.lte]: parseFloat(precio_max) 
      };
    }

    // Filtro por sin stock
    if (sin_stock === 'true') {
      whereConditions.stock = 0;
    }

    // Ordenamiento
    let orderClause = [['id', 'DESC']]; // Default
    if (order_by) {
      const validOrderFields = ['codigo', 'descripcion', 'precio_venta', 'stock', 'id'];
      const orderField = validOrderFields.includes(order_by) ? order_by : 'id';
      const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
      orderClause = [[orderField, orderDirection]];
    }

    // Paginación
    const limitValue = limit ? parseInt(limit) : 50;
    const offsetValue = offset ? parseInt(offset) : 0;

    // Ejecutar consulta base
    let productos = await Producto.findAll({
      where: whereConditions,
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ],
      order: orderClause
    });

    // Filtrar stock bajo después de la consulta (más simple y confiable)
    if (stock_bajo === 'true') {
      productos = productos.filter(p => p.stock > 0 && p.stock <= p.stock_minimo);
    }

    // Aplicar paginación manual
    const total = productos.length;
    const paginatedProductos = productos.slice(offsetValue, offsetValue + limitValue);

    // Metadata de paginación
    const totalPages = Math.ceil(total / limitValue);
    const currentPage = Math.floor(offsetValue / limitValue) + 1;

    res.json({
      metadata: {
        total,
        limit: limitValue,
        offset: offsetValue,
        currentPage,
        totalPages
      },
      filtros_aplicados: {
        buscar: buscar || null,
        categoria_id: categoria_id || null,
        stock_bajo: stock_bajo || null,
        sin_stock: sin_stock || null,
        activo: activo || null,
        precio_min: precio_min || null,
        precio_max: precio_max || null
      },
      productos: paginatedProductos
    });

  } catch (error) {
    console.error('Error en getProductosConFiltros:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener productos',
      error: error.message 
    });
  }
};

/**
 * BÚSQUEDA RÁPIDA DE PRODUCTOS
 * Para autocomplete o búsquedas rápidas
 */
const busquedaRapida = async (req, res) => {
  try {
    const { q } = req.query; // query string

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        mensaje: 'La búsqueda debe tener al menos 2 caracteres' 
      });
    }

    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { codigo: { [Op.like]: `%${q}%` } },
          { descripcion: { [Op.like]: `%${q}%` } }
        ],
        activo: true
      },
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['nombre']
        }
      ],
      attributes: ['id', 'codigo', 'descripcion', 'precio_venta', 'stock'],
      limit: 10,
      order: [['descripcion', 'ASC']]
    });

    res.json({
      total: productos.length,
      productos
    });

  } catch (error) {
    console.error('Error en busquedaRapida:', error);
    res.status(500).json({ 
      mensaje: 'Error en búsqueda rápida',
      error: error.message 
    });
  }
};

/**
 * VERIFICAR DISPONIBILIDAD DE STOCK
 * Para validar antes de crear pedido
 */
const verificarStock = async (req, res) => {
  try {
    const { items } = req.body; // [{ producto_id, cantidad }]

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ 
        mensaje: 'Se requiere un array de items' 
      });
    }

    const resultados = [];
    let todoDisponible = true;

    for (const item of items) {
      const producto = await Producto.findByPk(item.producto_id);
      
      if (!producto) {
        resultados.push({
          producto_id: item.producto_id,
          disponible: false,
          mensaje: 'Producto no encontrado',
          stock_actual: 0,
          cantidad_solicitada: item.cantidad
        });
        todoDisponible = false;
        continue;
      }

      const disponible = producto.stock >= item.cantidad;
      
      resultados.push({
        producto_id: item.producto_id,
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        disponible,
        stock_actual: producto.stock,
        cantidad_solicitada: item.cantidad,
        faltante: disponible ? 0 : item.cantidad - producto.stock,
        mensaje: disponible ? 'Stock disponible' : 'Stock insuficiente'
      });

      if (!disponible) {
        todoDisponible = false;
      }
    }

    res.json({
      todo_disponible: todoDisponible,
      verificacion: resultados
    });

  } catch (error) {
    console.error('Error en verificarStock:', error);
    res.status(500).json({ 
      mensaje: 'Error al verificar stock',
      error: error.message 
    });
  }
};

module.exports = {
  getProductosConFiltros,
  busquedaRapida,
  verificarStock
};