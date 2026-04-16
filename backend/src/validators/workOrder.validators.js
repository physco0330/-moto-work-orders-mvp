const Joi = require('joi');

const statusValues = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'];

const workOrderCreateSchema = Joi.object({
  motoId: Joi.any(),
  entryDate: Joi.any(),
  faultDescription: Joi.any(),
  client: Joi.any(),
  bike: Joi.any(),
  items: Joi.any(),
});

const workOrderStatusSchema = Joi.object({
  toStatus: Joi.any(),
  note: Joi.any(),
});

const workOrderItemSchema = Joi.object({
  type: Joi.any(),
  description: Joi.any(),
  count: Joi.any(),
  unitValue: Joi.any(),
});

const workOrderIdParamSchema = Joi.object({
  id: Joi.any(),
});

const workOrderItemIdParamSchema = Joi.object({
  itemId: Joi.any(),
});

const workOrderListQuerySchema = Joi.object({
  status: Joi.any(),
  plate: Joi.any(),
  page: Joi.any(),
  pageSize: Joi.any(),
});

const workOrderHistoryQuerySchema = Joi.object({
  page: Joi.any(),
  pageSize: Joi.any(),
  userId: Joi.any(),
  startDate: Joi.any(),
  endDate: Joi.any(),
});

module.exports = {
  workOrderCreateSchema,
  workOrderStatusSchema,
  workOrderItemSchema,
  workOrderIdParamSchema,
  workOrderItemIdParamSchema,
  workOrderListQuerySchema,
  workOrderHistoryQuerySchema,
};
