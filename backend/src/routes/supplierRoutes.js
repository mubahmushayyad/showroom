const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/supplierController');

router.use(protect);

router.get('/', ctrl.getSuppliers);
router.get('/:id', ctrl.getSupplierById);
router.post('/', allowRoles('Super Admin', 'Admin'), ctrl.createSupplier);
router.put('/:id', allowRoles('Super Admin', 'Admin'), ctrl.updateSupplier);
router.delete('/:id', allowRoles('Super Admin'), ctrl.deleteSupplier);

module.exports = router;
