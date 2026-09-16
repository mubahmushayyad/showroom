const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Login rate limiting (section 14 — "login rate limiting").
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.', data: null, errors: null },
});

router.post('/login', loginLimiter, login);
router.get('/me', protect, me);

module.exports = router;
