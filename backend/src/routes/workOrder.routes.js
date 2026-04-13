const express = require('express');
const workOrderController = require('../controllers/workOrder.controller');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  workOrderCreateSchema,
  workOrderStatusSchema,
  workOrderItemSchema,
  workOrderIdParamSchema,
  workOrderItemIdParamSchema,
  workOrderListQuerySchema,
  workOrderHistoryQuerySchema,
} = require('../validators/workOrder.validators');

const router = express.Router();

router.use(auth);
router.post('/', validate(workOrderCreateSchema), workOrderController.createWorkOrder);
router.get('/', validate(workOrderListQuerySchema, 'query'), workOrderController.listWorkOrders);
router.get('/:id', validate(workOrderIdParamSchema, 'params'), workOrderController.getWorkOrderById);
router.get('/:id/history', validate(workOrderIdParamSchema, 'params'), validate(workOrderHistoryQuerySchema, 'query'), workOrderController.getWorkOrderHistory);
router.get('/:id/transitions', validate(workOrderIdParamSchema, 'params'), workOrderController.getAllowedStatusTransitions);
router.patch('/:id/status', validate(workOrderIdParamSchema, 'params'), validate(workOrderStatusSchema), workOrderController.changeWorkOrderStatus);
router.post('/:id/items', validate(workOrderIdParamSchema, 'params'), validate(workOrderItemSchema), workOrderController.addWorkOrderItem);
router.delete('/items/:itemId', authorize(['ADMIN']), validate(workOrderItemIdParamSchema, 'params'), workOrderController.deleteWorkOrderItem);

module.exports = router;
