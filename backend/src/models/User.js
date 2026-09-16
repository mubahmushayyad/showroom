const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Core Roles — section 2 of the guide: Super Admin -> Admin -> Manager -> Customer.
const ROLES = ['Super Admin', 'Admin', 'Manager', 'Customer'];

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    // Kept alongside firstName/lastName — the rest of the app (audit
    // logs, application workflow screens, managerName() lookups, etc.)
    // reads/writes the combined display name.
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false }, // bcrypt hash
    phone: { type: DataTypes.STRING, allowNull: true },
    cnic: { type: DataTypes.STRING, allowNull: true },
    cnicFront: { type: DataTypes.STRING, allowNull: true }, // stored file path
    cnicBack: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM(...ROLES), allowNull: false, defaultValue: 'Customer' },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
  },
  {
    tableName: 'users',
    indexes: [{ unique: true, fields: ['email'] }],
  }
);

User.ROLES = ROLES;

module.exports = User;
