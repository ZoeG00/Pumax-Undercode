const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Sesion = sequelize.define('Sesion', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sesiones',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Relación con Usuario
Sesion.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Método para generar token único
Sesion.generarToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Método para verificar si el token está expirado
Sesion.prototype.estaExpirado = function() {
  return new Date() > this.fecha_expiracion;
};

module.exports = Sesion;
