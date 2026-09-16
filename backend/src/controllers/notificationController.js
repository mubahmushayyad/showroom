const { Notification } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

const getByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const isSelf = req.user.id === userId;
  const isStaff = ['Super Admin', 'Admin'].includes(req.user.role);
  if (!isSelf && !isStaff) throw new AppError('Not authorized.', 403);

  const notifications = await Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  return ok(res, notifications, 'Notifications fetched.');
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) throw new AppError('Notification not found.', 404);
  if (notification.userId !== req.user.id && req.user.role !== 'Super Admin') {
    throw new AppError('Not authorized.', 403);
  }

  notification.read = true;
  await notification.save();
  return ok(res, notification, 'Notification marked as read.');
});

module.exports = { getByUser, markRead };
