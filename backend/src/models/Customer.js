const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Distinct "customer profile" record, linked back to the User account
// where possible (section 19 of the guide: "reference the User record
// where possible instead of duplicating identity information").
const Customer = sequelize.define(
  'Customer',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING, allowNull: true },
    cnic: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'customers' }
);

module.exports = Customer;
