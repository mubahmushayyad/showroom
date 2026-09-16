const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue'];

const Installment = sequelize.define(
  'Installment',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    financePlanId: { type: DataTypes.STRING, allowNull: false },
    seq: { type: DataTypes.INTEGER, allowNull: false },
    dueDate: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    paidAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: 'Pending' },
  },
  { tableName: 'installments' }
);

Installment.STATUSES = STATUSES;

module.exports = Installment;
