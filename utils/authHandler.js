const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'HUTECH';

function getTokenFromRequest(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

function attachUserFromToken(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.locals.authUser = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.authUser = payload;
    res.locals.authUser = payload;
  } catch (error) {
    req.authUser = null;
    res.locals.authUser = null;
  }

  return next();
}

function isHtmlRequest(req) {
  const accept = req.headers.accept || '';
  return accept.includes('text/html');
}

function checkLogin(req, res, next) {
  if (req.authUser) {
    return next();
  }

  if (isHtmlRequest(req)) {
    return res.redirect('/auth/login');
  }

  return res.status(401).send({
    message: 'Ban chua dang nhap',
  });
}

function checkRole(...requiredRoles) {
  return function roleMiddleware(req, res, next) {
    const currentRole = req.authUser && req.authUser.role;
    if (requiredRoles.includes(currentRole)) {
      return next();
    }

    if (isHtmlRequest(req)) {
      return res.status(403).render('error', {
        title: 'Forbidden',
        message: 'Ban khong co quyen truy cap trang nay',
        error: {},
      });
    }

    return res.status(403).send({
      message: 'Ban khong co quyen',
    });
  };
}

function guestOnly(req, res, next) {
  if (req.authUser) {
    return res.redirect('/');
  }
  return next();
}

module.exports = {
  attachUserFromToken,
  checkLogin,
  checkRole,
  getTokenFromRequest,
  guestOnly,
};
