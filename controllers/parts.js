const partService = require('../services/partService');

function getPromotionState(price, discountPrice, hasPromotion) {
  return partService.getPromotionState(price, discountPrice, hasPromotion);
}

function normalizePartPayload(payload) {
  return partService.normalizePartPayload(payload);
}

function calculatePromotionPrice(price, promotion) {
  return partService.calculatePromotionPrice(price, promotion);
}

async function listParts(filters = {}) {
  return partService.listParts(filters);
}

async function findPartById(id) {
  return partService.findPartById(id);
}

async function findPromotionForPart(partId) {
  return partService.findPromotionForPart(partId);
}

async function createPart(payload) {
  return partService.createPart(payload);
}

async function updatePart(id, payload) {
  return partService.updatePart(id, payload);
}

async function deletePart(id) {
  return partService.deletePart(id);
}

async function getPartFormOptions() {
  return partService.getPartFormOptions();
}

module.exports = {
  calculatePromotionPrice,
  createPart,
  deletePart,
  findPartById,
  findPromotionForPart,
  getPromotionState,
  getPartFormOptions,
  listParts,
  normalizePartPayload,
  updatePart,
};
