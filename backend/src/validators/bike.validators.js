const Joi = require('joi');

const bikeCreateSchema = Joi.object({
  plate: Joi.any().allow(null, ''),
  brand: Joi.any().allow(null, ''),
  model: Joi.string().required(),
  cylinder: Joi.any().allow(null),
  year: Joi.any().allow(null),
  hours: Joi.any().allow(null),
  clientId: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().allow('', null)
  ).required(),
});

const bikeIdParamSchema = Joi.object({
  id: Joi.any(),
});

const bikeSearchSchema = Joi.object({
  plate: Joi.any(),
});

module.exports = { bikeCreateSchema, bikeIdParamSchema, bikeSearchSchema };
