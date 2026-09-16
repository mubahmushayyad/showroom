const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FREQUENCIES = ['Monthly', 'Quarterly'];

// financedAmount / installmentAmount are always calculated and stored
// by the backend (section 18 — "never trust a total computed only in
// React"), never accepted directly from the client.
const FinancePlan = sequelize.define(
  'FinancePlan',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    applicationId: { type: DataTypes.STRING, allowNull: false, unique: true },
    vehicleId: { type: DataTypes.STRING, allowNull: false },
    vehiclePrice: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    downPayment: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    financedAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    frequency: { type: DataTypes.ENUM(...FREQUENCIES), allowNull: false, defaultValue: 'Monthly' },
    installmentAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  },
  { tableName: 'finance_plans' }
);

FinancePlan.FREQUENCIES = FREQUENCIES;

module.exports = FinancePlan;
