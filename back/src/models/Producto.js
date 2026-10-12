const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  categoria_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  precio_base: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  margen_ganancia: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 20.00
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'productos',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Producto;