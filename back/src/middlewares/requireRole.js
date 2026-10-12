/**
 * Limita una ruta a ciertos roles. Debe ir DESPUÉS del authMiddleware.
 *
 * Uso: router.use(requireRole('ADMIN'));
 */
const requireRole = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tenés permisos para realizar esta acción'
    });
  }
  next();
};

module.exports = requireRole;
