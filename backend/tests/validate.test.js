const validate = require('../src/middlewares/validate');
const Joi = require('joi');

describe('validate middleware', () => {
  test('devuelve 400 con errores formateados', () => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const req = { body: { email: 'bad-email' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error', errors: expect.any(Array) }));
    expect(next).not.toHaveBeenCalled();
  });
});
