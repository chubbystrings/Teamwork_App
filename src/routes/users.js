const express = require('express');

const router = express.Router();
const userController = require('../controllers/user');
const Auth = require('../middleware/auth');
const Admin = require('../middleware/isAdmin');


// Routes for users
router.post('/create-user', Admin.verifyAdminToken, userController.addUser);
router.post('/signin', userController.loginUser);
router.post('/logout', Auth.verifyToken, userController.logoutUser);
router.patch('/users/user/isactive', Admin.verifyAdminToken, userController.isActive);
router.patch('/darkmode', Auth.verifyToken, userController.darkMode);
router.get('/users', Admin.verifyAdminToken, userController.getAllUsers);
router.get('/me', Auth.verifyToken, userController.getUser);
router.delete('/users/user/:userid', Auth.verifyToken, userController.deleteUser);
router.delete('/users/deletemany', Auth.verifyToken, userController.deleteMany);

module.exports = router;
