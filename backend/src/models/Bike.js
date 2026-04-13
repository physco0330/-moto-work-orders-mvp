const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Moto registrada en el taller.
const Bike = sequelize.define(
  'Bike',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    plate: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    brand: { type: DataTypes.STRING(120), allowNull: false },
    model: { type: DataTypes.STRING(120), allowNull: false },
    cylinder: { type: DataTypes.INTEGER, allowNull: true },
    clientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'client_id' },
  },
  {
    tableName: 'bikes',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Bike;
