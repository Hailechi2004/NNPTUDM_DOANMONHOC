const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categories');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');

router.get('/', async function listCategories(req, res, next) {
  try {
    const categories = await categoryController.listCategories();
    return sendSuccess(res, categories);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async function getCategory(req, res, next) {
  try {
    const category = await categoryController.findCategoryById(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    return sendSuccess(res, category);
  } catch (error) {
    return next(error);
  }
});

router.post('/', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function createCategory(req, res, next) {
  try {
    const category = await categoryController.createCategory(req.body);
    return sendSuccess(res, category, 201, 'Category created');
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function updateCategory(req, res, next) {
  try {
    const category = await categoryController.updateCategory(req.params.id, req.body);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    return sendSuccess(res, category, 200, 'Category updated');
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function deleteCategory(req, res, next) {
  try {
    const deleted = await categoryController.deleteCategory(req.params.id);
    if (!deleted) {
      return sendError(res, 404, 'Category not found');
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
