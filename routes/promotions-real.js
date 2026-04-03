const express = require('express');
const router = express.Router();

const promotionController = require('../controllers/promotions');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const promotions = await promotionController.listPromotions();
    res.render('promotion-management-vi', {
      title: 'Khuyến mãi',
      promotions,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/add', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  res.render('promotion-form-vi', {
    title: 'Tạo mã khuyến mãi mới',
    promotion: {},
    action: '/promotions/add/save',
  });
});

router.get('/edit/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const promotion = await promotionController.findPromotionById(req.params.id);
    if (!promotion) {
      return res.status(404).render('error', { title: 'Not found', message: 'Promotion not found', error: {} });
    }

    res.render('promotion-form-vi', {
      title: 'Chỉnh sửa mã khuyến mãi',
      promotion,
      action: `/promotions/edit/${req.params.id}/save`,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/add/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await promotionController.createPromotion(req.query);
    res.redirect('/promotions');
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await promotionController.updatePromotion(req.params.id, req.query);
    res.redirect('/promotions');
  } catch (error) {
    next(error);
  }
});

router.get('/delete/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await promotionController.deletePromotion(req.params.id);
    res.redirect('/promotions');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
