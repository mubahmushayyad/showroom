const { Application, FinancePlan, Installment } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const { canAccessApplication } = require('./applicationController');

// GET /api/applications/:id/installments — same read scope as the
// finance plan: Super Admin/Admin, assigned Manager, or owning Customer.
const getInstallments = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application) throw new AppError('Application not found.', 404);
  if (!canAccessApplication(req.user, application)) throw new AppError('Not authorized.', 403);

  const plan = await FinancePlan.findOne({ where: { applicationId: application.id } });
  if (!plan) return ok(res, [], 'No finance plan set up yet.');

  const installments = await Installment.findAll({
    where: { financePlanId: plan.id },
    order: [['seq', 'ASC']],
  });

  return ok(res, installments, 'Installment schedule fetched.');
});

module.exports = { getInstallments };
