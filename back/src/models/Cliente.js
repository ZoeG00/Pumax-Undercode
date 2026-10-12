const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
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
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  localidad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  provincia: {
    type: DataTypes.STRING(100),
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
  tipo_cliente: {
    type: DataTypes.ENUM('MINORISTA', 'MAYORISTA'),
    defaultValue: 'MINORISTA'
  },
  condicion_iva: {
    type: DataTypes.ENUM('RI', 'MONOTRIBUTO', 'EXENTO', 'CONSUMIDOR_FINAL'),
    defaultValue: 'CONSUMIDOR_FINAL'
  },
  descuento_habitual: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  limite_credito: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  saldo_actual: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Cliente;