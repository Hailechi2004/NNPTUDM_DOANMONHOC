const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('username').trim().notEmpty().withMessage('Tên đăng nhập không được để trống'),
  body('fullName').trim().notEmpty().withMessage('Họ tên không được để trống'),
  body('email').trim().isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Xác nhận mật khẩu không khớp'),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Vui lòng nhập tên đăng nhập hoặc email'),
  body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
];

const cartQuantityValidation = [
  body('quantity')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Số lượng phải lớn hơn 0'),
];

const checkoutValidation = [
  body('shippingAddress')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập địa chỉ giao hàng'),
];

function validateResult(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array();
  const firstMessage = errors[0] ? errors[0].msg : 'Dữ liệu không hợp lệ';

  if ((req.headers.accept || '').includes('text/html')) {
    const viewName = req.path.includes('register') ? 'auth/register' : 'auth/login';
    return res.status(400).render(viewName, {
      title: viewName.includes('register') ? 'Đăng ký' : 'Đăng nhập',
      errorMessage: firstMessage,
      formData: req.body,
    });
  }

  return res.status(400).send({
    message: firstMessage,
    errors,
  });
}

module.exports = {
  cartQuantityValidation,
  checkoutValidation,
  loginValidation,
  registerValidation,
  validateResult,
};
