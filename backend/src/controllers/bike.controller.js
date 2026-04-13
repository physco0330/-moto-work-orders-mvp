const asyncHandler = require('../utils/asyncHandler');
const bikeService = require('../services/bike.service');

const createBike = asyncHandler(async (req, res) => {
  const bike = await bikeService.createBike(req.body);
  res.status(201).json(bike);
});

const searchBikes = asyncHandler(async (req, res) => {
  const bikes = await bikeService.searchBikes(req.query.plate || '');
  res.status(200).json(bikes);
});

const getBikeById = asyncHandler(async (req, res) => {
  const bike = await bikeService.getBikeById(req.params.id);
  res.status(200).json(bike);
});

module.exports = { createBike, searchBikes, getBikeById };
