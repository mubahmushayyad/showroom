const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const app = require('../controllers/applicationController');
const finance = require('../controllers/financeController');
const installments = require('../controllers/installmentController');

router.use(protect);

// Role-scoped list/detail — filtering happens inside the controller
// (Manager -> managerId=self, Customer -> userId=self).
router.get('/', app.getApplications);
router.get('/user/:userId', app.getApplicationsByUser);
router.get('/:id', app.getApplicationById);

router.post('/', allowRoles('Customer', 'Super Admin'), app.createApplication);

router.patch('/:id/status', allowRoles('Super Admin', 'Manager'), app.updateStatus);
router.patch('/:id/assign-manager', allowRoles('Super Admin'), app.assignManager);
router.patch('/:id/select-vehicle', allowRoles('Super Admin', 'Manager'), app.selectVehicle);

router.post('/:id/finance', allowRoles('Super Admin', 'Manager'), finance.createFinancePlan);
router.get('/:id/finance', finance.getFinancePlan);
router.get('/:id/installments', installments.getInstallments);

module.exports = router;
