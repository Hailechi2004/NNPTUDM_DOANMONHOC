const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');
const { checkLogin, checkRole } = require('../utils/authHandler');

router.get('/', checkLogin, checkRole('Admin'), async function(req, res, next) {
  try {
    const users = await userController.listUsers();
    res.render('user-management-vi', {
      title: 'Người dùng',
      users,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
