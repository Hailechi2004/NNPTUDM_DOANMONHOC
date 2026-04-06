const orderService = require('../services/orderService');

async function listOrders() {
  return orderService.listOrders();
}

async function findOrderById(id) {
  return orderService.findOrderById(id);
}

async function updateOrderStatus(id, status) {
  return orderService.updateOrderStatus(id, status);
}

async function deleteOrder(id) {
  return orderService.deleteOrder(id);
}

module.exports = {
  deleteOrder,
  findOrderById,
  listOrders,
  updateOrderStatus,
};
