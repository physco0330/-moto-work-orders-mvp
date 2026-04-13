const Joi = require('joi');

const clientCreateSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().min(5).max(40).required(),
  email: Joi.string().email().optional().allow(null, ''),
});

const clientIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const clientSearchSchema = Joi.object({
  search: Joi.string().allow('').optional(),
});

module.exports = { clientCreateSchema, clientIdParamSchema, clientSearchSchema };
