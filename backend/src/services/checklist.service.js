const { sequelize } = require('../models');

const getChecklistByWorkOrder = async (workOrderId) => {
  const result = await sequelize.query(`
    SELECT wci.id, wci.checklist_item_id, wci.checked, ci.name
    FROM "WorkOrderChecklistItems" wci
    JOIN "ChecklistItems" ci ON ci.id = wci.checklist_item_id
    WHERE wci.work_order_id = $1
  `, { bind: [workOrderId], type: sequelize.QueryTypes.SELECT });
  return result;
};

const setChecklistItem = async (workOrderId, checklistItemId, checked) => {
  const existing = await sequelize.query(`
    SELECT id FROM "WorkOrderChecklistItems" 
    WHERE work_order_id = $1 AND checklist_item_id = $2
  `, { bind: [workOrderId, checklistItemId], type: sequelize.QueryTypes.SELECT });

  if (existing.length > 0) {
    await sequelize.query(`
      UPDATE "WorkOrderChecklistItems" SET checked = $1 
      WHERE work_order_id = $2 AND checklist_item_id = $3
    `, { bind: [checked, workOrderId, checklistItemId] });
  } else {
    await sequelize.query(`
      INSERT INTO "WorkOrderChecklistItems" (work_order_id, checklist_item_id, checked)
      VALUES ($1, $2, $3)
    `, { bind: [workOrderId, checklistItemId, checked] });
  }
  return { success: true };
};

module.exports = {
  getChecklistByWorkOrder,
  setChecklistItem,
};