const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Supplier = sequelize.define(
  'Supplier',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    company: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    cnic: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: 'suppliers' }
);

module.exports = Supplier;
