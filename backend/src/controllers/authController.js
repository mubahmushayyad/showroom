const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function sanitizeUser(user) {
  const u = user.toJSON ? user.toJSON() : user;
  delete u.password;
  return u;
}

// POST /api/auth/login — public. bcrypt-compares the password, issues
// a JWT (section 14 of the guide).
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required.', 400);

  const user = await User.findOne({ where: { email: String(email).toLowerCase().trim() } });
  if (!user) throw new AppError('Invalid email or password.', 401);

  if (user.status !== 'Active') throw new AppError('This account has been deactivated.', 403);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid email or password.', 401);

  const token = signToken(user);
  return ok(res, { token, user: sanitizeUser(user) }, 'Logged in successfully.');
});

// GET /api/auth/me — used to restore a session on page refresh.
const me = asyncHandler(async (req, res) => {
  return ok(res, sanitizeUser(req.user), 'Current user.');
});

module.exports = { login, me, sanitizeUser, signToken };
