const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empleado = sequelize.define('Empleado', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  dni: {
    type: DataTypes.STRING(15),
    unique: true,
    allowNull: false
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
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'empleados',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false
});

module.exports = Empleado;