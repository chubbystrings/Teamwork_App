const express = require('express');

const router = express.Router();

const feedController = require('../controllers/feed');
const Auth = require('../middleware/auth');


router.get('/', Auth.verifyToken, feedController.viewfeeds);
router.post('/like/:postid', Auth.verifyToken, feedController.likePost);
router.delete('/like/:postid', Auth.verifyToken, feedController.unlikePost);


module.exports = router;
