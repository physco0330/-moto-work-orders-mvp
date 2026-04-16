const { ChecklistItem } = require('../models');

const getAll = async () => {
  return await ChecklistItem.findAll({
    order: [['id', 'ASC']],
  });
};

const create = async (data) => {
  return await ChecklistItem.create(data);
};

const update = async (id, data) => {
  const item = await ChecklistItem.findByPk(id);
  if (!item) return null;
  await item.update(data);
  return item;
};

const remove = async (id) => {
  const item = await ChecklistItem.findByPk(id);
  if (!item) return false;
  await item.destroy();
  return true;
};

module.exports = {
  getAll,
  create,
  update,
  remove,
};