const authService = require('../services/authService');

async function findUserForAuth(username) {
  return authService.findUserForAuth(username);
}

async function registerCustomer(payload) {
  return authService.registerCustomer(payload);
}

async function loginWithPassword(username, password) {
  return authService.loginWithPassword(username, password);
}

function buildAuthPayload(user) {
  return authService.buildAuthPayload(user);
}

function signToken(user) {
  return authService.signToken(user);
}

module.exports = {
  buildAuthPayload,
  findUserForAuth,
  loginWithPassword,
  registerCustomer,
  signToken,
};
