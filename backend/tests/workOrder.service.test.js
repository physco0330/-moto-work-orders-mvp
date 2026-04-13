jest.mock('../src/config/database', () => ({
  transaction: jest.fn(async (callback) => callback({ transaction: true })),
  literal: jest.requireActual('sequelize').literal,
  col: jest.requireActual('sequelize').col,
}));

jest.mock('../src/models', () => ({
  Bike: { findByPk: jest.fn() },
  Client: { findByPk: jest.fn() },
  WorkOrder: { findByPk: jest.fn(), create: jest.fn() },
  WorkOrderItem: { findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn() },
  WorkOrderStatusHistory: { create: jest.fn(), findAll: jest.fn(), findAndCountAll: jest.fn() },
  User: { findByPk: jest.fn() },
}));

const { WorkOrder, WorkOrderStatusHistory } = require('../src/models');
const workOrderService = require('../src/services/workOrder.service');

describe('workOrder.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('bloquea cambios de ENTREGADA para mecanico', async () => {
    WorkOrder.findByPk.mockResolvedValue({ id: 1, status: 'LISTA', save: jest.fn() });

    await expect(
      workOrderService.changeWorkOrderStatus(1, { toStatus: 'ENTREGADA' }, { id: 2, role: 'MECANICO' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('acepta cambio valido y registra historial', async () => {
    const workOrder = { id: 1, status: 'LISTA', save: jest.fn() };
    WorkOrder.findByPk
      .mockResolvedValueOnce(workOrder)
      .mockResolvedValueOnce({ id: 1, status: 'ENTREGADA' });

    WorkOrderStatusHistory.create.mockResolvedValue({});

    const result = await workOrderService.changeWorkOrderStatus(1, { toStatus: 'ENTREGADA', note: 'Listo' }, { id: 1, role: 'ADMIN' });

    expect(workOrder.save).toHaveBeenCalled();
    expect(WorkOrderStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({ toStatus: 'ENTREGADA', note: 'Listo', changedByUserId: 1 }), expect.any(Object));
    expect(result.status).toBe('ENTREGADA');
  });
});
