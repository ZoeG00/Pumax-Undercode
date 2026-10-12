const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Categoria;