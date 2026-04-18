const Joi = require('joi');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clientCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'El nombre es requerido',
    'any.required': 'El nombre es requerido'
  }),
  phone: Joi.string().trim().min(1).required().messages({
    'string.empty': 'El teléfono es requerido',
    'any.required': 'El teléfono es requerido'
  }),
  email: Joi.string().trim().pattern(emailRegex).required().messages({
    'string.pattern.base': 'El email debe tener un formato válido (ej: ejemplo@correo.com)',
    'any.required': 'El email es requerido'
  }),
});

const clientIdParamSchema = Joi.object({
  id: Joi.any(),
});

const clientSearchSchema = Joi.object({
  search: Joi.any(),
});

module.exports = { clientCreateSchema, clientIdParamSchema, clientSearchSchema };
