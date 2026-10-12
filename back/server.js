const { checkRequiredEnv } = require('./src/config/env');
checkRequiredEnv();

const app = require('./src/app');
const sequelize = require('./src/config/database');
// Cargar modelos con relaciones
const { Sesion } = require('./src/models');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a MySQL establecida');

    // Sincronizar tabla de sesiones (solo si no existe)
    await Sesion.sync();
    console.log('✓ Tabla de sesiones sincronizada');

    console.log('✓ Modelos cargados correctamente');

    app.listen(PORT, () => {
      console.log(`✓ Servidor corriendo en puerto ${PORT}`);
      console.log(`✓ API disponible en: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('✗ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();