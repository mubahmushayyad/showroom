const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/paymentController');

router.use(protect);

router.get('/', ctrl.getPayments);
router.post('/', allowRoles('Super Admin', 'Admin', 'Manager'), ctrl.createPayment);

module.exports = router;
