const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  razon_social: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  cuit: {
    type: DataTypes.STRING(15),
    unique: true,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contacto_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'proveedores',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Proveedor;