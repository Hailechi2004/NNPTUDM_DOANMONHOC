const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { cartQuantityValidation, checkoutValidation, validateResult } = require('../utils/validationHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');

router.get('/shop/products', async function listProducts(req, res, next) {
  try {
    const shopData = await shopController.getShopHomeData({
      query: req.query,
      authUser: req.authUser || null,
      isPreviewMode: false,
      currentPath: '/api/shop/products',
    });

    return sendSuccess(res, {
      items: shopData.parts,
      categories: shopData.categories,
      cartCount: shopData.cartCount,
      filters: {
        categoryId: shopData.currentCategoryId,
        search: shopData.currentSearch,
        sort: shopData.currentSort,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/shop/products/:id', async function getProduct(req, res, next) {
  try {
    const product = await shopController.getShopProductDetail(req.params.id, req.authUser || null);
    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    return sendSuccess(res, product);
  } catch (error) {
    return next(error);
  }
});

router.get('/cart', checkLogin, checkActiveUser, checkRole('Customer'), async function getCart(req, res, next) {
  try {
    const cart = await shopController.getCartDetail(req.authUser);
    return sendSuccess(res, cart);
  } catch (error) {
    return next(error);
  }
});

router.post('/cart/items', checkLogin, checkActiveUser, checkRole('Customer'), cartQuantityValidation, validateResult, async function addItem(req, res, next) {
  try {
    const cart = await shopController.addToCart(req.authUser, req.body.partId, req.body.quantity || 1);
    return sendSuccess(res, cart, 201, 'Cart item created');
  } catch (error) {
    return next(error);
  }
});

router.patch('/cart/items/:partId', checkLogin, checkActiveUser, checkRole('Customer'), cartQuantityValidation, validateResult, async function updateItem(req, res, next) {
  try {
    const cart = await shopController.updateCartItem(req.authUser, req.params.partId, req.body.quantity);
    return sendSuccess(res, cart, 200, 'Cart item updated');
  } catch (error) {
    return next(error);
  }
});

router.delete('/cart/items/:partId', checkLogin, checkActiveUser, checkRole('Customer'), async function removeItem(req, res, next) {
  try {
    const cart = await shopController.removeCartItem(req.authUser, req.params.partId);
    return sendSuccess(res, cart, 200, 'Cart item removed');
  } catch (error) {
    return next(error);
  }
});

router.post('/cart/items/:partId/promotion', checkLogin, checkActiveUser, checkRole('Customer'), async function applyPromotion(req, res, next) {
  try {
    const cart = await shopController.applyPromotionCode(req.authUser, req.params.partId, req.body.promoCode);
    return sendSuccess(res, cart, 200, 'Promotion applied');
  } catch (error) {
    return next(error);
  }
});

router.delete('/cart/items/:partId/promotion', checkLogin, checkActiveUser, checkRole('Customer'), async function clearPromotion(req, res, next) {
  try {
    const cart = await shopController.clearPromotionCode(req.authUser, req.params.partId);
    return sendSuccess(res, cart, 200, 'Promotion removed');
  } catch (error) {
    return next(error);
  }
});

router.post('/orders/checkout', checkLogin, checkActiveUser, checkRole('Customer'), checkoutValidation, validateResult, async function checkout(req, res, next) {
  try {
    const orderId = await shopController.checkoutCart(req.authUser, req.body.shippingAddress);
    const order = await shopController.findCustomerOrderDetail(req.authUser, orderId);
    return sendSuccess(res, order, 201, 'Order created');
  } catch (error) {
    return next(error);
  }
});

router.get('/my/orders', checkLogin, checkActiveUser, checkRole('Customer'), async function myOrders(req, res, next) {
  try {
    const orders = await shopController.listCustomerOrders(req.authUser);
    return sendSuccess(res, orders);
  } catch (error) {
    return next(error);
  }
});

router.get('/my/orders/:id', checkLogin, checkActiveUser, checkRole('Customer'), async function myOrderDetail(req, res, next) {
  try {
    const order = await shopController.findCustomerOrderDetail(req.authUser, req.params.id);
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    return sendSuccess(res, order);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
