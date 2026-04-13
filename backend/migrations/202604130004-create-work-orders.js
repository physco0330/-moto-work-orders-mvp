"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_orders', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      moto_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'bikes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      entry_date: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW },
      fault_description: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.ENUM('RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'), allowNull: false, defaultValue: 'RECIBIDA' },
      total: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('work_orders');
  },
};
