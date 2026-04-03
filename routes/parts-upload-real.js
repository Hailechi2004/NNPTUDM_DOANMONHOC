const express = require('express');
const router = express.Router();

const partController = require('../controllers/parts');
const { checkLogin, checkRole } = require('../utils/authHandler');
const { uploadImage } = require('../utils/uploadHandler');

async function renderPartForm(res, data) {
  const options = await partController.getPartFormOptions();
  res.render('part-form-upload-vi', {
    categories: options.categories,
    suppliers: options.suppliers,
    promotions: options.promotions,
    errorMessage: '',
    ...data,
  });
}

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
        title: 'Không tìm thấy',
        message: 'Phụ tùng không tồn tại',
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
    await renderPartForm(res, {
      title: 'Thêm phụ tùng mới',
      part: {},
      action: '/parts/add/save',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/edit/:id', checkLogin, checkRole('Admin', 'Staff'), async function(req, res, next) {
  try {
    const part = await partController.findPartById(req.params.id);
    if (!part) {
      return res.status(404).render('error', {
        title: 'Không tìm thấy',
        message: 'Phụ tùng không tồn tại',
        error: {},
      });
    }

    await renderPartForm(res, {
      title: 'Chỉnh sửa phụ tùng',
      part,
      action: `/parts/edit/${req.params.id}/save`,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/add/save', checkLogin, checkRole('Admin', 'Staff'), uploadImage.single('imageFile'), async function(req, res, next) {
  try {
    const payload = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || null),
    };
    await partController.createPart(payload);
    res.redirect('/parts');
  } catch (error) {
    try {
      await renderPartForm(res.status(400), {
        title: 'Thêm phụ tùng mới',
        part: {
          ...req.body,
          image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || null),
        },
        action: '/parts/add/save',
        errorMessage: error.message,
      });
    } catch (renderError) {
      next(renderError);
    }
  }
});

router.post('/edit/:id/save', checkLogin, checkRole('Admin', 'Staff'), uploadImage.single('imageFile'), async function(req, res, next) {
  try {
    const existingPart = await partController.findPartById(req.params.id);
    const payload = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || req.body.existingImage || (existingPart ? existingPart.image : null)),
    };
    await partController.updatePart(req.params.id, payload);
    res.redirect(`/parts/detail/${req.params.id}`);
  } catch (error) {
    try {
      await renderPartForm(res.status(400), {
        title: 'Chỉnh sửa phụ tùng',
        part: {
          ...req.body,
          id: req.params.id,
          image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || req.body.existingImage || null),
        },
        action: `/parts/edit/${req.params.id}/save`,
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
