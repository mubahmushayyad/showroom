const sequelize = require('../config/db');

const User = require('./User');
const Vehicle = require('./Vehicle');
const Supplier = require('./Supplier');
const Customer = require('./Customer');
const Application = require('./Application');
const FinancePlan = require('./FinancePlan');
const Installment = require('./Installment');
const Payment = require('./Payment');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const Setting = require('./Setting');

// ── User <-> Application (section 10 Sequelize association concept) ──
User.hasMany(Application, { foreignKey: 'userId', as: 'customerApplications' });
Application.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

User.hasMany(Application, { foreignKey: 'managerId', as: 'managedApplications' });
Application.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// ── Application <-> FinancePlan ──
Application.hasOne(FinancePlan, { foreignKey: 'applicationId', as: 'financePlan' });
FinancePlan.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

// ── Vehicle <-> FinancePlan / Application / Supplier ──
Vehicle.hasMany(FinancePlan, { foreignKey: 'vehicleId', as: 'financePlans' });
FinancePlan.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Vehicle.hasMany(Application, { foreignKey: 'carId', as: 'applications' });
Application.belongsTo(Vehicle, { foreignKey: 'carId', as: 'vehicle' });

Supplier.hasMany(Vehicle, { foreignKey: 'supplierId', as: 'vehicles' });
Vehicle.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

// ── FinancePlan <-> Installment <-> Payment ──
FinancePlan.hasMany(Installment, { foreignKey: 'financePlanId', as: 'installments' });
Installment.belongsTo(FinancePlan, { foreignKey: 'financePlanId', as: 'financePlan' });

Installment.hasMany(Payment, { foreignKey: 'installmentId', as: 'payments' });
Payment.belongsTo(Installment, { foreignKey: 'installmentId', as: 'installment' });

Application.hasMany(Payment, { foreignKey: 'applicationId', as: 'payments' });
Payment.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

// ── Customer profile <-> User ──
User.hasOne(Customer, { foreignKey: 'userId', as: 'customerProfile' });
Customer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ── Notifications / Audit logs ──
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'actor' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Supplier,
  Customer,
  Application,
  FinancePlan,
  Installment,
  Payment,
  AuditLog,
  Notification,
  Setting,
};
