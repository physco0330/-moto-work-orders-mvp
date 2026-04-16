const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Bike = require('./Bike');
const WorkOrder = require('./WorkOrder');
const WorkOrderItem = require('./WorkOrderItem');
const WorkOrderStatusHistory = require('./WorkOrderStatusHistory');
const ChecklistItem = require('./ChecklistItem');

// Configurar Sequelize para PostgreSQL
sequelize.options.define = sequelize.options.define || {};
sequelize.options.define.underscored = true;
sequelize.options.define.underscoredAll = true;
sequelize.options.define.quoteIdentifier = false;

// Relaciones principales del dominio.
Client.hasMany(Bike, { foreignKey: 'clientId', as: 'bikes' });
Bike.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Bike.hasMany(WorkOrder, { foreignKey: 'motoId', as: 'workOrders' });
WorkOrder.belongsTo(Bike, { foreignKey: 'motoId', as: 'bike' });

WorkOrder.hasMany(WorkOrderItem, { foreignKey: 'workOrderId', as: 'items', onDelete: 'CASCADE' });
WorkOrderItem.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });

WorkOrder.hasMany(WorkOrderStatusHistory, { foreignKey: 'workOrderId', as: 'history', onDelete: 'CASCADE' });
WorkOrderStatusHistory.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });

User.hasMany(WorkOrderStatusHistory, { foreignKey: 'changedByUserId', as: 'statusChanges' });
WorkOrderStatusHistory.belongsTo(User, { foreignKey: 'changedByUserId', as: 'changedBy' });

module.exports = {
  sequelize,
  User,
  Client,
  Bike,
  WorkOrder,
  WorkOrderItem,
  WorkOrderStatusHistory,
  ChecklistItem,
};
