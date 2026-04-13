// Recalcula el total de una orden a partir de sus items.
const calculateTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.count || 0) * Number(item.unitValue || 0), 0);

module.exports = calculateTotal;
