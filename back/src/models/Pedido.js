const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  numero_pedido: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  cliente_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  usuario_registro_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  fecha_pedido: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_entrega: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'),
    defaultValue: 'PENDIENTE'
  },
  tipo_operacion: {
    type: DataTypes.ENUM('BLANCO', 'NEGRO'),
    defaultValue: 'BLANCO'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  descuento_porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  descuento_monto: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pedidos',
  timestamps: false
});

module.exports = Pedido;