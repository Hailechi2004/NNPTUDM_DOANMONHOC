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

router.get('/add', checkLogin, checkRole('Admin', 'Staff'), async function(req, res) {
  res.render('category-form-real', {
    title: 'Thêm danh mục mới',
    category: {},
    action: '/categories/add/save',
  });
});

router.get('/edit/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const category = await categoryController.findCategoryById(req.params.id);
    if (!category) {
      return res.status(404).render('error', {
        title: 'Không tìm thấy',
        message: 'Danh mục không tồn tại',
        error: {},
      });
    }

    res.render('category-form-real', {
      title: 'Chỉnh sửa danh mục',
      category,
      action: `/categories/edit/${req.params.id}/save`,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/add/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await categoryController.createCategory(req.body);
    res.redirect('/categories');
  } catch (error) {
    next(error);
  }
});

router.post('/edit/:id/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await categoryController.updateCategory(req.params.id, req.body);
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
