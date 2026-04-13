const { User } = require('../models');
const { hashPassword } = require('../utils/password');

const listUsers = async () => User.findAll({ attributes: { exclude: ['password_hash'] }, order: [['createdAt', 'DESC']] });

const createUser = async (payload) => {
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    const error = new Error('El email ya existe');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password_hash: await hashPassword(payload.password),
    role: payload.role || 'MECANICO',
    active: payload.active ?? true,
  });

  const safeUser = user.toJSON();
  delete safeUser.password_hash;
  return safeUser;
};

const updateUser = async (id, payload) => {
  const user = await User.findByPk(id);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (payload.email && payload.email !== user.email) {
    const existing = await User.findOne({ where: { email: payload.email } });
    if (existing) {
      const error = new Error('El email ya existe');
      error.statusCode = 400;
      throw error;
    }
  }

  if (payload.password) user.password_hash = await hashPassword(payload.password);
  if (payload.name !== undefined) user.name = payload.name;
  if (payload.email !== undefined) user.email = payload.email;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.active !== undefined) user.active = payload.active;

  await user.save();
  const safeUser = user.toJSON();
  delete safeUser.password_hash;
  return safeUser;
};

module.exports = { listUsers, createUser, updateUser };
