const Joi = require('joi');

const bikeCreateSchema = Joi.object({
  plate: Joi.any(),
  brand: Joi.any(),
  model: Joi.any(),
  cylinder: Joi.any(),
  clientId: Joi.any(),
});

const bikeIdParamSchema = Joi.object({
  id: Joi.any(),
});

const bikeSearchSchema = Joi.object({
  plate: Joi.any(),
});

module.exports = { bikeCreateSchema, bikeIdParamSchema, bikeSearchSchema };
