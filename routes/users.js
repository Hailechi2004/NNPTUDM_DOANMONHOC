const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

// Mock data for users
let users = [
  { id: 1, username: 'admin', fullName: 'Admin HUTECH', email: 'admin@hutech.edu.vn', role: 'Admin', status: 'Active' },
  { id: 2, username: 'staff01', fullName: 'Nguyễn Văn Nhân Viên', email: 'staff01@hutech.edu.vn', role: 'Staff', status: 'Active' },
  { id: 3, username: 'customer01', fullName: 'Lê Văn Khách', email: 'customer01@gmail.com', role: 'Customer', status: 'Active' },
];

router.get('/', function(req, res, next) {
  return res.render('user-management', {
    title: 'Nguoi dung',
    users: userController.listUsers(),
  });
  res.render('user-management', { title: 'Người dùng', users: users });
});

router.get('/add', function(req, res, next) {
  if (req.query.username) {
    userController.createUser(req.query);
    return res.redirect('/users');
  }

  return res.render('user-form', {
    title: 'Them nguoi dung moi',
    user: {},
    action: '/users/add',
  });
  if (req.query.username) {
    const newUser = {
      id: users.length + 1,
      username: req.query.username,
      fullName: req.query.fullName,
      email: req.query.email,
      role: req.query.role,
      status: req.query.status
    };
    users.push(newUser);
    return res.redirect('/users');
  }
  res.render('user-form', { title: 'Thêm người dùng mới', user: {}, action: '/users/add' });
});

router.get('/edit/:id', function(req, res, next) {
  const managedUser = userController.findUserById(req.params.id);
  if (!managedUser) {
    return res.status(404).render('error', { message: 'User not found', error: {} });
  }

  if (req.query.username) {
    userController.updateUser(req.params.id, req.query);
    return res.redirect('/users');
  }

  return res.render('user-form', {
    title: 'Chinh sua nguoi dung',
    user: managedUser,
    action: `/users/edit/${req.params.id}`,
  });
  const id = req.params.id;
  const user = users.find(u => u.id == id);
  
  if (req.query.username) {
    user.username = req.query.username;
    user.fullName = req.query.fullName;
    user.email = req.query.email;
    user.role = req.query.role;
    user.status = req.query.status;
    return res.redirect('/users');
  }
  
  res.render('user-form', { title: 'Chỉnh sửa người dùng', user: user, action: '/users/edit/' + id });
});

router.get('/delete/:id', function(req, res, next) {
  userController.deleteUser(req.params.id);
  return res.redirect('/users');
  users = users.filter(u => u.id != req.params.id);
  res.redirect('/users');
});

module.exports = router;
