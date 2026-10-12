const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleIngreso = sequelize.define('DetalleIngreso', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ingreso_id: {
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
  precio_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detalle_ingresos',
  timestamps: false
});

module.exports = DetalleIngreso;