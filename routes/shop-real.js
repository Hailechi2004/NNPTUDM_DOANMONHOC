const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop-real');
const { checkLogin, checkRole } = require('../utils/authHandler');
const { cartQuantityValidation, checkoutValidation, validateResult } = require('../utils/validationHandler');

router.get('/', async function(req, res, next) {
  try {
    const shopData = await shopController.getShopHomeData({
      query: req.query,
      authUser: req.authUser || null,
      isPreviewMode: req.baseUrl === '/shop-preview',
      currentPath: req.baseUrl || '/shop',
    });

    res.render('shop-home', shopData);
  } catch (error) {
    next(error);
  }
});

router.get('/product/:id', async function(req, res, next) {
  try {
    const productData = await shopController.getShopProductDetail(req.params.id, req.authUser || null);
    if (!productData) {
      return res.status(404).render('error', {
        title: 'Not found',
        message: 'Sản phẩm không tồn tại',
        error: {},
      });
    }

    return res.render('shop-product', productData);
  } catch (error) {
    return next(error);
  }
});

router.get('/cart', checkLogin, checkRole('Customer'), async function(req, res, next) {
  try {
    const cart = await shopController.getCartDetail(req.authUser);
    res.render('shop-cart', {
      title: 'Giỏ hàng của bạn',
      cart,
      errorMessage: '',
      successMessage: req.query.success || '',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/cart/add/:id', checkLogin, checkRole('Customer'), cartQuantityValidation, validateResult, async function(req, res, next) {
  try {
    await shopController.addToCart(req.authUser, req.params.id, req.body.quantity || 1);
    res.redirect('/shop/cart?success=%C4%90%C3%A3%20th%C3%AAm%20s%E1%BA%A3n%20ph%E1%BA%A9m%20v%C3%A0o%20gi%E1%BB%8F%20h%C3%A0ng');
  } catch (error) {
    next(error);
  }
});

router.post('/cart/update/:id', checkLogin, checkRole('Customer'), cartQuantityValidation, validateResult, async function(req, res, next) {
  try {
    await shopController.updateCartItem(req.authUser, req.params.id, req.body.quantity);
    res.redirect('/shop/cart?success=%C4%90%C3%A3%20c%E1%BA%ADp%20nh%E1%BA%ADt%20gi%E1%BB%8F%20h%C3%A0ng');
  } catch (error) {
    try {
      const cart = await shopController.getCartDetail(req.authUser);
      res.status(400).render('shop-cart', {
        title: 'Giỏ hàng của bạn',
        cart,
        errorMessage: error.message,
        successMessage: '',
      });
    } catch (renderError) {
      next(renderError);
    }
  }
});

router.post('/cart/apply-code/:id', checkLogin, checkRole('Customer'), async function(req, res, next) {
  try {
    await shopController.applyPromotionCode(req.authUser, req.params.id, req.body.promoCode);
    res.redirect('/shop/cart?success=%C4%90%C3%A3%20%C3%A1p%20m%C3%A3%20khuy%E1%BA%BFn%20m%C3%A3i');
  } catch (error) {
    try {
      const cart = await shopController.getCartDetail(req.authUser);
      res.status(400).render('shop-cart', {
        title: 'Giỏ hàng của bạn',
        cart,
        errorMessage: error.message,
        successMessage: '',
      });
    } catch (renderError) {
      next(renderError);
    }
  }
});

router.post('/cart/clear-code/:id', checkLogin, checkRole('Customer'), async function(req, res, next) {
  try {
    await shopController.clearPromotionCode(req.authUser, req.params.id);
    res.redirect('/shop/cart?success=%C4%90%C3%A3%20g%E1%BB%A1%20m%C3%A3%20khuy%E1%BA%BFn%20m%C3%A3i');
  } catch (error) {
    next(error);
  }
});

router.post('/cart/remove/:id', checkLogin, checkRole('Customer'), async function(req, res, next) {
  try {
    await shopController.removeCartItem(req.authUser, req.params.id);
    res.redirect('/shop/cart?success=%C4%90%C3%A3%20x%C3%B3a%20s%E1%BA%A3n%20ph%E1%BA%A9m%20kh%E1%BB%8Fi%20gi%E1%BB%8F%20h%C3%A0ng');
  } catch (error) {
    next(error);
  }
});

router.post('/checkout', checkLogin, checkRole('Customer'), checkoutValidation, validateResult, async function(req, res, next) {
  try {
    await shopController.checkoutCart(req.authUser, req.body.shippingAddress);
    res.redirect('/shop/orders');
  } catch (error) {
    try {
      const cart = await shopController.getCartDetail(req.authUser);
      res.status(400).render('shop-cart', {
        title: 'Giỏ hàng của bạn',
        cart,
        errorMessage: error.message,
        successMessage: '',
      });
    } catch (renderError) {
      next(renderError);
    }
  }
});

router.get('/orders', checkLogin, checkRole('Customer'), async function(req, res, next) {
  try {
    const orders = await shopController.listCustomerOrders(req.authUser);
    const cartCount = await shopController.getCartCount(req.authUser.id);
    res.render('shop-orders', {
      title: 'Đơn hàng của bạn',
      orders,
      cartCount,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/orders/:id', checkLogin, checkRole('Customer'), async function(req, res, next) {
  try {
    const order = await shopController.findCustomerOrderDetail(req.authUser, req.params.id);
    if (!order) {
      return res.status(404).render('error', {
        title: 'Không tìm thấy',
        message: 'Đơn hàng không tồn tại',
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
