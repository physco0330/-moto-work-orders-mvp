const Joi = require('joi');

// Valida req.body, req.query o req.params con un esquema Joi.
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((detail) => detail.message),
    });
  }

  req[property] = value;
  next();
};

module.exports = validate;
