const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const METHODS = ['Cash', 'Bank Transfer', 'Card', 'Cheque'];

const Payment = sequelize.define(
  'Payment',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    applicationId: { type: DataTypes.STRING, allowNull: false },
    // The first installment this payment started applying against.
    // A single payment can spill over into more than one installment
    // (see services/financeService.js#applyPaymentToInstallments);
    // this column is informational, the authoritative ledger is the
    // Installment rows' paidAmount.
    installmentId: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    method: { type: DataTypes.ENUM(...METHODS), allowNull: false, defaultValue: 'Cash' },
    reference: { type: DataTypes.STRING, allowNull: true },
    paymentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Completed' },
  },
  { tableName: 'payments' }
);

Payment.METHODS = METHODS;

module.exports = Payment;
