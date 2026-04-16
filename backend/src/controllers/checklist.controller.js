const checklistService = require('../services/checklist.service');
const asyncHandler = require('../utils/asyncHandler');

const getChecklistByWorkOrder = asyncHandler(async (req, res) => {
  const checklist = await checklistService.getChecklistByWorkOrder(req.params.id);
  res.json(checklist);
});

const setChecklistItem = asyncHandler(async (req, res) => {
  const { checklistItemId, checked } = req.body;
  const result = await checklistService.setChecklistItem(req.params.id, checklistItemId, checked);
  res.json(result);
});

module.exports = {
  getChecklistByWorkOrder,
  setChecklistItem,
};