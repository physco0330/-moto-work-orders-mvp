const Joi = require('joi');

const statusValues = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'];

const workOrderCreateSchema = Joi.object({
  motoId: Joi.number().integer().positive().optional(),
  entryDate: Joi.date().optional(),
  faultDescription: Joi.string().min(3).required(),
  client: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    phone: Joi.string().min(5).max(40).required(),
    email: Joi.string().email().optional().allow(null, ''),
  }).optional(),
  bike: Joi.object({
    plate: Joi.string().min(2).max(30).required(),
    brand: Joi.string().min(2).max(120).required(),
    model: Joi.string().min(1).max(120).required(),
    cylinder: Joi.number().integer().min(0).optional().allow(null),
  }).optional(),
  items: Joi.array().items(Joi.object({
    type: Joi.string().valid('MANO_OBRA', 'REPUESTO').required(),
    description: Joi.string().min(1).max(255).required(),
    count: Joi.number().integer().min(1).required(),
    unitValue: Joi.number().min(0).required(),
  })).optional(),
}).custom((value, helpers) => {
  if (!value.motoId && (!value.client || !value.bike)) {
    return helpers.message('"motoId" o "client" + "bike" son requeridos');
  }
  return value;
}, 'Moto or client-bike rule');

const workOrderStatusSchema = Joi.object({
  toStatus: Joi.string().valid(...statusValues).required(),
  note: Joi.string().max(255).optional().allow('', null),
});

const workOrderItemSchema = Joi.object({
  type: Joi.string().valid('MANO_OBRA', 'REPUESTO').required(),
  description: Joi.string().min(1).max(255).required(),
  count: Joi.number().integer().min(1).required(),
  unitValue: Joi.number().min(0).required(),
});

const workOrderIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const workOrderItemIdParamSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
});

const workOrderListQuerySchema = Joi.object({
  status: Joi.string().valid(...statusValues).allow('').optional(),
  plate: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).optional().default(1),
  pageSize: Joi.number().integer().min(1).max(100).optional().default(10),
});

const workOrderHistoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  pageSize: Joi.number().integer().min(1).max(100).optional().default(10),
  userId: Joi.number().integer().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
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
