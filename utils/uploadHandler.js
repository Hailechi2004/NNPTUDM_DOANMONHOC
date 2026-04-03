const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadPath = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function filename(req, file, cb) {
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const safeBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '-');
    cb(null, `${Date.now()}-${safeBasename}${extension}`);
  },
});

const uploadImage = multer({ storage });
const uploadExcel = multer({ storage });

module.exports = {
  uploadExcel,
  uploadImage,
  uploadPath,
};
