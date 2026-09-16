const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the JWT issued at POST /api/auth/login, then attaches the
// authenticated (and still-Active) user to req.user. Every protected
// route in this API goes through this — section 14 of the guide:
// "JWT verification in authMiddleware; role enforcement in roleMiddleware."
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new AppError('Not authenticated. Please log in.', 401);

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError('Session expired or invalid token. Please log in again.', 401);
  }

  const user = await User.findByPk(payload.id);
  if (!user) throw new AppError('Account no longer exists.', 401);
  if (user.status !== 'Active') throw new AppError('This account has been deactivated.', 401);

  req.user = user;
  next();
});

module.exports = { protect };
