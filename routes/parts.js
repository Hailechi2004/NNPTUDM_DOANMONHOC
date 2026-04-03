const express = require('express');
const router = express.Router();
const partController = require('../controllers/parts');

// Mock data
let parts = [
  { id: 1, name: 'Bugi NGK Iridium', category: 'Bugi', price: 150000, discountPrice: 120000, stock: 50, image: 'https://picsum.photos/seed/sparkplug/400/400', description: 'Bugi chất lượng cao giúp đánh lửa cực mạnh, tiết kiệm nhiên liệu.', hasPromotion: true },
  { id: 2, name: 'Lốp Michelin Pilot Sport 4', category: 'Lốp', price: 3500000, discountPrice: null, stock: 12, image: 'https://picsum.photos/seed/tire/400/400', description: 'Lốp xe hiệu suất cao, bám đường cực tốt trong mọi điều kiện thời tiết.', hasPromotion: false },
  { id: 3, name: 'Đèn pha LED Philips', category: 'Đèn', price: 1200000, discountPrice: 990000, stock: 20, image: 'https://picsum.photos/seed/headlight/400/400', description: 'Ánh sáng trắng hiện đại, độ bền cao và tiết kiệm điện năng.', hasPromotion: true },
  { id: 4, name: 'Dầu nhớt Castrol Edge 5W-30', category: 'Dầu nhớt', price: 850000, discountPrice: null, stock: 30, image: 'https://picsum.photos/seed/oil/400/400', description: 'Dầu nhớt tổng hợp toàn phần giúp bảo vệ động cơ tối ưu.', hasPromotion: false },
];

// List all parts
router.get('/', function(req, res, next) {
  return res.render('part-list', {
    title: 'Danh sach phu tung',
    parts: partController.listParts(),
  });
  res.render('part-list', { title: 'Danh sách phụ tùng', parts: parts });
});

// View part detail
router.get('/detail/:id', function(req, res, next) {
  const managedPart = partController.findPartById(req.params.id);
  if (!managedPart) {
    return res.status(404).render('error', { message: 'Part not found', error: {} });
  }

  return res.render('part-detail', {
    title: 'Chi tiet phu tung',
    part: managedPart,
  });
  const part = parts.find(p => p.id == req.params.id);
  if (part) {
    res.render('part-detail', { title: 'Chi tiết phụ tùng', part: part });
  } else {
    res.status(404).render('error', { message: 'Không tìm thấy sản phẩm', error: {} });
  }
});

// Add part form
router.get('/add', function(req, res, next) {
  if (req.query.name) {
    partController.createPart(req.query);
    return res.redirect('/parts');
  }

  return res.render('part-form', {
    title: 'Them phu tung moi',
    part: {},
    action: '/parts/add',
  });
  if (req.query.name) {
    const newPart = {
      id: parts.length + 1,
      name: req.query.name,
      category: req.query.category,
      price: parseInt(req.query.price),
      discountPrice: req.query.discountPrice ? parseInt(req.query.discountPrice) : null,
      stock: parseInt(req.query.stock),
      image: req.query.image,
      description: req.query.description,
      hasPromotion: req.query.hasPromotion === 'on'
    };
    parts.push(newPart);
    return res.redirect('/parts');
  }
  res.render('part-form', { title: 'Thêm phụ tùng mới', part: {}, action: '/parts/add' });
});

// Edit part form
router.get('/edit/:id', function(req, res, next) {
  const managedPart = partController.findPartById(req.params.id);
  if (!managedPart) {
    return res.status(404).render('error', { message: 'Part not found', error: {} });
  }

  if (req.query.name) {
    partController.updatePart(req.params.id, req.query);
    return res.redirect('/parts');
  }

  return res.render('part-form', {
    title: 'Chinh sua phu tung',
    part: managedPart,
    action: `/parts/edit/${req.params.id}`,
  });
  const id = req.params.id;
  const part = parts.find(p => p.id == id);
  
  if (req.query.name) {
    part.name = req.query.name;
    part.category = req.query.category;
    part.price = parseInt(req.query.price);
    part.discountPrice = req.query.discountPrice ? parseInt(req.query.discountPrice) : null;
    part.stock = parseInt(req.query.stock);
    part.image = req.query.image;
    part.description = req.query.description;
    part.hasPromotion = req.query.hasPromotion === 'on';
    return res.redirect('/parts');
  }
  
  res.render('part-form', { title: 'Chỉnh sửa phụ tùng', part: part, action: '/parts/edit/' + id });
});

// Delete part (Mock)
router.get('/delete/:id', function(req, res, next) {
  partController.deletePart(req.params.id);
  return res.redirect('/parts');
  parts = parts.filter(p => p.id != req.params.id);
  res.redirect('/parts');
});

module.exports = router;
