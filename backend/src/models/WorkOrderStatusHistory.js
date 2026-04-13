const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Bitacora de cambios de estado para auditoria.
const WorkOrderStatusHistory = sequelize.define(
  'WorkOrderStatusHistory',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    workOrderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'work_order_id' },
    fromStatus: { type: DataTypes.STRING(40), allowNull: true, field: 'from_status' },
    toStatus: { type: DataTypes.STRING(40), allowNull: false, field: 'to_status' },
    note: { type: DataTypes.STRING(255), allowNull: true },
    changedByUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'changed_by_user_id' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at', defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'work_order_status_history',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        name: 'idx_history_order_created',
        fields: ['work_order_id', 'created_at'],
      },
    ],
  }
);

module.exports = WorkOrderStatusHistory;
