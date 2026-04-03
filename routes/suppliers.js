const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliers');

let suppliers = [
  { id: 1, name: 'Công ty Phụ tùng ABC', contact: '0901234567', email: 'abc@parts.com', address: 'TP.HCM' },
  { id: 2, name: 'Nhà phân phối XYZ', contact: '0907654321', email: 'xyz@distributor.com', address: 'Hà Nội' },
];

router.get('/', function(req, res, next) {
  return res.render('supplier-management', {
    title: 'Nha cung cap',
    suppliers: supplierController.listSuppliers(),
  });
  res.render('supplier-management', { title: 'Nhà cung cấp', suppliers: suppliers });
});

// Add supplier (simulated with GET for mock simplicity, but handling params)
router.get('/add', function(req, res, next) {
  if (req.query.name) {
    supplierController.createSupplier(req.query);
    return res.redirect('/suppliers');
  }

  return res.render('supplier-form', {
    title: 'Them nha cung cap moi',
    supplier: {},
    action: '/suppliers/add',
  });
  if (req.query.name) {
    const newSupplier = {
      id: suppliers.length + 1,
      name: req.query.name,
      contact: req.query.contact,
      email: req.query.email,
      address: req.query.address
    };
    suppliers.push(newSupplier);
    return res.redirect('/suppliers');
  }
  res.render('supplier-form', { title: 'Thêm nhà cung cấp mới', supplier: {}, action: '/suppliers/add' });
});

// Edit supplier (simulated with GET)
router.get('/edit/:id', function(req, res, next) {
  const managedSupplier = supplierController.findSupplierById(req.params.id);
  if (!managedSupplier) {
    return res.status(404).render('error', { message: 'Supplier not found', error: {} });
  }

  if (req.query.name) {
    supplierController.updateSupplier(req.params.id, req.query);
    return res.redirect('/suppliers');
  }

  return res.render('supplier-form', {
    title: 'Chinh sua nha cung cap',
    supplier: managedSupplier,
    action: `/suppliers/edit/${req.params.id}`,
  });
  const id = req.params.id;
  const supplier = suppliers.find(s => s.id == id);
  
  if (req.query.name) {
    supplier.name = req.query.name;
    supplier.contact = req.query.contact;
    supplier.email = req.query.email;
    supplier.address = req.query.address;
    return res.redirect('/suppliers');
  }
  
  res.render('supplier-form', { title: 'Chỉnh sửa nhà cung cấp', supplier: supplier, action: '/suppliers/edit/' + id });
});

router.get('/delete/:id', function(req, res, next) {
  supplierController.deleteSupplier(req.params.id);
  return res.redirect('/suppliers');
  suppliers = suppliers.filter(s => s.id != req.params.id);
  res.redirect('/suppliers');
});

module.exports = router;
