const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bike = sequelize.define(
  'Bike',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    plate: { type: DataTypes.STRING(30), allowNull: true, defaultValue: '' },
    brand: { type: DataTypes.STRING(120), allowNull: true },
    model: { type: DataTypes.STRING(120), allowNull: false },
    cylinder: { type: DataTypes.INTEGER, allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: true },
    hours: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    clientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'client_id' },
  },
  {
    tableName: 'bikes',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Bike;
