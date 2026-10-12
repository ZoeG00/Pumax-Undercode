const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  empleado_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('ADMIN', 'VENDEDOR', 'DEPOSITO', 'FACTURACION', 'VIAJANTE'),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: false
});

module.exports = Usuario;