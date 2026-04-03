const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders');

// Mock data
let orders = [
  { id: 'ORD001', customer: 'Nguyễn Văn A', date: '2024-03-20', total: 1500000, status: 'Đã giao', address: '123 Đường Lê Lợi, Quận 1, TP.HCM', items: [{ name: 'Bugi NGK', qty: 2, price: 150000 }, { name: 'Lốp Michelin', qty: 1, price: 1200000 }] },
  { id: 'ORD002', customer: 'Trần Thị B', date: '2024-03-21', total: 3500000, status: 'Đang xử lý', address: '456 Đường CMT8, Quận 3, TP.HCM', items: [{ name: 'Lốp Michelin', qty: 1, price: 3500000 }] },
  { id: 'ORD003', customer: 'Lê Văn C', date: '2024-03-22', total: 850000, status: 'Chờ thanh toán', address: '789 Đường Võ Văn Ngân, Thủ Đức, TP.HCM', items: [{ name: 'Dầu Castrol', qty: 1, price: 850000 }] },
];

router.get('/', function(req, res, next) {
  return res.render('order-management', {
    title: 'Quan ly don hang',
    orders: orderController.listOrders(),
  });
  res.render('order-management', { title: 'Quản lý đơn hàng', orders: orders });
});

router.get('/detail/:id', function(req, res, next) {
  const managedOrder = orderController.findOrderById(req.params.id);
  if (!managedOrder) {
    return res.status(404).render('error', { message: 'Order not found', error: {} });
  }

  return res.render('order-detail', {
    title: 'Chi tiet don hang',
    order: managedOrder,
  });
  const order = orders.find(o => o.id == req.params.id);
  res.render('order-detail', { title: 'Chi tiết đơn hàng', order: order });
});

router.get('/update-status/:id', function(req, res, next) {
  orderController.updateOrderStatus(req.params.id, req.query.status);
  return res.redirect(`/orders/detail/${req.params.id}`);
  const order = orders.find(o => o.id == req.params.id);
  if (order) {
    order.status = req.query.status;
  }
  res.redirect('/orders/detail/' + req.params.id);
});

router.get('/delete/:id', function(req, res, next) {
  orderController.deleteOrder(req.params.id);
  return res.redirect('/orders');
  orders = orders.filter(o => o.id != req.params.id);
  res.redirect('/orders');
});

module.exports = router;
