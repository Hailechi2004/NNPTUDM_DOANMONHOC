const { body, validationResult } = require('express-validator');
const { sendError } = require('./apiResponse');

const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password confirmation does not match'),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const cartQuantityValidation = [
  body('quantity')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Quantity must be greater than 0'),
];

const checkoutValidation = [
  body('shippingAddress')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required'),
];

function validateResult(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array();
  const firstMessage = errors[0] ? errors[0].msg : 'Invalid request data';
  return sendError(res, 400, firstMessage, errors);
}

module.exports = {
  cartQuantityValidation,
  checkoutValidation,
  loginValidation,
  registerValidation,
  validateResult,
};
