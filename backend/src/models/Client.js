const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Cliente dueño de una o varias motos.
const Client = sequelize.define(
  'Client',
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    phone: { type: DataTypes.STRING(40), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: true, validate: { isEmail: true } },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'clients',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Client;
