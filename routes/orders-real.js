const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orders-real');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const orders = await orderController.listOrders();
    res.render('order-management-vi', {
      title: 'Quản lý đơn hàng',
      orders,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/detail/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const order = await orderController.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).render('error', {
        title: 'Not found',
        message: 'Order not found',
        error: {},
      });
    }

    return res.render('order-detail-vi', {
      title: 'Chi tiết đơn hàng',
      order,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/update-status/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await orderController.updateOrderStatus(req.params.id, req.query.status);
    res.redirect(`/orders/detail/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.get('/delete/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await orderController.deleteOrder(req.params.id);
    res.redirect('/orders');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
