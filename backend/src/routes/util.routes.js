const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { sequelize, Bike, Client, WorkOrder, WorkOrderItem, WorkOrderStatusHistory, ChecklistItem, User } = require('../models');

const router = express.Router();

const resetDatabase = asyncHandler(async (req, res) => {
  await sequelize.transaction(async (t) => {
    await WorkOrderStatusHistory.destroy({ where: {}, transaction: t });
    await WorkOrderItem.destroy({ where: {}, transaction: t });
    await WorkOrder.destroy({ where: {}, transaction: t });
    await Bike.destroy({ where: {}, transaction: t });
    await Client.destroy({ where: {}, transaction: t });
  });
  
  res.status(200).json({ message: 'Base de datos reseteada correctamente' });
});

const seedDatabase = asyncHandler(async (req, res) => {
  await sequelize.transaction(async (t) => {
    const clients = await Client.bulkCreate([
      { name: 'Juan Pérez', phone: '3001234567', email: 'juan@email.com', active: true },
      { name: 'María García', phone: '3002345678', email: 'maria@email.com', active: true },
      { name: 'Carlos López', phone: '3003456789', email: 'carlos@email.com', active: true },
    ], { transaction: t });
    
    const bikes = await Bike.bulkCreate([
      { brand: 'Honda', plate: 'ABC123', model: 'CRF 450R', year: 2023, hours: 50, clientId: clients[0].id },
      { brand: 'Yamaha', plate: 'DEF456', model: 'YZ 250F', year: 2022, hours: 120, clientId: clients[0].id },
      { brand: 'KTM', plate: 'GHI789', model: 'SX 250', year: 2024, hours: 30, clientId: clients[1].id },
      { brand: 'Suzuki', plate: 'JKL012', model: 'RM 125', year: 2021, hours: 200, clientId: clients[2].id },
      { brand: 'Kawasaki', plate: 'MNO345', model: 'KX 250', year: 2023, hours: 75, clientId: clients[1].id },
    ], { transaction: t });
    
    const statuses = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'];
    const serviceTypes = ['ALISTAMIENTO', 'REPARACION', 'MANTENIMIENTO'];
    
    const orders = await WorkOrder.bulkCreate([
      { 
        motoId: bikes[0].id, 
        entryDate: new Date(),
        faultDescription: 'Revision general',
        status: 'RECIBIDA',
        serviceType: 'ALISTAMIENTO',
        pilotName: clients[0].name,
        hoursRegistered: 0,
        hoursUsed: 0,
        total: 0
      },
      { 
        motoId: bikes[1].id, 
        entryDate: new Date(Date.now() - 86400000),
        faultDescription: 'Cambio de aceite y filtros',
        status: 'EN_PROCESO',
        serviceType: 'MANTENIMIENTO',
        pilotName: clients[0].name,
        hoursRegistered: 20,
        hoursUsed: 10,
        total: 150000
      },
      { 
        motoId: bikes[2].id, 
        entryDate: new Date(Date.now() - 172800000),
        faultDescription: 'Reparacion de motor',
        status: 'LISTA',
        serviceType: 'REPARACION',
        pilotName: clients[1].name,
        hoursRegistered: 40,
        hoursUsed: 35,
        total: 450000
      },
      { 
        motoId: bikes[3].id, 
        entryDate: new Date(Date.now() - 259200000),
        faultDescription: 'Servicio completo',
        status: 'ENTREGADA',
        serviceType: 'ALISTAMIENTO',
        pilotName: clients[2].name,
        hoursRegistered: 15,
        hoursUsed: 15,
        total: 200000
      },
      { 
        motoId: bikes[4].id, 
        entryDate: new Date(Date.now() - 345600000),
        faultDescription: 'Cambio de repuestos',
        status: 'CANCELADA',
        serviceType: 'REPARACION',
        pilotName: clients[1].name,
        hoursRegistered: 10,
        hoursUsed: 0,
        total: 0
      },
    ], { transaction: t });
  });
  
  res.status(200).json({ message: 'Datos de prueba generados correctamente' });
});

router.post('/reset', resetDatabase);
router.post('/seed', seedDatabase);

module.exports = router;