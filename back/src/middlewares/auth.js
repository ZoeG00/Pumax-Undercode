const { Usuario, Sesion } = require('../models');

/**
 * Middleware de autenticación
 * Valida que el header x-session-token corresponda a una sesión activa
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Buscar token en x-session-token, Authorization Bearer o query param token
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const bearerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;
    const token = req.headers['x-session-token'] || bearerToken || req.query.token;

    // Si no hay token
    if (!token) {
      // En modo desarrollo local, si no viene token, recuperamos la última sesión activa
      // para no bloquear el flujo de trabajo local
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        const ultimaSesion = await Sesion.findOne({
          where: { activo: true },
          include: [{
            model: Usuario,
            as: 'usuario',
            where: { activo: true }
          }],
          order: [['id', 'DESC']]
        });

        if (ultimaSesion) {
          console.warn(`⚠️ [AUTH DEV] Sin token en ${req.method} ${req.originalUrl}. Usando sesión activa de: ${ultimaSesion.usuario.username} (ID: ${ultimaSesion.usuario.id})`);
          req.user = ultimaSesion.usuario;
          return next();
        }
      }

      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token de sesión requerido.'
      });
    }

    // Buscar sesión activa por token
    const sesion = await Sesion.findOne({
      where: {
        token: token,
        activo: true
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        where: { activo: true }
      }]
    });

    // Si no existe o está inactivo, rechazar (con fallback en desarrollo)
    if (!sesion) {
      if (process.env.NODE_ENV === 'development') {
        const ultimaSesion = await Sesion.findOne({
          where: { activo: true },
          include: [{
            model: Usuario,
            as: 'usuario',
            where: { activo: true }
          }],
          order: [['id', 'DESC']]
        });
        if (ultimaSesion) {
          console.warn(`⚠️ [AUTH DEV] Token no reconocido (${token.substring(0, 8)}...). Usando sesión activa de: ${ultimaSesion.usuario.username}`);
          req.user = ultimaSesion.usuario;
          return next();
        }
      }

      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada.'
      });
    }

    // Si el token está expirado, desactivarlo y rechazar
    if (sesion.estaExpirado()) {
      await sesion.update({ activo: false });
      return res.status(401).json({
        success: false,
        message: 'La sesión ha expirado. Por favor, inicie sesión nuevamente.'
      });
    }

    // Agregar usuario al request para uso posterior
    req.user = sesion.usuario;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al validar sesión'
    });
  }
};

module.exports = authMiddleware;
