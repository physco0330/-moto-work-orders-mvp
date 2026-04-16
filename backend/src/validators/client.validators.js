const Joi = require('joi');

const clientCreateSchema = Joi.object({
  name: Joi.any(),
  phone: Joi.any(),
  email: Joi.any(),
});

const clientIdParamSchema = Joi.object({
  id: Joi.any(),
});

const clientSearchSchema = Joi.object({
  search: Joi.any(),
});

module.exports = { clientCreateSchema, clientIdParamSchema, clientSearchSchema };
