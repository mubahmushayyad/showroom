const { Application, Vehicle, User, Payment, FinancePlan, Installment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');

// GET /api/dashboard — role-scoped summary numbers. Not currently
// called by the frontend (dashboards compute stats client-side from
// already-fetched cars/applications/users), but kept available per the
// REST API plan (section 13) for future use / API consumers.
const getDashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === 'Customer') {
    const applications = await Application.findAll({ where: { userId: user.id } });
    return ok(res, {
      totalApplications: applications.length,
      byStatus: countByStatus(applications),
    });
  }

  if (user.role === 'Manager') {
    const applications = await Application.findAll({ where: { managerId: user.id } });
    return ok(res, {
      assignedApplications: applications.length,
      byStatus: countByStatus(applications),
    });
  }

  // Super Admin / Admin
  const [totalCars, availableCars, totalApplications, totalUsers, payments] = await Promise.all([
    Vehicle.count(),
    Vehicle.count({ where: { status: 'Available' } }),
    Application.count(),
    User.count(),
    Payment.findAll(),
  ]);
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return ok(res, { totalCars, availableCars, totalApplications, totalUsers, totalCollected });
});

function countByStatus(applications) {
  return applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
}

module.exports = { getDashboard };
