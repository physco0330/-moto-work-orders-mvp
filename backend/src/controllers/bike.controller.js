const asyncHandler = require('../utils/asyncHandler');
const bikeService = require('../services/bike.service');

const createBike = asyncHandler(async (req, res) => {
  const bike = await bikeService.createBike(req.body);
  res.status(201).json(bike);
});

const searchBikes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const result = await bikeService.searchBikes(req.query.plate || '', req.query.clientId, page, pageSize);
  res.status(200).json(result);
});

const getBikeById = asyncHandler(async (req, res) => {
  const bike = await bikeService.getBikeById(req.params.id);
  res.status(200).json(bike);
});

const deleteBike = asyncHandler(async (req, res) => {
  await bikeService.deleteBike(req.params.id);
  res.status(200).json({ message: 'Motocicleta eliminada' });
});

const updateBike = asyncHandler(async (req, res) => {
  const bike = await bikeService.updateBike(req.params.id, req.body);
  res.status(200).json(bike);
});

module.exports = { createBike, searchBikes, getBikeById, deleteBike, updateBike };
