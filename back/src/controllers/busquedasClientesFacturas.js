const { Op } = require('sequelize');
const { sequelize } = require('../config/database'); // Importar sequelize
const Cliente = require('../models/Cliente');
const Factura = require('../models/Factura');
const Pedido = require('../models/Pedido');

/**
 * ========================================
 * BÚSQUEDAS Y FILTROS - CLIENTES
 * ========================================
 */

const getClientesConFiltros = async (req, res) => {
  try {
    const { 
      buscar,           // Busca en nombre, razón social o CUIT
      tipo_cliente,     // MINORISTA, MAYORISTA
      condicion_iva,    // RI, MONOTRIBUTO, EXENTO, CONSUMIDOR_FINAL
      provincia,        // Filtro por provincia
      localidad,        // Filtro por localidad
      activo,           // true/false
      con_deuda,        // true = saldo_actual > 0
      order_by,
      order,
      limit,
      offset
    } = req.query;

    let whereConditions = {};

    // Búsqueda por texto
    if (buscar) {
      whereConditions[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
        { razon_social: { [Op.like]: `%${buscar}%` } },
        { cuit: { [Op.like]: `%${buscar}%` } }
      ];
    }

    // Filtros específicos
    if (tipo_cliente) {
      whereConditions.tipo_cliente = tipo_cliente;
    }

    if (condicion_iva) {
      whereConditions.condicion_iva = condicion_iva;
    }

    if (provincia) {
      whereConditions.provincia = { [Op.like]: `%${provincia}%` };
    }

    if (localidad) {
      whereConditions.localidad = { [Op.like]: `%${localidad}%` };
    }

    if (activo !== undefined) {
      whereConditions.activo = activo === 'true';
    }

    if (con_deuda === 'true') {
      whereConditions.saldo_actual = { [Op.gt]: 0 };
    }

    // Ordenamiento
    let orderClause = [['nombre', 'ASC']];
    if (order_by) {
      const validOrderFields = ['nombre', 'tipo_cliente', 'saldo_actual', 'id'];
      const orderField = validOrderFields.includes(order_by) ? order_by : 'nombre';
      const orderDirection = order === 'DESC' ? 'DESC' : 'ASC';
      orderClause = [[orderField, orderDirection]];
    }

    // Paginación
    const limitValue = limit ? parseInt(limit) : 50;
    const offsetValue = offset ? parseInt(offset) : 0;

    const { count, rows } = await Cliente.findAndCountAll({
      where: whereConditions,
      order: orderClause,
      limit: limitValue,
      offset: offsetValue
    });

    const totalPages = Math.ceil(count / limitValue);
    const currentPage = Math.floor(offsetValue / limitValue) + 1;

    res.json({
      metadata: {
        total: count,
        limit: limitValue,
        offset: offsetValue,
        currentPage,
        totalPages
      },
      filtros_aplicados: {
        buscar: buscar || null,
        tipo_cliente: tipo_cliente || null,
        condicion_iva: condicion_iva || null,
        provincia: provincia || null,
        localidad: localidad || null,
        activo: activo || null,
        con_deuda: con_deuda || null
      },
      clientes: rows
    });

  } catch (error) {
    console.error('Error en getClientesConFiltros:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener clientes',
      error: error.message 
    });
  }
};

/**
 * BÚSQUEDA RÁPIDA DE CLIENTES
 * Para autocomplete
 */
const busquedaRapidaClientes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        mensaje: 'La búsqueda debe tener al menos 2 caracteres' 
      });
    }

    const clientes = await Cliente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { razon_social: { [Op.like]: `%${q}%` } },
          { cuit: { [Op.like]: `%${q}%` } }
        ],
        activo: true
      },
      attributes: ['id', 'nombre', 'razon_social', 'cuit', 'tipo_cliente', 'condicion_iva'],
      limit: 10,
      order: [['nombre', 'ASC']]
    });

    res.json({
      total: clientes.length,
      clientes
    });

  } catch (error) {
    console.error('Error en busquedaRapidaClientes:', error);
    res.status(500).json({ 
      mensaje: 'Error en búsqueda rápida',
      error: error.message 
    });
  }
};

/**
 * ========================================
 * BÚSQUEDAS Y FILTROS - FACTURAS
 * ========================================
 */

const getFacturasConFiltros = async (req, res) => {
  try {
    const { 
      numero_factura,   // Buscar por número
      cliente_id,       // Filtro por cliente
      tipo_factura,     // A, B, C, NEGRO
      estado,           // EMITIDA, ANULADA
      fecha_desde,      // Fecha inicio
      fecha_hasta,      // Fecha fin
      monto_min,        // Monto mínimo
      monto_max,        // Monto máximo
      con_cae,          // true = solo facturas con CAE
      order_by,
      order,
      limit,
      offset
    } = req.query;

    let whereConditions = {};

    // Búsqueda por número
    if (numero_factura) {
      whereConditions.numero_factura = { [Op.like]: `%${numero_factura}%` };
    }

    // Filtros
    if (cliente_id) {
      whereConditions.cliente_id = cliente_id;
    }

    if (tipo_factura) {
      whereConditions.tipo_factura = tipo_factura;
    }

    if (estado) {
      whereConditions.estado = estado;
    }

    if (con_cae === 'true') {
      whereConditions.cae = { [Op.ne]: null };
    }

    // Filtro por rango de fechas
    if (fecha_desde && fecha_hasta) {
      whereConditions.fecha_emision = {
        [Op.between]: [fecha_desde, fecha_hasta + ' 23:59:59']
      };
    } else if (fecha_desde) {
      whereConditions.fecha_emision = {
        [Op.gte]: fecha_desde
      };
    } else if (fecha_hasta) {
      whereConditions.fecha_emision = {
        [Op.lte]: fecha_hasta + ' 23:59:59'
      };
    }

    // Filtro por rango de montos
    if (monto_min) {
      whereConditions.total = { 
        ...whereConditions.total,
        [Op.gte]: parseFloat(monto_min) 
      };
    }
    if (monto_max) {
      whereConditions.total = { 
        ...whereConditions.total,
        [Op.lte]: parseFloat(monto_max) 
      };
    }

    // Ordenamiento
    let orderClause = [['fecha_emision', 'DESC']];
    if (order_by) {
      const validOrderFields = ['numero_factura', 'fecha_emision', 'total', 'tipo_factura', 'id'];
      const orderField = validOrderFields.includes(order_by) ? order_by : 'fecha_emision';
      const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
      orderClause = [[orderField, orderDirection]];
    }

    // Paginación
    const limitValue = limit ? parseInt(limit) : 50;
    const offsetValue = offset ? parseInt(offset) : 0;

    const { count, rows } = await Factura.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'cuit', 'condicion_iva']
        },
        {
          model: Pedido,
          as: 'pedido',
          attributes: ['id', 'numero_pedido']
        }
      ],
      order: orderClause,
      limit: limitValue,
      offset: offsetValue
    });

    const totalPages = Math.ceil(count / limitValue);
    const currentPage = Math.floor(offsetValue / limitValue) + 1;

    // Estadísticas
    const estadisticas = {
      total_facturas: count,
      total_facturado: rows.reduce((sum, f) => sum + parseFloat(f.total), 0),
      total_iva: rows.reduce((sum, f) => sum + parseFloat(f.iva_21) + parseFloat(f.iva_105), 0)
    };

    res.json({
      metadata: {
        total: count,
        limit: limitValue,
        offset: offsetValue,
        currentPage,
        totalPages
      },
      filtros_aplicados: {
        numero_factura: numero_factura || null,
        cliente_id: cliente_id || null,
        tipo_factura: tipo_factura || null,
        estado: estado || null,
        fecha_desde: fecha_desde || null,
        fecha_hasta: fecha_hasta || null,
        monto_min: monto_min || null,
        monto_max: monto_max || null
      },
      estadisticas,
      facturas: rows
    });

  } catch (error) {
    console.error('Error en getFacturasConFiltros:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener facturas',
      error: error.message 
    });
  }
};

/**
 * FACTURAS POR CLIENTE
 * Ver todas las facturas de un cliente específico
 */
const getFacturasPorCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const { estado, tipo_factura } = req.query;

    let whereConditions = { cliente_id };

    if (estado) {
      whereConditions.estado = estado;
    }

    if (tipo_factura) {
      whereConditions.tipo_factura = tipo_factura;
    }

    const facturas = await Factura.findAll({
      where: whereConditions,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['nombre', 'condicion_iva']
        }
      ],
      order: [['fecha_emision', 'DESC']]
    });

    const total_facturado = facturas.reduce((sum, f) => sum + parseFloat(f.total), 0);

    res.json({
      cliente_id,
      cantidad_facturas: facturas.length,
      total_facturado,
      facturas
    });

  } catch (error) {
    console.error('Error en getFacturasPorCliente:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener facturas del cliente',
      error: error.message 
    });
  }
};

module.exports = {
  // Clientes
  getClientesConFiltros,
  busquedaRapidaClientes,
  // Facturas
  getFacturasConFiltros,
  getFacturasPorCliente
};