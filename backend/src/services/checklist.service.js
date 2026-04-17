const { sequelize } = require('../models');

const getChecklistByWorkOrder = async (workOrderId) => {
  const result = await sequelize.query(`
    SELECT wci.id, wci.checklist_item_id as "checklistItemId", wci.checked, ci.name
    FROM "WorkOrderChecklistItems" wci
    JOIN "ChecklistItems" ci ON ci.id = wci.checklist_item_id
    WHERE wci.work_order_id = :workOrderId
  `, { replacements: { workOrderId }, type: sequelize.QueryTypes.SELECT });
  return result;
};

const setChecklistItem = async (workOrderId, checklistItemId, checked) => {
  const workOrderIdNum = parseInt(workOrderId);
  const checklistItemIdNum = parseInt(checklistItemId);
  
  const existing = await sequelize.query(`
    SELECT id FROM "WorkOrderChecklistItems" 
    WHERE work_order_id = :workOrderId AND checklist_item_id = :checklistItemId
  `, { 
    replacements: { workOrderId: workOrderIdNum, checklistItemId: checklistItemIdNum }, 
    type: sequelize.QueryTypes.SELECT 
  });

  if (existing.length > 0) {
    await sequelize.query(`
      UPDATE "WorkOrderChecklistItems" SET checked = :checked::boolean
      WHERE work_order_id = :workOrderId AND checklist_item_id = :checklistItemId
    `, { 
      replacements: { checked: checked, workOrderId: workOrderIdNum, checklistItemId: checklistItemIdNum },
      type: sequelize.QueryTypes.UPDATE
    });
  } else {
    await sequelize.query(`
      INSERT INTO "WorkOrderChecklistItems" (work_order_id, checklist_item_id, checked)
      VALUES (:workOrderId, :checklistItemId, :checked)
    `, { 
      replacements: { workOrderId: workOrderIdNum, checklistItemId: checklistItemIdNum, checked: checked },
      type: sequelize.QueryTypes.INSERT
    });
  }
  return { success: true };
};

module.exports = {
  getChecklistByWorkOrder,
  setChecklistItem,
};