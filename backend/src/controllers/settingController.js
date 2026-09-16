const { Setting } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

async function getOrCreateSettings() {
  let row = await Setting.findByPk(1);
  if (!row) row = await Setting.create({ id: 1, darkMode: true, data: {} });
  return row;
}

function flatten(row) {
  return { ...row.data, id: row.id, darkMode: row.darkMode };
}

// GET /api/settings — every authenticated role needs this (AppContext
// fetches it on every login regardless of role).
const getSettings = asyncHandler(async (req, res) => {
  const row = await getOrCreateSettings();
  return ok(res, flatten(row), 'Settings fetched.');
});

// PUT /api/settings — Super Admin only.
const updateSettings = asyncHandler(async (req, res) => {
  const row = await getOrCreateSettings();
  const { darkMode, ...rest } = req.body || {};
  if (darkMode !== undefined) row.darkMode = !!darkMode;
  row.data = { ...row.data, ...rest };
  await row.save();
  return ok(res, flatten(row), 'Settings updated.');
});

module.exports = { getSettings, updateSettings };
