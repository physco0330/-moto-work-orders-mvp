const asyncHandler = require('../utils/asyncHandler');
const clientService = require('../services/client.service');

const createClient = asyncHandler(async (req, res) => {
  const client = await clientService.createClient(req.body);
  res.status(201).json(client);
});

const searchClients = asyncHandler(async (req, res) => {
  const clients = await clientService.searchClients(req.query.search || '');
  res.status(200).json(clients);
});

const getClientById = asyncHandler(async (req, res) => {
  const client = await clientService.getClientById(req.params.id);
  res.status(200).json(client);
});

const updateClient = asyncHandler(async (req, res) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  res.status(200).json(client);
});

module.exports = { createClient, searchClients, getClientById, updateClient };
