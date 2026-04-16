const checklistItemService = require('../services/checklistItem.service');
const asyncHandler = require('../utils/asyncHandler');

const getAllItems = asyncHandler(async (req, res) => {
  const items = await checklistItemService.getAll();
  res.json({ success: true, data: items });
});

const createItem = asyncHandler(async (req, res) => {
  const item = await checklistItemService.create(req.body);
  res.status(201).json({ success: true, data: item });
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await checklistItemService.update(req.params.id, req.body);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item no encontrado' });
  }
  res.json({ success: true, data: item });
});

const deleteItem = asyncHandler(async (req, res) => {
  const deleted = await checklistItemService.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Item no encontrado' });
  }
  res.json({ success: true, message: 'Item eliminado' });
});

module.exports = {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
};