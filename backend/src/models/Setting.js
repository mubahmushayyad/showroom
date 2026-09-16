const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Single-row settings table (id is always 1). `data` holds any extra
// preference keys the frontend sends beyond darkMode, so the UI can
// evolve without needing a migration every time.
const Setting = sequelize.define(
  'Setting',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    darkMode: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    data: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  },
  { tableName: 'settings' }
);

module.exports = Setting;
