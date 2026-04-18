const { sequelize } = require('../models');

const getChecklistByWorkOrder = async (workOrderId) => {
  const result = await sequelize.query(`
    SELECT ci.id, ci.name, 
           COALESCE(wci.checked, false) as checked,
           wci.id as "workOrderChecklistId",
           ci.id as "checklistItemId"
    FROM "ChecklistItems" ci
    LEFT JOIN "WorkOrderChecklistItems" wci ON wci.checklist_item_id = ci.id AND wci.work_order_id = :workOrderId
    WHERE ci.active = true
    ORDER BY ci.id
  `, { replacements: { workOrderId }, type: sequelize.QueryTypes.SELECT });
  return result;
};

const setChecklistItem = async (workOrderId, checklistItemId, checked) => {
  const workOrderIdNum = parseInt(workOrderId);
  const checklistItemIdNum = parseInt(checklistItemId);
  const checkedBool = checked === true || checked === 'true' || checked === 1 || checked === '1';
  
  const existing = await sequelize.query(`
    SELECT id FROM "WorkOrderChecklistItems" 
    WHERE work_order_id = $1 AND checklist_item_id = $2
  `, { bind: [workOrderIdNum, checklistItemIdNum], type: sequelize.QueryTypes.SELECT });

  if (existing.length > 0) {
    await sequelize.query(`
      UPDATE "WorkOrderChecklistItems" SET checked = $1 
      WHERE work_order_id = $2 AND checklist_item_id = $3
    `, { bind: [checkedBool, workOrderIdNum, checklistItemIdNum] });
  } else {
    await sequelize.query(`
      INSERT INTO "WorkOrderChecklistItems" (work_order_id, checklist_item_id, checked)
      VALUES ($1, $2, $3)
    `, { bind: [workOrderIdNum, checklistItemIdNum, checkedBool] });
  }
  return { success: true };
};

module.exports = {
  getChecklistByWorkOrder,
  setChecklistItem,
};