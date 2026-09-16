const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { genId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityService');
const { sanitizeUser } = require('./authController');
const { cnicDir } = require('../middleware/uploadMiddleware');

function randomPassword() {
  // Readable-enough temp password, e.g. "Udevs-7f3a2c91"
  return `Udevs-${Math.random().toString(36).slice(2, 10)}`;
}

function relFilePath(file) {
  return file ? `/uploads/cnic/${file.filename}` : undefined;
}

// GET /api/users — every authenticated role needs this (Manager/Customer
// screens resolve manager & assigned-user names client-side), so it's
// open to all roles but always sanitized: no password hashes, ever.
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  return ok(res, users.map(sanitizeUser), 'Users fetched.');
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  return ok(res, sanitizeUser(user), 'User fetched.');
});

// POST /api/users — Super Admin only (section 4/19). Accepts JSON or
// multipart (CNIC front/back uploads) — see services/userApi.js on the
// frontend for the exact multipart field names ("cnicFront"/"cnicBack").
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, name, email, phone, cnic, role, status } = req.body;
  const displayName = name || `${firstName || ''} ${lastName || ''}`.trim();

  if (!displayName) throw new AppError('Name is required.', 400, [{ field: 'name', message: 'Required' }]);
  if (!email) throw new AppError('Email is required.', 400, [{ field: 'email', message: 'Required' }]);
  if (!role || !User.ROLES.includes(role)) {
    throw new AppError('A valid role is required.', 400, [{ field: 'role', message: 'Required' }]);
  }

  const existing = await User.findOne({ where: { email: String(email).toLowerCase().trim() } });
  if (existing) throw new AppError('A user with this email already exists.', 409, [{ field: 'email', message: 'Already in use' }]);

  const plainPassword = req.body.password || randomPassword();
  const hashed = await bcrypt.hash(plainPassword, 10);

  const files = req.files || {};
  const cnicFront = files.cnicFront?.[0] ? relFilePath(files.cnicFront[0]) : undefined;
  const cnicBack = files.cnicBack?.[0] ? relFilePath(files.cnicBack[0]) : undefined;

  const user = await User.create({
    id: genId('USR'),
    firstName: firstName || null,
    lastName: lastName || null,
    name: displayName,
    email: String(email).toLowerCase().trim(),
    password: hashed,
    phone: phone || null,
    cnic: cnic || null,
    cnicFront,
    cnicBack,
    role,
    status: status || 'Active',
  });

  await logActivity({
    userId: req.user.id,
    user: req.user.name,
    action: 'CREATE',
    entity: 'User',
    entityId: user.id,
    details: `Registered ${role} account for ${displayName} (${email}).`,
  });

  const responseData = { ...sanitizeUser(user), tempPassword: req.body.password ? undefined : plainPassword };
  return created(res, responseData, 'User registered successfully.');
});

// PUT /api/users/:id — Super Admin only.
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('User not found.', 404);

  const { firstName, lastName, name, email, phone, cnic, role, status, password } = req.body;

  if (email && email.toLowerCase().trim() !== user.email) {
    const clash = await User.findOne({ where: { email: String(email).toLowerCase().trim() } });
    if (clash) throw new AppError('A user with this email already exists.', 409);
    user.email = String(email).toLowerCase().trim();
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  user.name = name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name;
  if (phone !== undefined) user.phone = phone;
  if (cnic !== undefined) user.cnic = cnic;
  if (role !== undefined) {
    if (!User.ROLES.includes(role)) throw new AppError('Invalid role.', 400);
    user.role = role;
  }
  if (status !== undefined) user.status = status;
  if (password) user.password = await bcrypt.hash(password, 10);

  const files = req.files || {};
  if (files.cnicFront?.[0]) {
    if (user.cnicFront) safeUnlink(user.cnicFront);
    user.cnicFront = relFilePath(files.cnicFront[0]);
  }
  if (files.cnicBack?.[0]) {
    if (user.cnicBack) safeUnlink(user.cnicBack);
    user.cnicBack = relFilePath(files.cnicBack[0]);
  }

  await user.save();

  await logActivity({
    userId: req.user.id,
    user: req.user.name,
    action: 'UPDATE',
    entity: 'User',
    entityId: user.id,
    details: `Updated user ${user.name}.`,
  });

  return ok(res, sanitizeUser(user), 'User updated.');
});

// DELETE /api/users/:id — Super Admin only.
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.id === req.user.id) throw new AppError('You cannot delete your own account.', 400);

  if (user.cnicFront) safeUnlink(user.cnicFront);
  if (user.cnicBack) safeUnlink(user.cnicBack);
  await user.destroy();

  await logActivity({
    userId: req.user.id,
    user: req.user.name,
    action: 'DELETE',
    entity: 'User',
    entityId: user.id,
    details: `Deleted user ${user.name}.`,
  });

  return ok(res, { id: req.params.id }, 'User deleted.');
});

// GET /api/users/:id/cnic-front, /cnic-back — CNIC files are sensitive
// (section 14/19/26): only Super Admin, or the user themself, may view
// them, and they're never exposed as public static files.
const getCnicFile = (side) =>
  asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found.', 404);

    const isSelf = req.user.id === user.id;
    const isSuperAdmin = req.user.role === 'Super Admin';
    if (!isSelf && !isSuperAdmin) throw new AppError('Not authorized to view this document.', 403);

    const stored = side === 'front' ? user.cnicFront : user.cnicBack;
    if (!stored) throw new AppError('No file on record.', 404);

    const filePath = path.join(cnicDir, path.basename(stored));
    if (!fs.existsSync(filePath)) throw new AppError('File not found on server.', 404);
    return res.sendFile(filePath);
  });

function safeUnlink(storedPath) {
  try {
    const filePath = path.join(cnicDir, path.basename(storedPath));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    /* non-fatal */
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCnicFront: getCnicFile('front'),
  getCnicBack: getCnicFile('back'),
};
