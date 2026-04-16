"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(180), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('ADMIN', 'MECANICO'), allowNull: false, defaultValue: 'MECANICO' },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
