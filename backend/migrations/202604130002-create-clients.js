"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(120), allowNull: false },
      phone: { type: Sequelize.STRING(40), allowNull: false },
      email: { type: Sequelize.STRING(180), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('clients');
  },
};
