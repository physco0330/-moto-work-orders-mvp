"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_order_items', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      work_order_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'work_orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.ENUM('MANO_OBRA', 'REPUESTO'), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: false },
      count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      unit_value: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('work_order_items');
  },
};
