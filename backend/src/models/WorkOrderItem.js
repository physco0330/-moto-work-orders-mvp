const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Item de mano de obra o repuesto dentro de una orden.
const WorkOrderItem = sequelize.define(
  'WorkOrderItem',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    workOrderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'work_order_id' },
    type: { type: DataTypes.ENUM('MANO_OBRA', 'REPUESTO'), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: false },
    count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 1 } },
    unitValue: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  },
  {
    tableName: 'work_order_items',
    underscored: true,
    timestamps: true,
  }
);

module.exports = WorkOrderItem;
