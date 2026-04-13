jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../src/utils/password', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

jest.mock('../src/utils/jwt', () => ({
  signToken: jest.fn(),
}));

const { User } = require('../src/models');
const { comparePassword, hashPassword } = require('../src/utils/password');
const { signToken } = require('../src/utils/jwt');
const authService = require('../src/services/auth.service');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login devuelve token y usuario seguro', async () => {
    const user = {
      id: 1,
      email: 'admin@taller.com',
      password_hash: 'hashed',
      active: true,
      role: 'ADMIN',
      toJSON: () => ({ id: 1, name: 'Admin', email: 'admin@taller.com', password_hash: 'hashed', role: 'ADMIN', active: true }),
    };

    User.findOne.mockResolvedValue(user);
    comparePassword.mockResolvedValue(true);
    signToken.mockReturnValue('token-123');

    const result = await authService.login({ email: 'admin@taller.com', password: 'Secret123!' });

    expect(result.token).toBe('token-123');
    expect(result.user.password_hash).toBeUndefined();
    expect(signToken).toHaveBeenCalledWith({ id: 1, role: 'ADMIN' });
  });

  test('register hashea contraseña y evita duplicados', async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue('hashed-password');
    User.create.mockResolvedValue({
      toJSON: () => ({ id: 2, name: 'Nuevo', email: 'nuevo@taller.com', password_hash: 'hashed-password', role: 'MECANICO' }),
    });

    const result = await authService.register({ name: 'Nuevo', email: 'nuevo@taller.com', password: 'Password123!' });

    expect(hashPassword).toHaveBeenCalledWith('Password123!');
    expect(result.password_hash).toBeUndefined();
  });
});
