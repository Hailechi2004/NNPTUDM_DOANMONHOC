const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const { guestOnly, checkLogin } = require('../utils/authHandler');
const { loginValidation, registerValidation, validateResult } = require('../utils/validationHandler');

router.get('/login', guestOnly, function(req, res, next) {
  res.render('auth/login', {
    title: 'Đăng nhập',
    errorMessage: req.query.error || '',
    successMessage: req.query.success || '',
    formData: {},
  });
});

router.get('/register', guestOnly, function(req, res, next) {
  res.render('auth/register', {
    title: 'Đăng ký',
    errorMessage: '',
    formData: {},
  });
});

router.post('/register', guestOnly, registerValidation, validateResult, async function(req, res, next) {
  try {
    const user = await authController.registerCustomer(req.body);
    const token = authController.signToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
    res.redirect('/');
  } catch (error) {
    res.status(400).render('auth/register', {
      title: 'Dang ky',
      errorMessage: error.message,
      formData: req.body,
    });
  }
});

router.post('/login', guestOnly, loginValidation, validateResult, async function(req, res, next) {
  try {
    const user = await authController.loginWithPassword(req.body.username, req.body.password);
    if (!user) {
      return res.status(401).render('auth/login', {
        title: 'Đăng nhập',
        errorMessage: 'Thông tin đăng nhập không đúng',
        successMessage: '',
        formData: req.body,
      });
    }

    const token = authController.signToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
    return res.redirect('/');
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', checkLogin, function(req, res, next) {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.redirect('/auth/login?success=Đã%20đăng%20xuất');
});
});

module.exports = router;
