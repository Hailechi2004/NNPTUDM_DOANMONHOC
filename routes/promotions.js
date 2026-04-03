const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotions');

let promotions = [
  { id: 1, code: 'HUTECH20', discount: '20%', type: 'Percentage', status: 'Active', description: 'Giảm giá 20% cho sinh viên HUTECH' },
  { id: 2, code: 'SALE50K', discount: '50,000 đ', type: 'Fixed', status: 'Expired', description: 'Giảm 50k cho đơn hàng từ 500k' },
];

router.get('/', function(req, res, next) {
  return res.render('promotion-management', {
    title: 'Khuyen mai',
    promotions: promotionController.listPromotions(),
  });
  res.render('promotion-management', { title: 'Khuyến mãi', promotions: promotions });
});

router.get('/add', function(req, res, next) {
  if (req.query.code) {
    promotionController.createPromotion(req.query);
    return res.redirect('/promotions');
  }

  return res.render('promotion-form', {
    title: 'Tao ma khuyen mai moi',
    promotion: {},
    action: '/promotions/add',
  });
  if (req.query.code) {
    const newPromo = {
      id: promotions.length + 1,
      code: req.query.code,
      discount: req.query.value + (req.query.type === 'Percentage' ? '%' : ' đ'),
      type: req.query.type,
      status: req.query.status,
      description: req.query.description
    };
    promotions.push(newPromo);
    return res.redirect('/promotions');
  }
  res.render('promotion-form', { title: 'Tạo mã khuyến mãi mới', promotion: {}, action: '/promotions/add' });
});

router.get('/edit/:id', function(req, res, next) {
  const managedPromotion = promotionController.findPromotionById(req.params.id);
  if (!managedPromotion) {
    return res.status(404).render('error', { message: 'Promotion not found', error: {} });
  }

  if (req.query.code) {
    promotionController.updatePromotion(req.params.id, req.query);
    return res.redirect('/promotions');
  }

  return res.render('promotion-form', {
    title: 'Chinh sua ma khuyen mai',
    promotion: managedPromotion,
    action: `/promotions/edit/${req.params.id}`,
  });
  const id = req.params.id;
  const promotion = promotions.find(p => p.id == id);
  
  if (req.query.code) {
    promotion.code = req.query.code;
    promotion.discount = req.query.value + (req.query.type === 'Percentage' ? '%' : ' đ');
    promotion.type = req.query.type;
    promotion.status = req.query.status;
    promotion.description = req.query.description;
    return res.redirect('/promotions');
  }
  
  res.render('promotion-form', { title: 'Chỉnh sửa mã khuyến mãi', promotion: promotion, action: '/promotions/edit/' + id });
});

router.get('/delete/:id', function(req, res, next) {
  promotionController.deletePromotion(req.params.id);
  return res.redirect('/promotions');
  promotions = promotions.filter(p => p.id != req.params.id);
  res.redirect('/promotions');
});

module.exports = router;
