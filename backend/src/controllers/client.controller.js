const asyncHandler = require('../utils/asyncHandler');
const clientService = require('../services/client.service');

const createClient = asyncHandler(async (req, res) => {
  const client = await clientService.createClient(req.body);
  res.status(201).json(client);
});

const searchClients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const result = await clientService.searchClients(req.query.search || '', page, pageSize);
  res.status(200).json(result);
});

const getClientById = asyncHandler(async (req, res) => {
  const client = await clientService.getClientById(req.params.id);
  res.status(200).json(client);
});

const deleteClient = asyncHandler(async (req, res) => {
  await clientService.deleteClient(req.params.id);
  res.status(200).json({ message: 'Piloto eliminado' });
});

module.exports = { createClient, searchClients, getClientById, deleteClient };
