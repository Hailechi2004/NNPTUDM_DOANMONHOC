const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard');
const shopController = require('../controllers/shop');

router.get('/', async function home(req, res, next) {
  try {
    if (!req.authUser || req.authUser.role === 'Customer') {
      const shopData = await shopController.getShopHomeData({
        query: req.query,
        authUser: req.authUser || null,
        isPreviewMode: false,
        currentPath: '/shop',
      });

      return res.render('shop-home', shopData);
    }

    const dashboard = await dashboardController.getDashboardData();
    return res.render('index', {
      title: 'Bảng điều khiển',
      stats: dashboard.stats,
      recentOrders: dashboard.recentOrders,
      topProducts: dashboard.topProducts,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
