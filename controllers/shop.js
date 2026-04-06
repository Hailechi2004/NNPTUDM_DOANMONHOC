const shopService = require('../services/shopService');

async function getShopHomeData(options) {
  return shopService.getShopHomeData(options);
}

async function getShopProductDetail(id, authUser = null) {
  return shopService.getShopProductDetail(id, authUser);
}

async function getCartCount(userId) {
  return shopService.getCartCount(userId);
}

async function getCartDetail(authUser) {
  return shopService.getCartDetail(authUser);
}

async function addToCart(authUser, partId, quantity = 1) {
  return shopService.addToCart(authUser, partId, quantity);
}

async function updateCartItem(authUser, partId, quantity) {
  return shopService.updateCartItem(authUser, partId, quantity);
}

async function applyPromotionCode(authUser, partId, promoCode) {
  return shopService.applyPromotionCode(authUser, partId, promoCode);
}

async function clearPromotionCode(authUser, partId) {
  return shopService.clearPromotionCode(authUser, partId);
}

async function removeCartItem(authUser, partId) {
  return shopService.removeCartItem(authUser, partId);
}

async function checkoutCart(authUser, shippingAddress) {
  return shopService.checkoutCart(authUser, shippingAddress);
}

async function listCustomerOrders(authUser) {
  return shopService.listCustomerOrders(authUser);
}

async function findCustomerOrderDetail(authUser, orderId) {
  return shopService.findCustomerOrderDetail(authUser, orderId);
}

module.exports = {
  addToCart,
  applyPromotionCode,
  checkoutCart,
  clearPromotionCode,
  findCustomerOrderDetail,
  getCartCount,
  getCartDetail,
  getShopHomeData,
  getShopProductDetail,
  listCustomerOrders,
  removeCartItem,
  updateCartItem,
};
