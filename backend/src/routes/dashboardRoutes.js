const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/dashboardController');

router.use(protect);
router.get('/', ctrl.getDashboard);

module.exports = router;
