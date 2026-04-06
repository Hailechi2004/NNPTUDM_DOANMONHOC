const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { sendSuccess } = require('../utils/apiResponse');

router.get('/', checkLogin, checkActiveUser, checkRole('Admin', 'Staff'), async function dashboard(req, res, next) {
  try {
    const dashboard = await dashboardController.getDashboardData();
    return sendSuccess(res, dashboard);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
