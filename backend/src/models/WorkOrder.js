const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    serviceType: { type: DataTypes.STRING(100), allowNull: true, field: 'service_type' },
    pilotName: { type: DataTypes.STRING(100), allowNull: true, field: 'pilot_name' },
    hoursRegistered: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'hours_registered' },
    hoursUsed: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: 'hours_used' },
  },
  {
    tableName: 'work_orders',
    underscored: true,
    timestamps: true,
  }
);

module.exports = WorkOrder;
