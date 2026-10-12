const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Factura = sequelize.define('Factura', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  numero_factura: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  pedido_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  cliente_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  tipo_factura: {
    type: DataTypes.ENUM('A', 'B', 'C', 'NEGRO'),
    allowNull: false
  },
  punto_venta: {
    type: DataTypes.STRING(5),
    defaultValue: '00001'
  },
  fecha_emision: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  iva_21: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  iva_105: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cae: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  vencimiento_cae: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('EMITIDA', 'ANULADA'),
    defaultValue: 'EMITIDA'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuario_emision_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  tableName: 'facturas',
  timestamps: false
});

module.exports = Factura;