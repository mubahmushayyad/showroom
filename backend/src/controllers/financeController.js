const { Application, Vehicle, FinancePlan } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { genId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityService');
const { canAccessApplication } = require('./applicationController');
const { computeFinance, generateInstallments } = require('../services/financeService');

// POST /api/applications/:id/finance — assigned Manager or Super Admin
// (financeApi.js). Requires the application to be at VEHICLE_SELECTED.
// vehiclePrice/financedAmount/installmentAmount are always computed
// server-side from the authoritative Vehicle.sellingPrice — never
// trusted from the request body (section 18, "Golden Rules").
const createFinancePlan = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application) throw new AppError('Application not found.', 404);

  const isSuperAdmin = req.user.role === 'Super Admin';
  const isAssignedManager = req.user.role === 'Manager' && application.managerId === req.user.id;
  if (!isSuperAdmin && !isAssignedManager) throw new AppError('Not authorized.', 403);

  if (!['VEHICLE_SELECTED', 'FINANCE_SETUP'].includes(application.status)) {
    throw new AppError('A vehicle must be selected before setting up finance.', 400);
  }
  if (!application.carId) throw new AppError('This application has no vehicle attached yet.', 400);

  const vehicle = await Vehicle.findByPk(application.carId);
  if (!vehicle) throw new AppError('Attached vehicle no longer exists.', 404);

  const { downPayment, duration, frequency } = req.body;
  const dp = Number(downPayment);
  const dur = Number(duration);
  if (!dp || dp < 0) throw new AppError('A valid down payment is required.', 400);
  if (!dur || dur < 1) throw new AppError('Duration must be at least 1 installment.', 400);
  if (!['Monthly', 'Quarterly'].includes(frequency)) throw new AppError('Frequency must be Monthly or Quarterly.', 400);

  const vehiclePrice = Number(vehicle.sellingPrice);
  if (dp >= vehiclePrice) throw new AppError('Down payment cannot be greater than or equal to the vehicle price.', 400);

  let plan = await FinancePlan.findOne({ where: { applicationId: application.id } });
  const { financedAmount, installmentAmount } = computeFinance({ vehiclePrice, downPayment: dp, duration: dur });

  if (plan) {
    // Re-submission — replace the plan and regenerate the schedule.
    const { Installment, Payment } = require('../models');
    const oldInstallments = await Installment.findAll({ where: { financePlanId: plan.id } });
    await Payment.destroy({ where: { installmentId: oldInstallments.map((i) => i.id) } });
    await Installment.destroy({ where: { financePlanId: plan.id } });
    Object.assign(plan, { vehicleId: vehicle.id, vehiclePrice, downPayment: dp, financedAmount, duration: dur, frequency, installmentAmount });
    await plan.save();
  } else {
    plan = await FinancePlan.create({
      id: genId('FIN'),
      applicationId: application.id,
      vehicleId: vehicle.id,
      vehiclePrice,
      downPayment: dp,
      financedAmount,
      duration: dur,
      frequency,
      installmentAmount,
    });
  }

  await generateInstallments({
    financePlanId: plan.id,
    financedAmount,
    duration: dur,
    frequency,
    startDate: new Date(),
  });

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'CREATE',
    entity: 'FinancePlan',
    entityId: plan.id,
    details: `Finance plan set up for ${application.fullName}: down payment ${dp}, ${dur} ${frequency.toLowerCase()} installments.`,
  });

  return created(res, plan, 'Finance plan created.');
});

// GET /api/applications/:id/finance — Super Admin/Admin, the assigned
// Manager, or the owning Customer (read-only).
const getFinancePlan = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application) throw new AppError('Application not found.', 404);
  if (!canAccessApplication(req.user, application)) throw new AppError('Not authorized.', 403);

  const plan = await FinancePlan.findOne({ where: { applicationId: application.id } });
  if (!plan) throw new AppError('No finance plan set up for this application yet.', 404);

  return ok(res, plan, 'Finance plan fetched.');
});

module.exports = { createFinancePlan, getFinancePlan };
