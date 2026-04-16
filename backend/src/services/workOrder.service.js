const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Bike, Client, WorkOrder, WorkOrderItem, WorkOrderStatusHistory, User } = require('../models');
const calculateTotal = require('../utils/calculateTotal');
const { STATUS, isValidTransition, getAllowedTransitionsByRole, MECANICO_ALLOWED_STATUSES } = require('../utils/statusFlow');

const buildWorkOrderInclude = () => [
  {
    model: Bike,
    as: 'bike',
    include: [{ model: Client, as: 'client' }],
  },
  { model: WorkOrderItem, as: 'items' },
];

const createWorkOrder = async (payload, user) => {
  return sequelize.transaction(async (transaction) => {
    let bike = null;

    if (payload.motoId) {
      bike = await Bike.findByPk(payload.motoId, { transaction });
      if (!bike) {
        const error = new Error('La moto no existe');
        error.statusCode = 404;
        throw error;
      }
    } else {
      const clientData = payload.client;
      const bikeData = payload.bike;

      if (!clientData || !bikeData) {
        const error = new Error('Debes enviar motoId o los datos de client y bike');
        error.statusCode = 400;
        throw error;
      }

      const [client] = await Client.findOrCreate({
        where: { phone: clientData.phone },
        defaults: clientData,
        transaction,
      });

      const [foundBike] = await Bike.findOrCreate({
        where: { plate: bikeData.plate },
        defaults: { ...bikeData, clientId: client.id },
        transaction,
      });

      bike = foundBike;
    }

    const workOrder = await WorkOrder.create(
      {
        motoId: bike.id,
        entryDate: payload.entryDate || new Date(),
        faultDescription: payload.faultDescription,
        status: STATUS.RECIBIDA,
        total: 0,
        serviceType: payload.serviceType || null,
        pilotName: payload.pilotName || null,
        hoursRegistered: payload.hoursRegistered || 0,
        hoursUsed: payload.hoursUsed || 0,
      },
      { transaction }
    );

    const items = Array.isArray(payload.items) ? payload.items : [];
    if (items.length) {
      await Promise.all(
        items.map((item) =>
          WorkOrderItem.create(
            {
              workOrderId: workOrder.id,
              type: item.type,
              description: item.description,
              count: item.count,
              unitValue: item.unitValue,
            },
            { transaction }
          )
        )
      );
    }

    const createdItems = await WorkOrderItem.findAll({ where: { workOrderId: workOrder.id }, transaction });
    workOrder.total = calculateTotal(createdItems);
    await workOrder.save({ transaction });

    await WorkOrderStatusHistory.create(
      {
        workOrderId: workOrder.id,
        fromStatus: null,
        toStatus: STATUS.RECIBIDA,
        note: 'Orden creada',
        changedByUserId: user.id,
      },
      { transaction }
    );

    return WorkOrder.findByPk(workOrder.id, { include: buildWorkOrderInclude(), transaction });
  });
};

const listWorkOrders = async ({ status, plate, page = 1, pageSize = 10 }) => {
  const where = {};
  if (status) where.status = status;

  const bikeInclude = {
    model: Bike,
    as: 'bike',
    include: [{ model: Client, as: 'client' }],
  };

  if (plate) {
    bikeInclude.where = { plate: { [Op.like]: `%${plate}%` } };
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { rows, count } = await WorkOrder.findAndCountAll({
    where,
    include: [
      bikeInclude,
      { model: WorkOrderItem, as: 'items' },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

// Contadores reales desde la base de datos
  const totalCount = await WorkOrder.count();
  const recCount = await WorkOrder.count({ where: { status: 'RECIBIDA' } });
  const procCount = await WorkOrder.count({ where: { status: { [Op.in]: ['DIAGNOSTICO', 'EN_PROCESO'] } } });
  const lisCount = await WorkOrder.count({ where: { status: { [Op.in]: ['LISTA', 'ENTREGADA'] } } });

  return {
    data: rows,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: totalCount,
      totalPages: Math.ceil(totalCount / Number(pageSize)),
    },
stats: {
      total: totalCount,
      recibidas: recCount,
      enProceso: procCount,
      listas: lisCount,
    },
  };
};

const getWorkOrderById = async (id) => {
  const workOrder = await WorkOrder.findByPk(id, {
    include: [
      { model: Bike, as: 'bike', include: [{ model: Client, as: 'client' }] },
      { model: WorkOrderItem, as: 'items' },
    ],
  });

  if (!workOrder) {
    const error = new Error('Orden no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return workOrder;
};

const changeWorkOrderStatus = async (id, { toStatus, note }, user) => {
  return sequelize.transaction(async (transaction) => {
    const workOrder = await WorkOrder.findByPk(id, { transaction });
    if (!workOrder) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (workOrder.status === 'ENTREGADA' || workOrder.status === 'CANCELADA') {
      const error = new Error('No se permiten cambios en una orden cerrada');
      error.statusCode = 400;
      throw error;
    }

    if (!Object.values(STATUS).includes(toStatus)) {
      const error = new Error('Estado destino invalido');
      error.statusCode = 400;
      throw error;
    }

    if (workOrder.status === toStatus) {
      const error = new Error('La orden ya se encuentra en ese estado');
      error.statusCode = 400;
      throw error;
    }

    if (!isValidTransition(workOrder.status, toStatus)) {
      const error = new Error('Transicion de estado no permitida');
      error.statusCode = 400;
      throw error;
    }

    if (user.role === 'MECANICO' && !MECANICO_ALLOWED_STATUSES.includes(toStatus)) {
      const error = new Error('Tu rol no permite realizar esta transicion');
      error.statusCode = 403;
      throw error;
    }

    const previousStatus = workOrder.status;
    workOrder.status = toStatus;
    await workOrder.save({ transaction });

    await WorkOrderStatusHistory.create(
      {
        workOrderId: workOrder.id,
        fromStatus: previousStatus,
        toStatus,
        note: note || null,
        changedByUserId: user.id,
      },
      { transaction }
    );

    return WorkOrder.findByPk(workOrder.id, { include: buildWorkOrderInclude(), transaction });
  });
};

const addWorkOrderItem = async (workOrderId, payload) => {
  return sequelize.transaction(async (transaction) => {
    const workOrder = await WorkOrder.findByPk(workOrderId, { transaction });
    if (!workOrder) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (workOrder.status === 'ENTREGADA' || workOrder.status === 'CANCELADA') {
      const error = new Error('No se pueden modificar items en una orden cerrada');
      error.statusCode = 400;
      throw error;
    }

    const item = await WorkOrderItem.create(
      {
        workOrderId,
        type: payload.type,
        description: payload.description,
        count: payload.count,
        unitValue: payload.unitValue,
      },
      { transaction }
    );

    const items = await WorkOrderItem.findAll({ where: { workOrderId }, transaction });
    workOrder.total = calculateTotal(items);
    await workOrder.save({ transaction });

    return item;
  });
};

const deleteWorkOrderItem = async (itemId, user) => {
  return sequelize.transaction(async (transaction) => {
    if (user?.role !== 'ADMIN') {
      const error = new Error('No tienes permisos para eliminar items');
      error.statusCode = 403;
      throw error;
    }

    const item = await WorkOrderItem.findByPk(itemId, { transaction });
    if (!item) {
      const error = new Error('Item no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const workOrder = await WorkOrder.findByPk(item.workOrderId, { transaction });
    if (!workOrder) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (workOrder.status === 'ENTREGADA' || workOrder.status === 'CANCELADA') {
      const error = new Error('No se pueden modificar items en una orden cerrada');
      error.statusCode = 400;
      throw error;
    }

    const workOrderId = item.workOrderId;
    await item.destroy({ transaction });
    const remaining = await WorkOrderItem.findAll({ where: { workOrderId }, transaction });
    workOrder.total = calculateTotal(remaining);
    await workOrder.save({ transaction });

    return { deleted: true };
  });
};

const getWorkOrderHistory = async (id) => {
  const workOrder = await WorkOrder.findByPk(id);
  if (!workOrder) {
    const error = new Error('Orden no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return WorkOrderStatusHistory.findAll({
    where: { workOrderId: id },
    include: [{ model: User, as: 'changedBy', attributes: ['id', 'name', 'email', 'role'] }],
    order: [['createdAt', 'DESC']],
  });
};

const getWorkOrderHistoryPaginated = async (id, { page = 1, pageSize = 10, userId, startDate, endDate }) => {
  const workOrder = await WorkOrder.findByPk(id);
  if (!workOrder) {
    const error = new Error('Orden no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const limit = Number(pageSize);
  const currentPage = Number(page);
  const offset = (currentPage - 1) * limit;
  const where = { workOrderId: id };

  if (userId) {
    where.changedByUserId = userId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const { rows, count } = await WorkOrderStatusHistory.findAndCountAll({
    where,
    include: [{ model: User, as: 'changedBy', attributes: ['id', 'name', 'email', 'role'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    meta: {
      total: count,
      page: currentPage,
      pageSize: limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getAllowedStatusTransitions = async (id, role) => {
  const workOrder = await WorkOrder.findByPk(id);
  if (!workOrder) {
    const error = new Error('Orden no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return {
    currentStatus: workOrder.status,
    allowed: getAllowedTransitionsByRole(workOrder.status, role),
  };
};

const updateWorkOrder = async (id, payload) => {
  const workOrder = await WorkOrder.findByPk(id);
  if (!workOrder) {
    const error = new Error('Orden no encontrada');
    error.statusCode = 404;
    throw error;
  }

  if (payload.serviceType !== undefined) workOrder.serviceType = payload.serviceType;
  if (payload.pilotName !== undefined) workOrder.pilotName = payload.pilotName;
  if (payload.hoursRegistered !== undefined) workOrder.hoursRegistered = payload.hoursRegistered;
  if (payload.hoursUsed !== undefined) workOrder.hoursUsed = payload.hoursUsed;
  if (payload.faultDescription !== undefined) workOrder.faultDescription = payload.faultDescription;

  await workOrder.save();

  return WorkOrder.findByPk(id, { include: buildWorkOrderInclude() });
};

module.exports = {
  createWorkOrder,
  listWorkOrders,
  getWorkOrderById,
  changeWorkOrderStatus,
  addWorkOrderItem,
  deleteWorkOrderItem,
  getWorkOrderHistory,
  getWorkOrderHistoryPaginated,
  getAllowedStatusTransitions,
  updateWorkOrder,
};
