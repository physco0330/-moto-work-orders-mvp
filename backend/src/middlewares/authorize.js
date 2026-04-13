// Bloquea rutas segun el rol permitido.
const authorize = (roles = []) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'No autorizado para realizar esta accion' });
  }

  next();
};

module.exports = authorize;
