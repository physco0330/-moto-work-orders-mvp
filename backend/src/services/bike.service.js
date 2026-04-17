const { Op } = require('sequelize');
const { Bike, Client } = require('../models');

const createBike = async (payload) => {
  const clientId = typeof payload.clientId === 'string' ? parseInt(payload.clientId) : payload.clientId;
  
  if (!clientId || isNaN(clientId)) {
    const error = new Error('clientId es requerido y debe ser un número');
    error.statusCode = 400;
    throw error;
  }

  const client = await Client.findByPk(clientId);
  if (!client) {
    const error = new Error('Cliente no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const bikeData = { ...payload, clientId };
  const bike = await Bike.create(bikeData);
  return Bike.findByPk(bike.id, { include: [{ model: Client, as: 'client' }] });
};

const searchBikes = async (plate = '') => {
  const where = plate ? { plate: { [Op.like]: `%${plate}%` } } : {};
  return Bike.findAll({ where, include: [{ model: Client, as: 'client' }], order: [['createdAt', 'DESC']] });
};

const getBikeById = async (id) => {
  const bike = await Bike.findByPk(id, { include: [{ model: Client, as: 'client' }] });
  if (!bike) {
    const error = new Error('Moto no encontrada');
    error.statusCode = 404;
    throw error;
  }
  return bike;
};

const deleteBike = async (id) => {
  const { WorkOrder } = require('../models');
  const bike = await Bike.findByPk(id);
  if (!bike) {
    const error = new Error('Moto no encontrada');
    error.statusCode = 404;
    throw error;
  }
  
  const orders = await WorkOrder.count({ where: { motoId: id } });
  if (orders > 0) {
    const error = new Error('No se puede eliminar: la moto tiene órdenes asociadas');
    error.statusCode = 400;
    throw error;
  }
  
  await bike.destroy();
  return true;
};

const updateBike = async (id, data) => {
  const bike = await Bike.findByPk(id);
  if (!bike) {
    const error = new Error('Moto no encontrada');
    error.statusCode = 404;
    throw error;
  }
  await bike.update(data);
  return Bike.findByPk(id, { include: [{ model: Client, as: 'client' }] });
};

module.exports = { createBike, searchBikes, getBikeById, deleteBike, updateBike };
