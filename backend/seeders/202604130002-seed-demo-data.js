"use strict";

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const mechanicEmail = 'mecanico@taller.com';
    const mechanicPasswordHash = await bcrypt.hash('Mecanico123!', 10);

    const [mechanicRows] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email: mechanicEmail } }
    );

    if (mechanicRows.length === 0) {
      await queryInterface.bulkInsert('users', [
        {
          name: 'Mecanico Demo',
          email: mechanicEmail,
          password_hash: mechanicPasswordHash,
          role: 'MECANICO',
          active: true,
          created_at: now,
          updated_at: now,
        },
      ]);
    }

    const selectOne = async (sql, replacements) => {
      const [rows] = await queryInterface.sequelize.query(sql, { replacements });
      return rows[0] || null;
    };

    const existingClient1 = await selectOne('SELECT id FROM clients WHERE phone = :phone LIMIT 1', { phone: '3001111111' });
    if (!existingClient1) {
      await queryInterface.bulkInsert('clients', [
        { name: 'Carlos Ramirez', phone: '3001111111', email: 'carlos@example.com', created_at: now, updated_at: now },
      ]);
    }

    const existingClient2 = await selectOne('SELECT id FROM clients WHERE phone = :phone LIMIT 1', { phone: '3002222222' });
    if (!existingClient2) {
      await queryInterface.bulkInsert('clients', [
        { name: 'Andrea Gomez', phone: '3002222222', email: 'andrea@example.com', created_at: now, updated_at: now },
      ]);
    }

    const client1 = await selectOne('SELECT id FROM clients WHERE phone = :phone LIMIT 1', { phone: '3001111111' });
    const client2 = await selectOne('SELECT id FROM clients WHERE phone = :phone LIMIT 1', { phone: '3002222222' });

    const existingBike1 = await selectOne('SELECT id FROM bikes WHERE plate = :plate LIMIT 1', { plate: 'ABC123' });
    if (!existingBike1) {
      await queryInterface.bulkInsert('bikes', [
        { plate: 'ABC123', brand: 'Yamaha', model: 'XTZ 250', cylinder: 250, client_id: client1.id, created_at: now, updated_at: now },
      ]);
    }

    const existingBike2 = await selectOne('SELECT id FROM bikes WHERE plate = :plate LIMIT 1', { plate: 'XYZ789' });
    if (!existingBike2) {
      await queryInterface.bulkInsert('bikes', [
        { plate: 'XYZ789', brand: 'Suzuki', model: 'GN 125', cylinder: 125, client_id: client2.id, created_at: now, updated_at: now },
      ]);
    }

    const bike1 = await selectOne('SELECT id FROM bikes WHERE plate = :plate LIMIT 1', { plate: 'ABC123' });
    const bike2 = await selectOne('SELECT id FROM bikes WHERE plate = :plate LIMIT 1', { plate: 'XYZ789' });

    const existingOrder1 = await selectOne('SELECT id FROM work_orders WHERE moto_id = :motoId LIMIT 1', { motoId: bike1.id });
    let order1Id = existingOrder1?.id;
    if (!existingOrder1) {
      await queryInterface.bulkInsert('work_orders', [
        { moto_id: bike1.id, entry_date: '2026-04-10', fault_description: 'No enciende y presenta fuga de aceite', status: 'EN_PROCESO', total: 0, created_at: now, updated_at: now },
      ]);
      const created = await selectOne('SELECT id FROM work_orders WHERE moto_id = :motoId LIMIT 1', { motoId: bike1.id });
      order1Id = created.id;
    }

    const existingOrder2 = await selectOne('SELECT id FROM work_orders WHERE moto_id = :motoId LIMIT 1', { motoId: bike2.id });
    let order2Id = existingOrder2?.id;
    if (!existingOrder2) {
      await queryInterface.bulkInsert('work_orders', [
        { moto_id: bike2.id, entry_date: '2026-04-11', fault_description: 'Cambio de frenos y sincronización', status: 'RECIBIDA', total: 0, created_at: now, updated_at: now },
      ]);
      const created = await selectOne('SELECT id FROM work_orders WHERE moto_id = :motoId LIMIT 1', { motoId: bike2.id });
      order2Id = created.id;
    }

    const itemsOrder1 = await queryInterface.sequelize.query(
      'SELECT id FROM work_order_items WHERE work_order_id = :workOrderId LIMIT 1',
      { replacements: { workOrderId: order1Id } }
    );
    if (itemsOrder1[0].length === 0) {
      await queryInterface.bulkInsert('work_order_items', [
        { work_order_id: order1Id, type: 'REPUESTO', description: 'Aceite 10W40', count: 2, unit_value: 28000, created_at: now, updated_at: now },
        { work_order_id: order1Id, type: 'MANO_OBRA', description: 'Diagnostico electrico', count: 1, unit_value: 50000, created_at: now, updated_at: now },
      ]);
    }

    const itemsOrder2 = await queryInterface.sequelize.query(
      'SELECT id FROM work_order_items WHERE work_order_id = :workOrderId LIMIT 1',
      { replacements: { workOrderId: order2Id } }
    );
    if (itemsOrder2[0].length === 0) {
      await queryInterface.bulkInsert('work_order_items', [
        { work_order_id: order2Id, type: 'MANO_OBRA', description: 'Revision general', count: 1, unit_value: 35000, created_at: now, updated_at: now },
      ]);
    }

    const history1 = await queryInterface.sequelize.query(
      'SELECT id FROM work_order_status_history WHERE work_order_id = :workOrderId LIMIT 1',
      { replacements: { workOrderId: order1Id } }
    );
    if (history1[0].length === 0) {
      await queryInterface.bulkInsert('work_order_status_history', [
        { work_order_id: order1Id, from_status: null, to_status: 'RECIBIDA', note: 'Ingreso de ejemplo', changed_by_user_id: 1, created_at: new Date('2026-04-10T08:00:00Z') },
        { work_order_id: order1Id, from_status: 'RECIBIDA', to_status: 'DIAGNOSTICO', note: 'Asignada a diagnostico', changed_by_user_id: 2, created_at: new Date('2026-04-10T10:00:00Z') },
        { work_order_id: order1Id, from_status: 'DIAGNOSTICO', to_status: 'EN_PROCESO', note: 'Repuesto aprobado', changed_by_user_id: 2, created_at: new Date('2026-04-10T12:00:00Z') },
      ]);
    }

    const history2 = await queryInterface.sequelize.query(
      'SELECT id FROM work_order_status_history WHERE work_order_id = :workOrderId LIMIT 1',
      { replacements: { workOrderId: order2Id } }
    );
    if (history2[0].length === 0) {
      await queryInterface.bulkInsert('work_order_status_history', [
        { work_order_id: order2Id, from_status: null, to_status: 'RECIBIDA', note: 'Orden demo', changed_by_user_id: 1, created_at: new Date('2026-04-11T08:00:00Z') },
      ]);
    }

    // Recalcula totales de las ordenes de demo.
    await queryInterface.sequelize.query(
      `UPDATE work_orders wo
       SET total = (
         SELECT COALESCE(SUM(CAST(count AS DECIMAL(10,2)) * CAST(unit_value AS DECIMAL(10,2))), 0)
         FROM work_order_items
         WHERE work_order_id = wo.id
       )`
    );
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('work_order_status_history', null, {});
    await queryInterface.bulkDelete('work_order_items', null, {});
    await queryInterface.bulkDelete('work_orders', null, {});
    await queryInterface.bulkDelete('bikes', null, {});
    await queryInterface.bulkDelete('clients', null, {});
    await queryInterface.bulkDelete('users', { email: 'mecanico@taller.com' });
  },
};
