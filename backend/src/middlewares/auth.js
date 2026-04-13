const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Valida el token y adjunta el usuario autenticado a req.user.
const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password_hash'] } });

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Usuario inactivo o no encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
};

module.exports = auth;
