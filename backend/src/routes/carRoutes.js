const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { uploadCarImages } = require('../middleware/uploadMiddleware');
const ctrl = require('../controllers/carController');

router.use(protect);

router.get('/', ctrl.getCars);
router.get('/:id', ctrl.getCarById);

router.post('/upload-images', allowRoles('Super Admin', 'Admin'), uploadCarImages.array('images', 10), ctrl.uploadImages);
router.post('/', allowRoles('Super Admin', 'Admin'), ctrl.createCar);
router.put('/:id', allowRoles('Super Admin', 'Admin'), ctrl.updateCar);
router.delete('/:id', allowRoles('Super Admin'), ctrl.deleteCar);

module.exports = router;
