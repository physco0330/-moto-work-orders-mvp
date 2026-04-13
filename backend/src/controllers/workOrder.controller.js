const asyncHandler = require('../utils/asyncHandler');
const workOrderService = require('../services/workOrder.service');

const createWorkOrder = asyncHandler(async (req, res) => {
  const workOrder = await workOrderService.createWorkOrder(req.body, req.user);
  res.status(201).json(workOrder);
});

const listWorkOrders = asyncHandler(async (req, res) => {
  const result = await workOrderService.listWorkOrders(req.query);
  res.status(200).json(result);
});

const getWorkOrderById = asyncHandler(async (req, res) => {
  const workOrder = await workOrderService.getWorkOrderById(req.params.id);
  res.status(200).json(workOrder);
});

const changeWorkOrderStatus = asyncHandler(async (req, res) => {
  const workOrder = await workOrderService.changeWorkOrderStatus(req.params.id, req.body, req.user);
  res.status(200).json(workOrder);
});

const addWorkOrderItem = asyncHandler(async (req, res) => {
  const item = await workOrderService.addWorkOrderItem(req.params.id, req.body);
  res.status(201).json(item);
});

const deleteWorkOrderItem = asyncHandler(async (req, res) => {
  const result = await workOrderService.deleteWorkOrderItem(req.params.itemId, req.user);
  res.status(200).json(result);
});

const getWorkOrderHistory = asyncHandler(async (req, res) => {
  const history = await workOrderService.getWorkOrderHistoryPaginated(req.params.id, req.query);
  res.status(200).json(history);
});

const getAllowedStatusTransitions = asyncHandler(async (req, res) => {
  const result = await workOrderService.getAllowedStatusTransitions(req.params.id, req.user.role);
  res.status(200).json(result);
});

module.exports = {
  createWorkOrder,
  listWorkOrders,
  getWorkOrderById,
  changeWorkOrderStatus,
  addWorkOrderItem,
  deleteWorkOrderItem,
  getWorkOrderHistory,
  getAllowedStatusTransitions,
};
