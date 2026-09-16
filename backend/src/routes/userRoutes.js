const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { uploadCnic } = require('../middleware/uploadMiddleware');
const ctrl = require('../controllers/userController');

router.use(protect);

// Accepts either JSON or multipart (CNIC front/back) — see
// services/userApi.js's toRequestBody() on the frontend.
const cnicUpload = uploadCnic.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
]);
// If the request isn't multipart, multer just passes through — this
// small wrapper prevents it throwing on plain JSON bodies.
function maybeMultipart(req, res, next) {
  const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');
  if (!isMultipart) return next();
  return cnicUpload(req, res, next);
}

router.get('/', ctrl.getUsers);
router.get('/:id', ctrl.getUserById);
router.get('/:id/cnic-front', ctrl.getCnicFront);
router.get('/:id/cnic-back', ctrl.getCnicBack);

router.post('/', allowRoles('Super Admin'), maybeMultipart, ctrl.createUser);
router.put('/:id', allowRoles('Super Admin'), maybeMultipart, ctrl.updateUser);
router.delete('/:id', allowRoles('Super Admin'), ctrl.deleteUser);

module.exports = router;
