const asyncHandler = require('../utils/asyncHandler');
const workOrderService = require('../services/workOrder.service');

const createWorkOrder = asyncHandler(async (req, res) => {
  const body = req.body;
  if (body.motoId) body.motoId = parseInt(body.motoId);
  if (body.items) {
    body.items = body.items.map(item => ({
      ...item,
      count: parseInt(item.count),
      unitValue: parseFloat(item.unitValue)
    }));
  }
  const workOrder = await workOrderService.createWorkOrder(body, req.user);
  res.status(201).json(workOrder);
});

const listWorkOrders = asyncHandler(async (req, res) => {
  const query = req.query;
  if (query.page) query.page = parseInt(query.page);
  if (query.pageSize) query.pageSize = parseInt(query.pageSize);
  const result = await workOrderService.listWorkOrders(query);
  res.status(200).json(result);
});

const getWorkOrderById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const workOrder = await workOrderService.getWorkOrderById(id);
  res.status(200).json(workOrder);
});

const changeWorkOrderStatus = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const workOrder = await workOrderService.changeWorkOrderStatus(id, req.body, req.user);
  res.status(200).json(workOrder);
});

const addWorkOrderItem = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const body = {
    ...req.body,
    count: parseInt(req.body.count),
    unitValue: parseFloat(req.body.unitValue)
  };
  const item = await workOrderService.addWorkOrderItem(id, body);
  res.status(201).json(item);
});

const deleteWorkOrderItem = asyncHandler(async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const result = await workOrderService.deleteWorkOrderItem(itemId, req.user);
  res.status(200).json(result);
});

const getWorkOrderHistory = asyncHandler(async (req, res) => {
  const query = req.query;
  if (query.page) query.page = parseInt(query.page);
  if (query.pageSize) query.pageSize = parseInt(query.pageSize);
  if (query.userId && query.userId !== '') query.userId = parseInt(query.userId);
  const history = await workOrderService.getWorkOrderHistoryPaginated(req.params.id, query);
  res.status(200).json(history);
});

const getAllowedStatusTransitions = asyncHandler(async (req, res) => {
  const result = await workOrderService.getAllowedStatusTransitions(req.params.id, req.user.role);
  res.status(200).json(result);
});

const updateWorkOrder = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  if (body.hoursRegistered) body.hoursRegistered = parseFloat(body.hoursRegistered);
  if (body.hoursUsed) body.hoursUsed = parseFloat(body.hoursUsed);
  const workOrder = await workOrderService.updateWorkOrder(id, body);
  res.status(200).json(workOrder);
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
