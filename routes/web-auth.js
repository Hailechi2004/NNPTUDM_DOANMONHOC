const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
  });
}

function getRegisterError(body) {
  if (!body.username || !String(body.username).trim()) return 'Tên đăng nhập không được để trống';
  if (!body.fullName || !String(body.fullName).trim()) return 'Họ tên không được để trống';
  if (!body.email || !String(body.email).includes('@')) return 'Email không hợp lệ';
  if (!body.password || String(body.password).length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
  if (body.confirmPassword !== body.password) return 'Xác nhận mật khẩu không khớp';
  return '';
}

router.get('/login', function loginPage(req, res) {
  if (req.authUser) {
    return res.redirect('/');
  }

  return res.render('auth/login', {
    title: 'Đăng nhập',
    errorMessage: req.query.error || '',
    successMessage: req.query.success || '',
    formData: {},
  });
});

router.get('/register', function registerPage(req, res) {
  if (req.authUser) {
    return res.redirect('/');
  }

  return res.render('auth/register', {
    title: 'Đăng ký',
    errorMessage: '',
    formData: {},
  });
});

router.post('/login', async function login(req, res, next) {
  if (req.authUser) {
    return res.redirect('/');
  }

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
    setAuthCookie(res, token);
    return res.redirect('/');
  } catch (error) {
    return next(error);
  }
});

router.post('/register', async function register(req, res, next) {
  if (req.authUser) {
    return res.redirect('/');
  }

  const validationError = getRegisterError(req.body);
  if (validationError) {
    return res.status(400).render('auth/register', {
      title: 'Đăng ký',
      errorMessage: validationError,
      formData: req.body,
    });
  }

  try {
    const user = await authController.registerCustomer(req.body);
    const token = authController.signToken(user);
    setAuthCookie(res, token);
    return res.redirect('/');
  } catch (error) {
    return res.status(400).render('auth/register', {
      title: 'Đăng ký',
      errorMessage: error.message,
      formData: req.body,
    });
  }
});

router.post('/logout', function logout(req, res) {
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(0),
  });

  return res.redirect('/auth/login?success=%C4%90%C3%A3%20%C4%91%C4%83ng%20xu%E1%BA%A5t');
});

module.exports = router;
