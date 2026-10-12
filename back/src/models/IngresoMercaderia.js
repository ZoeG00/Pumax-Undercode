const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IngresoMercaderia = sequelize.define('IngresoMercaderia', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  proveedor_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  numero_remito: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  numero_factura: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  usuario_registro_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  total_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'VERIFICADO', 'COMPLETADO'),
    defaultValue: 'PENDIENTE'
  }
}, {
  tableName: 'ingresos_mercaderia',
  timestamps: false
});

module.exports = IngresoMercaderia;