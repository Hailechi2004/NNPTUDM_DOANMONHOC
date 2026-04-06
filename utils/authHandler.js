const jwt = require('jsonwebtoken');
const { sendError } = require('./apiResponse');

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

  return sendError(res, 401, 'Authentication required');
}

function checkRole(...requiredRoles) {
  return function roleMiddleware(req, res, next) {
    const currentRole = req.authUser && req.authUser.role;
    if (requiredRoles.includes(currentRole)) {
      return next();
    }

    return sendError(res, 403, 'Forbidden');
  };
}

function guestOnly(req, res, next) {
  if (req.authUser) {
    return sendError(res, 400, 'You are already authenticated');
  }
  return next();
}

function checkActiveUser(req, res, next) {
  if (!req.authUser) {
    return sendError(res, 401, 'Authentication required');
  }

  if (req.authUser.status && req.authUser.status !== 'Active') {
    return sendError(res, 403, 'Account is inactive');
  }

  return next();
}

module.exports = {
  attachUserFromToken,
  checkActiveUser,
  checkLogin,
  checkRole,
  getTokenFromRequest,
  guestOnly,
};
