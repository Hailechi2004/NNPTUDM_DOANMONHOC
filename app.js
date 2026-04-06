const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const { attachUserFromToken } = require('./utils/authHandler');
const { sendError } = require('./utils/apiResponse');
const webRouter = require('./routes/web');
const webAuthRouter = require('./routes/web-auth');
const webAdminRouter = require('./routes/web-admin');
const webShopRouter = require('./routes/web-shop');
const authRouter = require('./routes/auth-api');
const dashboardRouter = require('./routes/dashboard-api');
const partsRouter = require('./routes/parts-upload');
const ordersRouter = require('./routes/orders-api');
const usersRouter = require('./routes/users-api');
const categoriesRouter = require('./routes/categories-api');
const suppliersRouter = require('./routes/suppliers-api');
const promotionsRouter = require('./routes/promotions-api');
const shopRouter = require('./routes/shop-api');

const app = express();

function isApiRequest(req) {
  return req.originalUrl === '/api' || req.originalUrl.startsWith('/api/');
}

app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(attachUserFromToken);
app.use(express.static(path.join(__dirname, 'resources/static')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', webAuthRouter);
app.use('/', webShopRouter);
app.use('/', webRouter);
app.use('/', webAdminRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/parts', partsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api', shopRouter);

app.use(function notFound(req, res, next) {
  const err = new Error('Resource not found');
  err.status = 404;
  return next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }

  if (!isApiRequest(req) && (req.headers.accept || '').includes('text/html')) {
    return res.status(status).render('error', {
      title: 'Lỗi',
      message: err.message || 'Internal server error',
      status,
      error: req.app.get('env') === 'development' ? err : {},
    });
  }

  return sendError(
    res,
    status,
    err.message || 'Internal server error',
    req.app.get('env') === 'development' && status >= 500
      ? { stack: err.stack }
      : null
  );
});

module.exports = app;
