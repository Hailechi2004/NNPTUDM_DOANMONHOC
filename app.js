const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const { attachUserFromToken } = require('./utils/authHandler');
const authRouter = require('./routes/auth-real');
const indexRouter = require('./routes/dashboard-real');
const partsRouter = require('./routes/parts-upload-real');
const ordersRouter = require('./routes/orders-real');
const usersRouter = require('./routes/users-real');
const categoriesRouter = require('./routes/categories-real-live');
const suppliersRouter = require('./routes/suppliers-real');
const promotionsRouter = require('./routes/promotions-real');
const shopRouter = require('./routes/shop-real');

const app = express();

// View engine setup
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
app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/parts', partsRouter);
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/suppliers', suppliersRouter);
app.use('/promotions', promotionsRouter);
app.use('/shop', shopRouter);
app.use('/shop-preview', shopRouter);

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
