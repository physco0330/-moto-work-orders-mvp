"use strict";

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin12345!', 10);
    const email = process.env.ADMIN_EMAIL || 'admin@taller.com';
    const name = process.env.ADMIN_NAME || 'Administrador';

    const [rows] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email } }
    );

    if (rows.length > 0) {
      await queryInterface.bulkUpdate(
        'users',
        {
          name,
          password_hash,
          role: 'ADMIN',
          active: true,
          updated_at: new Date(),
        },
        { email }
      );
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        name,
        email,
        password_hash,
        role: 'ADMIN',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: process.env.ADMIN_EMAIL || 'admin@taller.com' });
  },
};
