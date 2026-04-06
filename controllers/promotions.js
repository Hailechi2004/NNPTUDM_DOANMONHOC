const promotionService = require('../services/promotionService');

async function listPromotions() {
  return promotionService.listPromotions();
}

async function findPromotionById(id) {
  return promotionService.findPromotionById(id);
}

async function createPromotion(payload) {
  return promotionService.createPromotion(payload);
}

async function updatePromotion(id, payload) {
  return promotionService.updatePromotion(id, payload);
}

async function listActivePromotions() {
  return promotionService.listActivePromotions();
}

async function deletePromotion(id) {
  return promotionService.deletePromotion(id);
}

module.exports = {
  createPromotion,
  deletePromotion,
  findPromotionById,
  listActivePromotions,
  listPromotions,
  updatePromotion,
};
