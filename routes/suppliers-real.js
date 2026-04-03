const express = require('express');
const router = express.Router();

const supplierController = require('../controllers/suppliers');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const suppliers = await supplierController.listSuppliers();
    res.render('supplier-management-vi', {
      title: 'Nhà cung cấp',
      suppliers,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/add', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  res.render('supplier-form-vi', {
    title: 'Thêm nhà cung cấp mới',
    supplier: {},
    action: '/suppliers/add/save',
  });
});

router.get('/edit/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const supplier = await supplierController.findSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).render('error', { title: 'Not found', message: 'Supplier not found', error: {} });
    }

    res.render('supplier-form-vi', {
      title: 'Chỉnh sửa nhà cung cấp',
      supplier,
      action: `/suppliers/edit/${req.params.id}/save`,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/add/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await supplierController.createSupplier(req.query);
    res.redirect('/suppliers');
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await supplierController.updateSupplier(req.params.id, req.query);
    res.redirect('/suppliers');
  } catch (error) {
    next(error);
  }
});

router.get('/delete/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await supplierController.deleteSupplier(req.params.id);
    res.redirect('/suppliers');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
