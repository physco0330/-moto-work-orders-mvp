"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bikes', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      plate: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      brand: { type: Sequelize.STRING(120), allowNull: false },
      model: { type: Sequelize.STRING(120), allowNull: false },
      cylinder: { type: Sequelize.INTEGER, allowNull: true },
      client_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'clients', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('bikes');
  },
};
