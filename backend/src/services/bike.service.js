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

const searchBikes = async (plate = '', clientId = '', page = 1, pageSize = 10) => {
  const where = {};
  if (plate) where.plate = { [Op.like]: `%${plate}%` };
  if (clientId) where.clientId = parseInt(clientId);

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { rows, count } = await Bike.findAndCountAll({
    where,
    include: [{ model: Client, as: 'client' }],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  return {
    data: rows,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: count,
      totalPages: Math.ceil(count / Number(pageSize)),
    },
  };
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
