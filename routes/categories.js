const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');

let categories = [
  { id: 1, name: 'Lốp xe', description: 'Các loại lốp xe ô tô từ các thương hiệu nổi tiếng.', count: 25 },
  { id: 2, name: 'Đèn pha', description: 'Hệ thống chiếu sáng LED, Halogen cho mọi dòng xe.', count: 18 },
  { id: 3, name: 'Bugi', description: 'Hệ thống đánh lửa Iridium, Platinum cao cấp.', count: 42 },
  { id: 4, name: 'Dầu nhớt', description: 'Dầu nhớt động cơ, dầu hộp số chính hãng.', count: 15 },
];

router.get('/', function(req, res, next) {
  return res.render('category-management', {
    title: 'Danh muc',
    categories: categoryController.listCategories(),
  });
  res.render('category-management', { title: 'Danh mục', categories: categories });
});

router.get('/add', function(req, res, next) {
  if (req.query.name) {
    categoryController.createCategory(req.query);
    return res.redirect('/categories');
  }

  return res.render('category-form', {
    title: 'Them danh muc moi',
    category: {},
    action: '/categories/add',
  });
  if (req.query.name) {
    const newCategory = {
      id: categories.length + 1,
      name: req.query.name,
      description: req.query.description,
      count: 0
    };
    categories.push(newCategory);
    return res.redirect('/categories');
  }
  res.render('category-form', { title: 'Thêm danh mục mới', category: {}, action: '/categories/add' });
});

router.get('/edit/:id', function(req, res, next) {
  const managedCategory = categoryController.findCategoryById(req.params.id);
  if (!managedCategory) {
    return res.status(404).render('error', { message: 'Category not found', error: {} });
  }

  if (req.query.name) {
    categoryController.updateCategory(req.params.id, req.query);
    return res.redirect('/categories');
  }

  return res.render('category-form', {
    title: 'Chinh sua danh muc',
    category: managedCategory,
    action: `/categories/edit/${req.params.id}`,
  });
  const id = req.params.id;
  const category = categories.find(c => c.id == id);
  
  if (req.query.name) {
    category.name = req.query.name;
    category.description = req.query.description;
    return res.redirect('/categories');
  }
  
  res.render('category-form', { title: 'Chỉnh sửa danh mục', category: category, action: '/categories/edit/' + id });
});

router.get('/delete/:id', function(req, res, next) {
  categoryController.deleteCategory(req.params.id);
  return res.redirect('/categories');
  categories = categories.filter(c => c.id != req.params.id);
  res.redirect('/categories');
});

module.exports = router;
