const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const { checkActiveUser, checkLogin, guestOnly } = require('../utils/authHandler');
const { loginValidation, registerValidation, validateResult } = require('../utils/validationHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
  });
}

router.post('/register', guestOnly, registerValidation, validateResult, async function register(req, res, next) {
  try {
    const user = await authController.registerCustomer(req.body);
    const token = authController.signToken(user);
    setAuthCookie(res, token);

    return sendSuccess(res, authController.buildAuthPayload(user), 201, 'Registered successfully');
  } catch (error) {
    return next(error);
  }
});

router.post('/login', guestOnly, loginValidation, validateResult, async function login(req, res, next) {
  try {
    const user = await authController.loginWithPassword(req.body.username, req.body.password);
    if (!user) {
      return sendError(res, 401, 'Invalid username/email or password');
    }

    const token = authController.signToken(user);
    setAuthCookie(res, token);
    return sendSuccess(res, authController.buildAuthPayload(user), 200, 'Login successful');
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', checkLogin, function logout(req, res) {
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(0),
  });

  return sendSuccess(res, null, 200, 'Logout successful');
});

router.get('/me', checkActiveUser, function me(req, res) {
  return sendSuccess(res, req.authUser);
});

module.exports = router;
