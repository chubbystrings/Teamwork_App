const multer = require('multer');


const storage = multer.diskStorage({
  filename(req, file, cb) {
    cb(null, file.originalname);
  },

});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(gif|jpg|png)$/)) {
      return cb(new Error('please upload a gif file'));
    }
    return cb(undefined, true);
  },
  storage,
}).single('image');

module.exports = upload;
