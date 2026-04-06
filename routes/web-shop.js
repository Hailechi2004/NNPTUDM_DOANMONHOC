const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');

function ensureCustomer(req, res) {
  if (!req.authUser) {
    res.redirect('/auth/login');
    return false;
  }

  if (req.authUser.role !== 'Customer') {
    res.status(403).render('error', {
      title: 'Forbidden',
      message: 'Chức năng này chỉ dành cho khách hàng',
      status: 403,
      error: {},
    });
    return false;
  }

  return true;
}

router.get('/shop', async function shopHome(req, res, next) {
  try {
    const shopData = await shopController.getShopHomeData({
      query: req.query,
      authUser: req.authUser || null,
      isPreviewMode: false,
      currentPath: '/shop',
    });

    return res.render('shop-home', shopData);
  } catch (error) {
    return next(error);
  }
});

router.get('/shop-preview', async function shopPreview(req, res, next) {
  try {
    const shopData = await shopController.getShopHomeData({
      query: req.query,
      authUser: req.authUser || null,
      isPreviewMode: true,
      currentPath: '/shop-preview',
    });

    return res.render('shop-home', shopData);
  } catch (error) {
    return next(error);
  }
});

router.get('/shop/product/:id', async function productDetail(req, res, next) {
  try {
    const productData = await shopController.getShopProductDetail(req.params.id, req.authUser || null);
    if (!productData) {
      return res.status(404).render('error', {
        title: 'Không tìm thấy',
        message: 'Sản phẩm không tồn tại',
        status: 404,
        error: {},
      });
    }

    return res.render('shop-product', productData);
  } catch (error) {
    return next(error);
  }
});

router.get('/shop/cart', async function cartPage(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    const cart = await shopController.getCartDetail(req.authUser);
    return res.render('shop-cart', {
      title: 'Giỏ hàng của bạn',
      cart,
      errorMessage: '',
      successMessage: req.query.success || '',
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/shop/cart/add/:id', async function addToCart(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    await shopController.addToCart(req.authUser, req.params.id, req.body.quantity || 1);
    return res.redirect('/shop/cart?success=%C4%90%C3%A3%20th%C3%AAm%20s%E1%BA%A3n%20ph%E1%BA%A9m%20v%C3%A0o%20gi%E1%BB%8F%20h%C3%A0ng');
  } catch (error) {
    return next(error);
  }
});

router.post('/shop/cart/update/:id', async function updateCart(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    await shopController.updateCartItem(req.authUser, req.params.id, req.body.quantity);
    return res.redirect('/shop/cart?success=%C4%90%C3%A3%20c%E1%BA%ADp%20nh%E1%BA%ADt%20gi%E1%BB%8F%20h%C3%A0ng');
  } catch (error) {
    try {
      const cart = await shopController.getCartDetail(req.authUser);
      return res.status(400).render('shop-cart', {
        title: 'Giỏ hàng của bạn',
        cart,
        errorMessage: error.message,
        successMessage: '',
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
});

router.post('/shop/cart/apply-code/:id', async function applyCode(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    await shopController.applyPromotionCode(req.authUser, req.params.id, req.body.promoCode);
    return res.redirect('/shop/cart?success=%C4%90%C3%A3%20%C3%A1p%20m%C3%A3%20khuy%E1%BA%BFn%20m%C3%A3i');
  } catch (error) {
    try {
      const cart = await shopController.getCartDetail(req.authUser);
      return res.status(400).render('shop-cart', {
        title: 'Giỏ hàng của bạn',
        cart,
        errorMessage: error.message,
        successMessage: '',
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
});

router.post('/shop/cart/clear-code/:id', async function clearCode(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    await shopController.clearPromotionCode(req.authUser, req.params.id);
    return res.redirect('/shop/cart?success=%C4%90%C3%A3%20g%E1%BB%A1%20m%C3%A3%20khuy%E1%BA%BFn%20m%C3%A3i');
  } catch (error) {
    return next(error);
  }
});

router.post('/shop/cart/remove/:id', async function removeItem(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    await shopController.removeCartItem(req.authUser, req.params.id);
    return res.redirect('/shop/cart?success=%C4%90%C3%A3%20x%C3%B3a%20s%E1%BA%A3n%20ph%E1%BA%A9m%20kh%E1%BB%8Fi%20gi%E1%BB%8F%20h%C3%A0ng');
  } catch (error) {
    return next(error);
  }
});

router.post('/shop/checkout', async function checkout(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    await shopController.checkoutCart(req.authUser, req.body.shippingAddress);
    return res.redirect('/shop/orders');
  } catch (error) {
    try {
      const cart = await shopController.getCartDetail(req.authUser);
      return res.status(400).render('shop-cart', {
        title: 'Giỏ hàng của bạn',
        cart,
        errorMessage: error.message,
        successMessage: '',
      });
    } catch (renderError) {
      return next(renderError);
    }
  }
});

router.get('/shop/orders', async function customerOrders(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    const orders = await shopController.listCustomerOrders(req.authUser);
    const cartCount = await shopController.getCartCount(req.authUser.id);
    return res.render('shop-orders', {
      title: 'Đơn hàng của bạn',
      orders,
      cartCount,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/shop/orders/:id', async function customerOrderDetail(req, res, next) {
  if (!ensureCustomer(req, res)) {
    return;
  }

  try {
    const order = await shopController.findCustomerOrderDetail(req.authUser, req.params.id);
    if (!order) {
      return res.status(404).render('error', {
        title: 'Không tìm thấy',
        message: 'Đơn hàng không tồn tại',
        status: 404,
        error: {},
      });
    }

    const cartCount = await shopController.getCartCount(req.authUser.id);
    return res.render('shop-order-detail', {
      title: 'Chi tiết đơn hàng',
      order,
      cartCount,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
