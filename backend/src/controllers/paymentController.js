const { Application, FinancePlan, Payment } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { logActivity } = require('../services/activityService');
const { notify } = require('../services/notificationService');
const { canAccessApplication } = require('./applicationController');
const { applyPayment } = require('../services/financeService');

// GET /api/payments?applicationId=... — same read scope as finance/installments.
const getPayments = asyncHandler(async (req, res) => {
  const { applicationId } = req.query;
  if (!applicationId) throw new AppError('applicationId query param is required.', 400);

  const application = await Application.findByPk(applicationId);
  if (!application) throw new AppError('Application not found.', 404);
  if (!canAccessApplication(req.user, application)) throw new AppError('Not authorized.', 403);

  const payments = await Payment.findAll({ where: { applicationId }, order: [['paymentDate', 'ASC']] });
  return ok(res, payments, 'Payments fetched.');
});

// POST /api/payments — assigned Manager, Admin (limited), or Super
// Admin (section 13/18). Applies FIFO against the outstanding
// installment schedule; totals are always backend-reconciled.
const createPayment = asyncHandler(async (req, res) => {
  const { applicationId, amount, method, reference, performedBy } = req.body;
  if (!applicationId) throw new AppError('applicationId is required.', 400);

  const application = await Application.findByPk(applicationId);
  if (!application) throw new AppError('Application not found.', 404);

  const isSuperAdmin = req.user.role === 'Super Admin';
  const isAdmin = req.user.role === 'Admin';
  const isAssignedManager = req.user.role === 'Manager' && application.managerId === req.user.id;
  if (!isSuperAdmin && !isAdmin && !isAssignedManager) throw new AppError('Not authorized to record payments.', 403);

  const amt = Number(amount);
  if (!amt || amt <= 0) throw new AppError('A valid payment amount is required.', 400);

  const plan = await FinancePlan.findOne({ where: { applicationId } });
  if (!plan) throw new AppError('No finance plan set up for this application yet.', 400);

  const { payment, overpaidAmount } = await applyPayment({
    applicationId,
    financePlanId: plan.id,
    amount: amt,
    method: method || 'Cash',
    reference,
  });

  await logActivity({
    userId: req.user.id,
    user: performedBy || req.user.name,
    action: 'CREATE',
    entity: 'Payment',
    entityId: payment.id,
    details: `Recorded payment of ${amt} for ${application.fullName} (${application.id}).${
      overpaidAmount > 0 ? ` Note: ${overpaidAmount} exceeded the outstanding balance.` : ''
    }`,
  });

  await notify(application.userId, 'Payment recorded', `A payment of ${amt} was recorded on your application ${application.id}.`);

  return created(res, payment, 'Payment recorded.');
});

module.exports = { getPayments, createPayment };
