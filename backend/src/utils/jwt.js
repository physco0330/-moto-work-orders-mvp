const jwt = require('jsonwebtoken');

// Firma un token corto para la sesion del usuario.
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

module.exports = { signToken };
