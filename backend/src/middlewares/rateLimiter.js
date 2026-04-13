const rateLimit = require('express-rate-limit');

// Limita intentos de login para reducir fuerza bruta.
const loginRateLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesion. Intenta mas tarde.' },
});

module.exports = { loginRateLimiter };
