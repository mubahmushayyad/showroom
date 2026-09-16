const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/activityController');

router.use(protect);
router.get('/', allowRoles('Super Admin'), ctrl.getActivity);

module.exports = router;
