const express = require('express');

const router = express.Router();
const userController = require('../controllers/user');
const Auth = require('../middleware/auth');
const Admin = require('../middleware/isAdmin');


// Routes for users
router.post('/create-user', Admin.verifyAdminToken, userController.addUser);
router.post('/signin', userController.loginUser);
router.post('/logout', Auth.verifyToken, userController.logoutUser);
router.get('/me', Auth.verifyToken, userController.getUser);

module.exports = router;
