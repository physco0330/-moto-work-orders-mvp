const { Op } = require('sequelize');
const { Client, Bike } = require('../models');

const createClient = (payload) => Client.create(payload);

const searchClients = async (search = '') => {
  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  return Client.findAll({
    where,
    include: [{ model: Bike, as: 'bikes' }],
    order: [['createdAt', 'DESC']],
  });
};

const getClientById = async (id) => {
  const client = await Client.findByPk(id, { include: [{ model: Bike, as: 'bikes' }] });
  if (!client) {
    const error = new Error('Cliente no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return client;
};

const deleteClient = async (id) => {
  const client = await Client.findByPk(id, { include: [{ model: Bike, as: 'bikes' }] });
  if (!client) {
    const error = new Error('Piloto no encontrado');
    error.statusCode = 404;
    throw error;
  }
  
  if (client.bikes && client.bikes.length > 0) {
    const error = new Error('No se puede eliminar: el piloto tiene bicicletas asociadas');
    error.statusCode = 400;
    throw error;
  }
  
  await client.destroy();
  return true;
};

module.exports = { createClient, searchClients, getClientById, deleteClient };
