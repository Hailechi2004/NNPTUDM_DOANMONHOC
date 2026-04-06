const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');
const { checkActiveUser, checkLogin, checkRole } = require('../utils/authHandler');
const { sendError, sendSuccess } = require('../utils/apiResponse');

router.use(checkLogin, checkActiveUser, checkRole('Admin'));

router.get('/', async function listUsers(req, res, next) {
  try {
    const users = await userController.listUsers();
    return sendSuccess(res, users);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async function getUser(req, res, next) {
  try {
    const user = await userController.findUserById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, user);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async function createUser(req, res, next) {
  try {
    const user = await userController.createUser(req.body);
    return sendSuccess(res, user, 201, 'User created');
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async function updateUser(req, res, next) {
  try {
    const user = await userController.updateUser(req.params.id, req.body);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, user, 200, 'User updated');
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async function deleteUser(req, res, next) {
  try {
    const deleted = await userController.deleteUser(req.params.id);
    if (!deleted) {
      return sendError(res, 404, 'User not found');
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
