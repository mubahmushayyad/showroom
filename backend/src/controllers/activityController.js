const { AuditLog } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// GET /api/activity?limit=100 — Super Admin only (system-wide Audit Log).
const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const rows = await AuditLog.findAll({ order: [['createdAt', 'DESC']], limit });
  return ok(res, rows, 'Activity fetched.');
});

module.exports = { getActivity };
