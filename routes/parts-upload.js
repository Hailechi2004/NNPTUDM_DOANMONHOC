const express = require('express');
const router = express.Router();

const partController = require('../controllers/parts');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const { uploadImage } = require('../utils/uploadHandler');

router.get('/', async function listParts(req, res, next) {
  try {
    const filters = {
      categoryId: req.query.categoryId || req.query.category || '',
      stockFilter: req.query.stockFilter || req.query.stock || 'all',
      search: req.query.search || '',
      sort: req.query.sort || 'newest',
    };
    const parts = await partController.listParts(filters);
    return sendSuccess(res, parts);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async function getPart(req, res, next) {
  try {
    const part = await partController.findPartById(req.params.id);
    if (!part) {
      return sendError(res, 404, 'Part not found');
    }

    return sendSuccess(res, part);
  } catch (error) {
    return next(error);
  }
});

router.post('/', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), uploadImage.single('imageFile'), async function createPart(req, res, next) {
  try {
    const payload = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || null),
    };
    const part = await partController.createPart(payload);
    return sendSuccess(res, part, 201, 'Part created');
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), uploadImage.single('imageFile'), async function updatePart(req, res, next) {
  try {
    const existingPart = await partController.findPartById(req.params.id);
    if (!existingPart) {
      return sendError(res, 404, 'Part not found');
    }

    const payload = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || req.body.existingImage || existingPart.image || null),
    };
    const part = await partController.updatePart(req.params.id, payload);
    return sendSuccess(res, part, 200, 'Part updated');
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function deletePart(req, res, next) {
  try {
    const deleted = await partController.deletePart(req.params.id);
    if (!deleted) {
      return sendError(res, 404, 'Part not found');
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
