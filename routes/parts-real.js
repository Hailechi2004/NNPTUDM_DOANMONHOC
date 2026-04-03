const express = require('express');
const router = express.Router();

const partController = require('../controllers/parts');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const filters = {
      stockFilter: req.query.stock || 'all',
      search: req.query.search || '',
      sort: req.query.sort || 'newest',
    };
    const parts = await partController.listParts(filters);
    res.render('part-list-real', {
      title: 'Danh sách phụ tùng',
      parts,
      filters,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/detail/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const part = await partController.findPartById(req.params.id);
    if (!part) {
      return res.status(404).render('error', {
        title: 'Not found',
        message: 'Part not found',
        error: {},
      });
    }

    return res.render('part-detail-admin', {
      title: 'Chi tiết phụ tùng',
      part,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/add', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const options = await partController.getPartFormOptions();
    res.render('part-form-real', {
      title: 'Thêm phụ tùng mới',
      part: {},
      action: '/parts/add/save',
      categories: options.categories,
      suppliers: options.suppliers,
      promotions: options.promotions,
      errorMessage: '',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const part = await partController.findPartById(req.params.id);
    const options = await partController.getPartFormOptions();
    if (!part) {
      return res.status(404).render('error', { title: 'Not found', message: 'Part not found', error: {} });
    }

    res.render('part-form-real', {
      title: 'Chỉnh sửa phụ tùng',
      part,
      action: `/parts/edit/${req.params.id}/save`,
      categories: options.categories,
      suppliers: options.suppliers,
      promotions: options.promotions,
      errorMessage: '',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/add/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await partController.createPart(req.query);
    res.redirect('/parts');
  } catch (error) {
    try {
      const options = await partController.getPartFormOptions();
      res.status(400).render('part-form-real', {
        title: 'Thêm phụ tùng mới',
        part: req.query,
        action: '/parts/add/save',
        categories: options.categories,
        suppliers: options.suppliers,
        promotions: options.promotions,
        errorMessage: error.message,
      });
    } catch (renderError) {
      next(renderError);
    }
  }
});

router.get('/edit/:id/save', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await partController.updatePart(req.params.id, req.query);
    res.redirect('/parts/detail/' + req.params.id);
  } catch (error) {
    try {
      const options = await partController.getPartFormOptions();
      res.status(400).render('part-form-real', {
        title: 'Chỉnh sửa phụ tùng',
        part: {
          ...req.query,
          id: req.params.id,
        },
        action: `/parts/edit/${req.params.id}/save`,
        categories: options.categories,
        suppliers: options.suppliers,
        promotions: options.promotions,
        errorMessage: error.message,
      });
    } catch (renderError) {
      next(renderError);
    }
  }
});

router.get('/delete/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    await partController.deletePart(req.params.id);
    res.redirect('/parts');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
