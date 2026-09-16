const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/settingController');

router.use(protect);
router.get('/', ctrl.getSettings);
router.put('/', allowRoles('Super Admin'), ctrl.updateSettings);

module.exports = router;
