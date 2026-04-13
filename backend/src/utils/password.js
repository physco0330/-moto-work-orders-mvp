const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Centraliza hashing y comparacion de contraseñas.
const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);
const comparePassword = async (plainPassword, hashedPassword) => bcrypt.compare(plainPassword, hashedPassword);

module.exports = { hashPassword, comparePassword };
