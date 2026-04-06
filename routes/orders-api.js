const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orders');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');

router.use(checkLogin, checkActiveUser, checkRole('Admin', 'Staff'));

router.get('/', async function listOrders(req, res, next) {
  try {
    const orders = await orderController.listOrders();
    return sendSuccess(res, orders);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async function getOrder(req, res, next) {
  try {
    const order = await orderController.findOrderById(req.params.id);
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    return sendSuccess(res, order);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/status', async function updateStatus(req, res, next) {
  try {
    const order = await orderController.updateOrderStatus(req.params.id, req.body.status);
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    return sendSuccess(res, order, 200, 'Order status updated');
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async function deleteOrder(req, res, next) {
  try {
    const deleted = await orderController.deleteOrder(req.params.id);
    if (!deleted) {
      return sendError(res, 404, 'Order not found');
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
