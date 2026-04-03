const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categories');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const categories = await categoryController.listCategories();
    res.render('category-management-vi', {
      title: 'Danh mục',
      categories,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/add', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  res.render('category-form-vi', {
    title: 'Thêm danh mục mới',
    category: {},
    action: '/categories/add',
  });
});

router.get('/edit/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const category = await categoryController.findCategoryById(req.params.id);
    if (!category) {
      return res.status(404).render('error', { title: 'Not found', message: 'Category not found', error: {} });
    }

    res.render('category-form-vi', {
      title: 'Chỉnh sửa danh mục',
      category,
      action: `/categories/edit/${req.params.id}`,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/add/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await categoryController.createCategory(req.query);
    res.redirect('/categories');
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await categoryController.updateCategory(req.params.id, req.query);
    res.redirect('/categories');
  } catch (error) {
    next(error);
  }
});

router.get('/delete/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await categoryController.deleteCategory(req.params.id);
    res.redirect('/categories');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
