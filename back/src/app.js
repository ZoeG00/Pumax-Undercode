const express = require('express');
const cors = require('cors');
require('./config/env');

const routes = require('./routes');

const app = express();

// ============================================
// MIDDLEWARES - ORDEN CRÍTICO
// ============================================

// 1. PARSERS PRIMERO (antes de todo)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS después de parsers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-token', 'ngrok-skip-browser-warning'],
  exposedHeaders: ['x-session-token'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// 3. Rutas al final
app.use('/api', routes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API Pumax funcionando',
    version: '1.0.0'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;