const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Application-to-Delivery state flow — section 8/20 of the guide.
const APP_STATUS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ASSIGNED',
  'IN_PROCESS',
  'VEHICLE_SELECTED',
  'FINANCE_SETUP',
  'PAYMENT_IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'COMPLETED',
  'OVERDUE',
];

// Section 20 — the only legal "next status" values per current status.
// Enforced server-side regardless of what the client requests.
const STATUS_NEXT = {
  PENDING: ['APPROVED', 'REJECTED', 'PENDING'],
  APPROVED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROCESS'],
  IN_PROCESS: ['VEHICLE_SELECTED', 'REJECTED'],
  VEHICLE_SELECTED: ['FINANCE_SETUP'],
  FINANCE_SETUP: ['PAYMENT_IN_PROGRESS'],
  PAYMENT_IN_PROGRESS: ['READY_FOR_DELIVERY', 'OVERDUE'],
  OVERDUE: ['PAYMENT_IN_PROGRESS', 'READY_FOR_DELIVERY'],
  READY_FOR_DELIVERY: ['COMPLETED'],
  REJECTED: [],
  COMPLETED: [],
};

const Application = sequelize.define(
  'Application',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    // Customer's User.id — named `userId` (not `customerId`) to match
    // the existing frontend payload/contract (pages/customer/ApplyForCar.jsx).
    userId: { type: DataTypes.STRING, allowNull: false },
    managerId: { type: DataTypes.STRING, allowNull: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    cnic: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    carId: { type: DataTypes.STRING, allowNull: true },
    carName: { type: DataTypes.STRING, allowNull: true },
    carImage: { type: DataTypes.STRING, allowNull: true },
    color: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM(...APP_STATUS), allowNull: false, defaultValue: 'PENDING' },
    approvedAt: { type: DataTypes.DATE, allowNull: true },
    remarks: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'applications' }
);

Application.APP_STATUS = APP_STATUS;
Application.STATUS_NEXT = STATUS_NEXT;

module.exports = Application;
