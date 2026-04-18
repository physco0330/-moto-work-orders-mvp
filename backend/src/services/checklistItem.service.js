const { ChecklistItem } = require('../models');

const getAll = async (page = 1, pageSize = 10) => {
  const offset = (Number(page) - 1) * Number(pageSize);
  const { rows, count } = await ChecklistItem.findAndCountAll({
    order: [['id', 'ASC']],
    offset,
    limit: Number(pageSize),
  });
  return {
    data: rows,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: count,
      totalPages: Math.ceil(count / Number(pageSize)),
    },
  };
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