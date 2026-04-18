const { Op } = require('sequelize');
const { Client, Bike } = require('../models');

const createClient = (payload) => Client.create(payload);

const searchClients = async (search = '', page = 1, pageSize = 10) => {
  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { rows, count } = await Client.findAndCountAll({
    where,
    include: [{ model: Bike, as: 'bikes' }],
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
  
  client.active = !client.active;
  await client.save();
  return { active: client.active };
};

module.exports = { createClient, searchClients, getClientById, deleteClient };
