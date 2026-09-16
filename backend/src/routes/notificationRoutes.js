const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notificationController');

router.use(protect);

router.get('/user/:userId', ctrl.getByUser);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;
