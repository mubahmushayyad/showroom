const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

const uploadRoot = path.join(process.cwd(), env.UPLOAD_DIR);
const cnicDir = path.join(uploadRoot, 'cnic');
const carsDir = path.join(uploadRoot, 'cars');
[uploadRoot, cnicDir, carsDir].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

function makeStorage(dir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
}

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isImage = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  cb(isImage ? null : new Error('Only image files are allowed.'), isImage);
};

const cnicFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error('CNIC files must be an image or PDF.'), ok);
};

// CNIC front/back — section 19/14/26: identity documents are sensitive,
// never exposed as public static files (see userController.getCnicFile).
const uploadCnic = multer({
  storage: makeStorage(cnicDir),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: cnicFileFilter,
});

// Car catalog photos — fine to serve publicly/statically.
const uploadCarImages = multer({
  storage: makeStorage(carsDir),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: imageFileFilter,
});

module.exports = { uploadCnic, uploadCarImages, uploadRoot, cnicDir, carsDir };
