const { AuditLog } = require('../models');
const { genId } = require('../utils/idGenerator');

// Every important create/update/delete/status-change writes one row
// here (section 9/24 of the guide). `performedBy` is a display-name
// string (the frontend passes `user.name`, or "System" as a fallback)
// rather than requiring a resolvable User — some actions (seeding,
// system jobs) don't have one.
async function logActivity({ userId = null, user = 'System', action, entity, entityId, details, metadata }) {
  try {
    await AuditLog.create({
      id: genId('LOG'),
      userId,
      user,
      action,
      entity,
      entityId,
      details,
      metadata: metadata || null,
    });
  } catch (err) {
    // Auditing must never break the primary request.
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logActivity };
