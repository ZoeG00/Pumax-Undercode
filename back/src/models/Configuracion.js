const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  clave: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_dato: {
    type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON'),
    defaultValue: 'STRING'
  }
}, {
  tableName: 'configuracion',
  timestamps: true,
  createdAt: false,
  updatedAt: 'fecha_modificacion'
});

module.exports = Configuracion;