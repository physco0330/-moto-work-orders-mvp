const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.any(),
  password: Joi.any(),
});

const registerSchema = Joi.object({
  name: Joi.any(),
  email: Joi.any(),
  password: Joi.any(),
  role: Joi.any(),
  active: Joi.any(),
});

module.exports = { loginSchema, registerSchema };
