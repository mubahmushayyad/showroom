const { Notification } = require('../models');
const { genId } = require('../utils/idGenerator');

async function notify(userId, title, message) {
  if (!userId) return null;
  try {
    return await Notification.create({ id: genId('NOT'), userId, title, message, read: false });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
}

module.exports = { notify };
