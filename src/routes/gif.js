
const express = require('express');

const router = express.Router();
const commentsController = require('../controllers/comments');
const gifController = require('../controllers/gifs');
const Auth = require('../middleware/auth');
const multerUploads = require('../middleware/multer');
// const playground = require('../controllers/playground')


router.post('/', Auth.verifyToken, multerUploads, gifController.uploadGif, (error, req, res, next) => {
  if (error) {
    const { message } = error;
    return res.status(400).send({ status: 'error', error: message });
  }
  next();
  return res.send();
});
router.post('/:gifid/comment', Auth.verifyToken, commentsController.postGifComments);
router.get('/:gifid/comment', Auth.verifyToken, gifController.viewGifById);
router.get('/', Auth.verifyToken, gifController.viewAllGif);
router.get('/my-gif', Auth.verifyToken, gifController.viewGif);
router.delete('/:gifid', Auth.verifyToken, gifController.deleteGif);


module.exports = router;
