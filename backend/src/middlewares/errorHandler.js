const { ValidationError, UniqueConstraintError } = require('sequelize');

// Convierte errores controlados en respuestas consistentes.
const errorHandler = (err, req, res, next) => {
  const isValidationError = err instanceof ValidationError || err instanceof UniqueConstraintError;
  const statusCode = err.statusCode || (isValidationError ? 400 : 500);
  const message = err.message || 'Error interno del servidor';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
