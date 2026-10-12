const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  pedido_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  producto_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descuento_item: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detalle_pedidos',
  timestamps: false
});

module.exports = DetallePedido;