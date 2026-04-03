const express = require('express');
const router = express.Router();
const partController = require('../controllers/parts');

const parts = [
  { id: 1, name: 'Bugi NGK Iridium', category: 'Bugi', price: 150000, discountPrice: 120000, hasPromotion: true, image: 'https://picsum.photos/seed/sparkplug/400/400' },
  { id: 2, name: 'Lốp Michelin PS4', category: 'Lốp', price: 3500000, discountPrice: null, hasPromotion: false, image: 'https://picsum.photos/seed/tire/400/400' },
  { id: 3, name: 'Đèn pha LED Philips', category: 'Đèn', price: 1200000, discountPrice: 990000, hasPromotion: true, image: 'https://picsum.photos/seed/headlight/400/400' },
  { id: 4, name: 'Dầu Castrol Edge', category: 'Dầu nhớt', price: 850000, discountPrice: null, hasPromotion: false, image: 'https://picsum.photos/seed/oil/400/400' },
  { id: 5, name: 'Má phanh Brembo', category: 'Phanh', price: 2200000, discountPrice: 1950000, hasPromotion: true, image: 'https://picsum.photos/seed/brake/400/400' },
  { id: 6, name: 'Lọc gió K&N', category: 'Lọc gió', price: 1800000, discountPrice: null, hasPromotion: false, image: 'https://picsum.photos/seed/filter/400/400' },
];

router.get('/', function(req, res, next) {
  return res.render('shop-preview', {
    title: 'Shop Preview',
    parts: partController.listParts(),
  });
  res.render('shop-preview', { title: 'Shop Preview', parts: parts });
});

module.exports = router;
