const express = require('express');
const router = express.Router();

const promotionController = require('../controllers/promotions');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');

router.get('/', async function listPromotions(req, res, next) {
  try {
    const promotions = await promotionController.listPromotions();
    return sendSuccess(res, promotions);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async function getPromotion(req, res, next) {
  try {
    const promotion = await promotionController.findPromotionById(req.params.id);
    if (!promotion) {
      return sendError(res, 404, 'Promotion not found');
    }

    return sendSuccess(res, promotion);
  } catch (error) {
    return next(error);
  }
});

router.post('/', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function createPromotion(req, res, next) {
  try {
    const promotion = await promotionController.createPromotion(req.body);
    return sendSuccess(res, promotion, 201, 'Promotion created');
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function updatePromotion(req, res, next) {
  try {
    const promotion = await promotionController.updatePromotion(req.params.id, req.body);
    if (!promotion) {
      return sendError(res, 404, 'Promotion not found');
    }

    return sendSuccess(res, promotion, 200, 'Promotion updated');
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function deletePromotion(req, res, next) {
  try {
    const deleted = await promotionController.deletePromotion(req.params.id);
    if (!deleted) {
      return sendError(res, 404, 'Promotion not found');
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
