const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/customerController');

router.use(protect);

router.get('/', ctrl.getCustomers);
router.get('/:id', ctrl.getCustomerById);
router.post('/', allowRoles('Super Admin', 'Admin'), ctrl.createCustomer);
router.put('/:id', allowRoles('Super Admin', 'Admin'), ctrl.updateCustomer);
router.delete('/:id', allowRoles('Super Admin'), ctrl.deleteCustomer);

module.exports = router;
