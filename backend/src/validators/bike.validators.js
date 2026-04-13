const Joi = require('joi');

const bikeCreateSchema = Joi.object({
  plate: Joi.string().min(2).max(30).required(),
  brand: Joi.string().min(2).max(120).required(),
  model: Joi.string().min(1).max(120).required(),
  cylinder: Joi.number().integer().min(0).optional().allow(null),
  clientId: Joi.number().integer().positive().required(),
});

const bikeIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const bikeSearchSchema = Joi.object({
  plate: Joi.string().allow('').optional(),
});

module.exports = { bikeCreateSchema, bikeIdParamSchema, bikeSearchSchema };
