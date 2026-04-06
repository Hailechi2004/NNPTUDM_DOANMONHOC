const express = require('express');
const router = express.Router();

const supplierController = require('../controllers/suppliers');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');

router.get('/', async function listSuppliers(req, res, next) {
  try {
    const suppliers = await supplierController.listSuppliers();
    return sendSuccess(res, suppliers);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async function getSupplier(req, res, next) {
  try {
    const supplier = await supplierController.findSupplierById(req.params.id);
    if (!supplier) {
      return sendError(res, 404, 'Supplier not found');
    }

    return sendSuccess(res, supplier);
  } catch (error) {
    return next(error);
  }
});

router.post('/', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function createSupplier(req, res, next) {
  try {
    const supplier = await supplierController.createSupplier(req.body);
    return sendSuccess(res, supplier, 201, 'Supplier created');
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function updateSupplier(req, res, next) {
  try {
    const supplier = await supplierController.updateSupplier(req.params.id, req.body);
    if (!supplier) {
      return sendError(res, 404, 'Supplier not found');
    }

    return sendSuccess(res, supplier, 200, 'Supplier updated');
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function deleteSupplier(req, res, next) {
  try {
    const deleted = await supplierController.deleteSupplier(req.params.id);
    if (!deleted) {
      return sendError(res, 404, 'Supplier not found');
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
