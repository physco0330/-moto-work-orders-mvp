"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_order_status_history', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      work_order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'work_orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      from_status: { type: Sequelize.STRING(40), allowNull: true },
      to_status: { type: Sequelize.STRING(40), allowNull: false },
      note: { type: Sequelize.STRING(255), allowNull: true },
      changed_by_user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addIndex('work_order_status_history', ['work_order_id', 'created_at'], {
      name: 'idx_history_order_created',
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('work_order_status_history');
  },
};
