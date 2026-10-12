const sequelize = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida.');

    const sqlPath = path.join(__dirname, 'create_detalle_facturas.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando migración...');
    await sequelize.query(sql);
    console.log('✓ Tabla detalle_facturas creada exitosamente');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();
