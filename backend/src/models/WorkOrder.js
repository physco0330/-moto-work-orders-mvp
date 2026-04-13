const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Orden principal que agrupa estado, items e historial.
const WorkOrder = sequelize.define(
  'WorkOrder',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    motoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'moto_id' },
    entryDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'entry_date', defaultValue: DataTypes.NOW },
    faultDescription: { type: DataTypes.TEXT, allowNull: false, field: 'fault_description' },
    status: {
      type: DataTypes.ENUM('RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'RECIBIDA',
    },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  },
  {
    tableName: 'work_orders',
    underscored: true,
    timestamps: true,
  }
);

module.exports = WorkOrder;
