const userService = require('../services/userService');

async function listUsers() {
  return userService.listUsers();
}

async function findUserById(id) {
  return userService.findUserById(id);
}

async function createUser(payload) {
  return userService.createUser(payload);
}

async function updateUser(id, payload) {
  return userService.updateUser(id, payload);
}

async function deleteUser(id) {
  return userService.deleteUser(id);
}

module.exports = {
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  updateUser,
};
