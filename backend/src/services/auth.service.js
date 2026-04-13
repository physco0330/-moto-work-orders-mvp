const { User } = require('../models');
const { comparePassword, hashPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

// Maneja autenticacion y emision de token.
const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !user.active) {
    const error = new Error('Credenciales invalidas');
    error.statusCode = 401;
    throw error;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const error = new Error('Credenciales invalidas');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user.id, role: user.role });
  const safeUser = user.toJSON();
  delete safeUser.password_hash;

  return { token, user: safeUser };
};

const register = async (payload) => {
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    const error = new Error('El email ya esta registrado');
    error.statusCode = 400;
    throw error;
  }

  const created = await User.create({
    name: payload.name,
    email: payload.email,
    password_hash: await hashPassword(payload.password),
    role: payload.role || 'MECANICO',
    active: payload.active ?? true,
  });

  const safeUser = created.toJSON();
  delete safeUser.password_hash;
  return safeUser;
};

const me = async (userId) => {
  const user = await User.findByPk(userId, { attributes: { exclude: ['password_hash'] } });
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = { login, register, me };
