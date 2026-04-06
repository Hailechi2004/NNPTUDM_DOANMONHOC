const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categories');
const orderController = require('../controllers/orders');
const partController = require('../controllers/parts');
const promotionController = require('../controllers/promotions');
const supplierController = require('../controllers/suppliers');
const userController = require('../controllers/users');
const { uploadImage } = require('../utils/uploadHandler');

const ADMIN_PATH_PREFIXES = ['/parts', '/categories', '/suppliers', '/promotions', '/orders', '/users'];

function createNotFound(message) {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function getRequestPayload(req) {
  if (req.body && Object.keys(req.body).length > 0) {
    return req.body;
  }

  return req.query || {};
}

function ensureWebRole(req, res, allowedRoles) {
  if (!req.authUser) {
    res.redirect('/auth/login');
    return false;
  }

  if (req.authUser.status && req.authUser.status !== 'Active') {
    res.status(403).render('error', {
      title: 'Bị từ chối',
      message: 'Tài khoản của bạn hiện không hoạt động',
      status: 403,
      error: {},
    });
    return false;
  }

  if (!allowedRoles.includes(req.authUser.role)) {
    res.status(403).render('error', {
      title: 'Bị từ chối',
      message: 'Bạn không có quyền truy cập chức năng này',
      status: 403,
      error: {},
    });
    return false;
  }

  return true;
}

function ensureStaffArea(req, res, next) {
  if (!ADMIN_PATH_PREFIXES.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`))) {
    return next();
  }

  if (!ensureWebRole(req, res, ['Admin', 'Staff'])) {
    return;
  }

  return next();
}

function ensureAdminArea(req, res, next) {
  if (!ensureWebRole(req, res, ['Admin'])) {
    return;
  }

  return next();
}

router.use(ensureStaffArea);

router.get('/parts', async function partsPage(req, res, next) {
  try {
    const filters = {
      categoryId: req.query.categoryId || req.query.category || '',
      stockFilter: req.query.stockFilter || req.query.stock || 'all',
      search: req.query.search || '',
      sort: req.query.sort || 'newest',
    };
    const parts = await partController.listParts(filters);
    return res.render('part-list', {
      title: 'Danh sách phụ tùng',
      parts,
      filters,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/parts/add', async function addPartPage(req, res, next) {
  try {
    const options = await partController.getPartFormOptions();
    return res.render('part-form-upload-vi', {
      title: 'Thêm phụ tùng mới',
      action: '/parts/add/save',
      errorMessage: '',
      part: { hasPromotion: false },
      ...options,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/parts/add/save', uploadImage.single('imageFile'), async function saveNewPart(req, res, next) {
  try {
    const payload = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || null),
    };
    await partController.createPart(payload);
    return res.redirect('/parts');
  } catch (error) {
    try {
      const options = await partController.getPartFormOptions();
      return res.status(400).render('part-form-upload-vi', {
        title: 'Thêm phụ tùng mới',
        action: '/parts/add/save',
        errorMessage: error.message,
        part: {
          ...req.body,
          image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || null),
        },
        ...options,
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
});

router.get('/parts/detail/:id', async function partDetailPage(req, res, next) {
  try {
    const part = await partController.findPartById(req.params.id);
    if (!part) {
      return next(createNotFound('Không tìm thấy phụ tùng'));
    }

    return res.render('part-detail-admin', {
      title: 'Chi tiết phụ tùng',
      part,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/parts/edit/:id', async function editPartPage(req, res, next) {
  try {
    const [part, options] = await Promise.all([
      partController.findPartById(req.params.id),
      partController.getPartFormOptions(),
    ]);

    if (!part) {
      return next(createNotFound('Không tìm thấy phụ tùng'));
    }

    return res.render('part-form-upload-vi', {
      title: 'Chỉnh sửa phụ tùng',
      action: `/parts/edit/${req.params.id}/save`,
      errorMessage: '',
      part,
      ...options,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/parts/edit/:id/save', uploadImage.single('imageFile'), async function saveEditedPart(req, res, next) {
  try {
    const existingPart = await partController.findPartById(req.params.id);
    if (!existingPart) {
      return next(createNotFound('Không tìm thấy phụ tùng'));
    }

    const payload = {
      ...req.body,
      image: req.file
        ? `/uploads/${req.file.filename}`
        : (req.body.image || req.body.existingImage || existingPart.image || null),
    };

    await partController.updatePart(req.params.id, payload);
    return res.redirect('/parts');
  } catch (error) {
    try {
      const options = await partController.getPartFormOptions();
      return res.status(400).render('part-form-upload-vi', {
        title: 'Chỉnh sửa phụ tùng',
        action: `/parts/edit/${req.params.id}/save`,
        errorMessage: error.message,
        part: {
          ...req.body,
          id: req.params.id,
          image: req.file ? `/uploads/${req.file.filename}` : (req.body.image || req.body.existingImage || null),
        },
        ...options,
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
});

router.get('/parts/delete/:id', async function deletePart(req, res, next) {
  try {
    await partController.deletePart(req.params.id);
    return res.redirect('/parts');
  } catch (error) {
    return next(error);
  }
});

router.get('/categories', async function categoriesPage(req, res, next) {
  try {
    const categories = await categoryController.listCategories();
    return res.render('category-management-vi', {
      title: 'Danh mục',
      categories,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/categories/add', function addCategoryPage(req, res) {
  return res.render('category-form', {
    title: 'Thêm danh mục mới',
    action: '/categories/add/save',
    category: {},
  });
});

router.post('/categories/add/save', async function saveNewCategory(req, res, next) {
  try {
    await categoryController.createCategory(req.body);
    return res.redirect('/categories');
  } catch (error) {
    return next(error);
  }
});

router.get('/categories/edit/:id', async function editCategoryPage(req, res, next) {
  try {
    const category = await categoryController.findCategoryById(req.params.id);
    if (!category) {
      return next(createNotFound('Không tìm thấy danh mục'));
    }

    return res.render('category-form', {
      title: 'Chỉnh sửa danh mục',
      action: `/categories/edit/${req.params.id}/save`,
      category,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/categories/edit/:id/save', async function saveEditedCategory(req, res, next) {
  try {
    const category = await categoryController.updateCategory(req.params.id, req.body);
    if (!category) {
      return next(createNotFound('Không tìm thấy danh mục'));
    }

    return res.redirect('/categories');
  } catch (error) {
    return next(error);
  }
});

router.get('/categories/delete/:id', async function deleteCategory(req, res, next) {
  try {
    await categoryController.deleteCategory(req.params.id);
    return res.redirect('/categories');
  } catch (error) {
    return next(error);
  }
});

router.get('/suppliers', async function suppliersPage(req, res, next) {
  try {
    const suppliers = await supplierController.listSuppliers();
    return res.render('supplier-management-vi', {
      title: 'Nhà cung cấp',
      suppliers,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/suppliers/add', function addSupplierPage(req, res) {
  return res.render('supplier-form-vi', {
    title: 'Thêm nhà cung cấp mới',
    action: '/suppliers/add/save',
    supplier: {},
  });
});

async function handleSupplierSave(req, res, next, supplierId = null) {
  try {
    const payload = getRequestPayload(req);

    if (supplierId) {
      const supplier = await supplierController.updateSupplier(supplierId, payload);
      if (!supplier) {
        return next(createNotFound('Không tìm thấy nhà cung cấp'));
      }
    } else {
      await supplierController.createSupplier(payload);
    }

    return res.redirect('/suppliers');
  } catch (error) {
    return next(error);
  }
}

router.get('/suppliers/add/save', function saveNewSupplierGet(req, res, next) {
  return handleSupplierSave(req, res, next);
});

router.post('/suppliers/add/save', function saveNewSupplierPost(req, res, next) {
  return handleSupplierSave(req, res, next);
});

router.get('/suppliers/edit/:id', async function editSupplierPage(req, res, next) {
  try {
    const supplier = await supplierController.findSupplierById(req.params.id);
    if (!supplier) {
      return next(createNotFound('Không tìm thấy nhà cung cấp'));
    }

    return res.render('supplier-form-vi', {
      title: 'Chỉnh sửa nhà cung cấp',
      action: `/suppliers/edit/${req.params.id}/save`,
      supplier,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/suppliers/edit/:id/save', function saveEditedSupplierGet(req, res, next) {
  return handleSupplierSave(req, res, next, req.params.id);
});

router.post('/suppliers/edit/:id/save', function saveEditedSupplierPost(req, res, next) {
  return handleSupplierSave(req, res, next, req.params.id);
});

router.get('/suppliers/delete/:id', async function deleteSupplier(req, res, next) {
  try {
    await supplierController.deleteSupplier(req.params.id);
    return res.redirect('/suppliers');
  } catch (error) {
    return next(error);
  }
});

router.get('/promotions', async function promotionsPage(req, res, next) {
  try {
    const promotions = await promotionController.listPromotions();
    return res.render('promotion-management-vi', {
      title: 'Khuyến mãi',
      promotions,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/promotions/add', function addPromotionPage(req, res) {
  return res.render('promotion-form-vi', {
    title: 'Tạo mã khuyến mãi mới',
    action: '/promotions/add/save',
    promotion: {
      status: 'Active',
      type: 'Percentage',
    },
  });
});

async function handlePromotionSave(req, res, next, promotionId = null) {
  try {
    const payload = getRequestPayload(req);

    if (promotionId) {
      const promotion = await promotionController.updatePromotion(promotionId, payload);
      if (!promotion) {
        return next(createNotFound('Không tìm thấy mã khuyến mãi'));
      }
    } else {
      await promotionController.createPromotion(payload);
    }

    return res.redirect('/promotions');
  } catch (error) {
    return next(error);
  }
}

router.get('/promotions/add/save', function saveNewPromotionGet(req, res, next) {
  return handlePromotionSave(req, res, next);
});

router.post('/promotions/add/save', function saveNewPromotionPost(req, res, next) {
  return handlePromotionSave(req, res, next);
});

router.get('/promotions/edit/:id', async function editPromotionPage(req, res, next) {
  try {
    const promotion = await promotionController.findPromotionById(req.params.id);
    if (!promotion) {
      return next(createNotFound('Không tìm thấy mã khuyến mãi'));
    }

    return res.render('promotion-form-vi', {
      title: 'Chỉnh sửa mã khuyến mãi',
      action: `/promotions/edit/${req.params.id}/save`,
      promotion,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/promotions/edit/:id/save', function saveEditedPromotionGet(req, res, next) {
  return handlePromotionSave(req, res, next, req.params.id);
});

router.post('/promotions/edit/:id/save', function saveEditedPromotionPost(req, res, next) {
  return handlePromotionSave(req, res, next, req.params.id);
});

router.get('/promotions/delete/:id', async function deletePromotion(req, res, next) {
  try {
    await promotionController.deletePromotion(req.params.id);
    return res.redirect('/promotions');
  } catch (error) {
    return next(error);
  }
});

router.get('/orders', async function ordersPage(req, res, next) {
  try {
    const orders = await orderController.listOrders();
    return res.render('order-management-vi', {
      title: 'Quản lý đơn hàng',
      orders,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/orders/detail/:id', async function orderDetailPage(req, res, next) {
  try {
    const order = await orderController.findOrderById(req.params.id);
    if (!order) {
      return next(createNotFound('Không tìm thấy đơn hàng'));
    }

    return res.render('order-detail-vi', {
      title: 'Chi tiết đơn hàng',
      order,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/orders/update-status/:id', async function updateOrderStatusGet(req, res, next) {
  try {
    const order = await orderController.updateOrderStatus(req.params.id, req.query.status);
    if (!order) {
      return next(createNotFound('Không tìm thấy đơn hàng'));
    }

    return res.redirect(`/orders/detail/${order.id}`);
  } catch (error) {
    return next(error);
  }
});

router.post('/orders/update-status/:id', async function updateOrderStatusPost(req, res, next) {
  try {
    const order = await orderController.updateOrderStatus(req.params.id, req.body.status);
    if (!order) {
      return next(createNotFound('Không tìm thấy đơn hàng'));
    }

    return res.redirect(`/orders/detail/${order.id}`);
  } catch (error) {
    return next(error);
  }
});

router.get('/orders/delete/:id', async function deleteOrder(req, res, next) {
  try {
    await orderController.deleteOrder(req.params.id);
    return res.redirect('/orders');
  } catch (error) {
    return next(error);
  }
});

router.get('/users', ensureAdminArea, async function usersPage(req, res, next) {
  try {
    const users = await userController.listUsers();
    return res.render('user-management-vi', {
      title: 'Người dùng',
      users,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/users/add', ensureAdminArea, function addUserPage(req, res) {
  return res.render('user-form', {
    title: 'Người dùng',
    action: '/users/add/save',
    isEdit: false,
    errorMessage: '',
    user: {
      role: 'Customer',
      status: 'Active',
    },
  });
});

router.post('/users/add/save', ensureAdminArea, async function saveNewUser(req, res, next) {
  try {
    await userController.createUser(req.body);
    return res.redirect('/users');
  } catch (error) {
    return res.status(400).render('user-form', {
      title: 'Người dùng',
      action: '/users/add/save',
      isEdit: false,
      errorMessage: error.message,
      user: req.body,
    });
  }
});

router.get('/users/edit/:id', ensureAdminArea, async function editUserPage(req, res, next) {
  try {
    const user = await userController.findUserById(req.params.id);
    if (!user) {
      return next(createNotFound('Không tìm thấy người dùng'));
    }

    return res.render('user-form', {
      title: 'Người dùng',
      action: `/users/edit/${req.params.id}/save`,
      isEdit: true,
      errorMessage: '',
      user,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/users/edit/:id/save', ensureAdminArea, async function saveEditedUser(req, res, next) {
  try {
    const user = await userController.updateUser(req.params.id, req.body);
    if (!user) {
      return next(createNotFound('Không tìm thấy người dùng'));
    }

    return res.redirect('/users');
  } catch (error) {
    return res.status(400).render('user-form', {
      title: 'Người dùng',
      action: `/users/edit/${req.params.id}/save`,
      isEdit: true,
      errorMessage: error.message,
      user: {
        ...req.body,
        id: req.params.id,
      },
    });
  }
});

router.get('/users/delete/:id', ensureAdminArea, async function deleteUser(req, res, next) {
  try {
    await userController.deleteUser(req.params.id);
    return res.redirect('/users');
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
