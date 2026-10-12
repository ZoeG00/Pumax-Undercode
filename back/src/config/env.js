/**
 * Carga las variables de entorno desde back/.env, sin importar desde qué
 * carpeta se ejecute el servidor (nodemon, node, scripts, etc.).
 * Debe ser lo PRIMERO que se importa.
 */
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '..', '.env');
require('dotenv').config({ path: ENV_PATH });

/** Corta el arranque con un mensaje claro si faltan variables de la base de datos. */
function checkRequiredEnv() {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`✗ Faltan variables en ${ENV_PATH}: ${missing.join(', ')}`);
    console.error('  Copiá .env.example a .env y completalo con tus datos de MySQL.');
    process.exit(1);
  }
}

module.exports = { ENV_PATH, checkRequiredEnv };
