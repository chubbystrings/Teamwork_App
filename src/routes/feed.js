const express = require('express');

const router = express.Router();

const feedController = require('../controllers/feed');
const Auth = require('../middleware/auth');


router.get('/', Auth.verifyToken, feedController.viewfeeds);


module.exports = router;
