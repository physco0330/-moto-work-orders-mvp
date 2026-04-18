"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('work_orders', 'service_type', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('work_orders', 'pilot_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('work_orders', 'hours_registered', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('work_orders', 'hours_used', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('work_orders', 'hours_used');
    await queryInterface.removeColumn('work_orders', 'hours_registered');
    await queryInterface.removeColumn('work_orders', 'pilot_name');
    await queryInterface.removeColumn('work_orders', 'service_type');
  },
};