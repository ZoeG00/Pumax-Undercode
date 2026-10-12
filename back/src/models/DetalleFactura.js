const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleFactura = sequelize.define('DetalleFactura', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  factura_id: {
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
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detalle_facturas',
  timestamps: false
});

module.exports = DetalleFactura;
