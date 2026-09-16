const { Op } = require('sequelize');
const { Application, Vehicle, User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { genId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityService');
const { notify } = require('../services/notificationService');

// Manager may only push these workflow states forward for applications
// assigned to them (section 6 of the guide). Everything before ASSIGNED
// (approve/reject) and after PAYMENT_IN_PROGRESS→OVERDUE bookkeeping is
// Super Admin territory.
const MANAGER_ALLOWED_STATUSES = [
  'IN_PROCESS',
  'VEHICLE_SELECTED',
  'FINANCE_SETUP',
  'PAYMENT_IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'OVERDUE',
];

// Critical authorization rule (section 10): Manager queries are always
// filtered server-side by managerId = req.user.id, Customer queries by
// userId = req.user.id. Never depend on the frontend to protect data.
function scopeForUser(user) {
  if (user.role === 'Super Admin' || user.role === 'Admin') return {};
  if (user.role === 'Manager') return { managerId: user.id };
  return { userId: user.id }; // Customer
}

function canAccessApplication(user, application) {
  if (user.role === 'Super Admin' || user.role === 'Admin') return true;
  if (user.role === 'Manager') return application.managerId === user.id;
  return application.userId === user.id; // Customer
}

// GET /api/applications — role-scoped list.
const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.findAll({
    where: scopeForUser(req.user),
    order: [['createdAt', 'DESC']],
  });
  return ok(res, applications, 'Applications fetched.');
});

// GET /api/applications/user/:userId — a customer's own applications
// (or Super Admin/Admin looking up any customer's).
const getApplicationsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const isSelf = req.user.id === userId;
  const isStaff = ['Super Admin', 'Admin'].includes(req.user.role);
  if (!isSelf && !isStaff) throw new AppError('Not authorized to view these applications.', 403);

  const applications = await Application.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  return ok(res, applications, 'Applications fetched.');
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findByPk(req.params.id);
  if (!application) throw new AppError('Application not found.', 404);
  if (!canAccessApplication(req.user, application)) {
    throw new AppError('Not authorized to view this application.', 403);
  }
  return ok(res, application, 'Application fetched.');
});

// POST /api/applications — Customer (own) or Super Admin. Step 1 of the
// Application-to-Delivery flow (section 1/8): always starts at PENDING.
const createApplication = asyncHandler(async (req, res) => {
  const { fullName, email, cnic, phone, address, city, carId, color, notes, userId } = req.body;

  if (!fullName || !email || !cnic || !phone) {
    throw new AppError('fullName, email, cnic and phone are required.', 400);
  }

  const isSuperAdmin = req.user.role === 'Super Admin';
  const targetUserId = isSuperAdmin && userId ? userId : req.user.id;
  if (req.user.role === 'Customer' && userId && userId !== req.user.id) {
    throw new AppError('Customers may only apply for themselves.', 403);
  }
  if (!isSuperAdmin && req.user.role !== 'Customer') {
    throw new AppError('Only customers (or Super Admin on their behalf) can submit applications.', 403);
  }

  let carName = req.body.carName;
  let carImage = req.body.carImage;
  if (carId) {
    const vehicle = await Vehicle.findByPk(carId);
    if (!vehicle) throw new AppError('Selected vehicle not found.', 404);
    carName = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`.trim();
    carImage = vehicle.images?.[0] || null;
  }

  const application = await Application.create({
    id: genId('APP'),
    userId: targetUserId,
    fullName,
    email,
    cnic,
    phone,
    address: address || null,
    city: city || null,
    carId: carId || null,
    carName: carName || null,
    carImage: carImage || null,
    color: color || null,
    notes: notes || null,
    status: 'PENDING',
  });

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'CREATE',
    entity: 'Application',
    entityId: application.id,
    details: `${fullName} applied for ${carName || 'a vehicle'}.`,
  });

  // Let every Super Admin-visible surface know a new application landed.
  const admins = await User.findAll({ where: { role: 'Super Admin', status: 'Active' } });
  await Promise.all(
    admins.map((a) => notify(a.id, 'New application submitted', `${fullName} applied for ${carName || 'a vehicle'}.`))
  );

  return created(res, application, 'Application submitted.');
});

// PATCH /api/applications/:id/status — Super Admin (any legal
// transition) or the assigned Manager (workflow-only transitions).
// Section 20: only the next status listed for the current status is legal.
const updateStatus = asyncHandler(async (req, res) => {
  const { status, performedBy } = req.body;
  const application = await Application.findByPk(req.params.id);
  if (!application) throw new AppError('Application not found.', 404);
  if (!status || !Application.APP_STATUS.includes(status)) {
    throw new AppError('A valid status is required.', 400);
  }

  const isSuperAdmin = req.user.role === 'Super Admin';
  const isAssignedManager = req.user.role === 'Manager' && application.managerId === req.user.id;
  if (!isSuperAdmin && !isAssignedManager) {
    throw new AppError('Not authorized to change this application\'s status.', 403);
  }
  if (isAssignedManager && !MANAGER_ALLOWED_STATUSES.includes(status)) {
    throw new AppError('Managers cannot set this status.', 403);
  }

  const legalNext = Application.STATUS_NEXT[application.status] || [];
  if (!legalNext.includes(status)) {
    throw new AppError(
      `Cannot move from ${application.status} to ${status}. Allowed: ${legalNext.join(', ') || 'none'}.`,
      400
    );
  }

  if (status === 'ASSIGNED' && !application.managerId) {
    throw new AppError('Assign a Manager first (PATCH /applications/:id/assign-manager).', 400);
  }

  if (status === 'READY_FOR_DELIVERY') {
    const { FinancePlan, Installment } = require('../models');
    const plan = await FinancePlan.findOne({ where: { applicationId: application.id } });
    if (plan) {
      const installments = await Installment.findAll({ where: { financePlanId: plan.id } });
      const outstanding = installments.some((i) => Number(i.paidAmount) < Number(i.amount));
      if (outstanding) throw new AppError('Cannot mark ready for delivery — installments are still outstanding.', 400);
    }
  }

  const previousStatus = application.status;
  application.status = status;
  if (status === 'APPROVED') application.approvedAt = new Date();
  if (status === 'REJECTED' && req.body.remarks) application.remarks = req.body.remarks;
  await application.save();

  await logActivity({
    userId: req.user.id,
    user: performedBy || req.user.name,
    action: 'STATUS_CHANGE',
    entity: 'Application',
    entityId: application.id,
    details: `${application.fullName}'s application moved from ${previousStatus} to ${status}.`,
  });

  await notify(
    application.userId,
    'Application status updated',
    `Your application ${application.id} is now ${status.replace(/_/g, ' ')}.`
  );

  return ok(res, application, 'Application status updated.');
});

// PATCH /api/applications/:id/assign-manager — Super Admin only
// (section 4: "Only Super Admin assigns the Manager, either directly
// or after an application is approved").
const assignManager = asyncHandler(async (req, res) => {
  const { managerId, performedBy } = req.body;
  const application = await Application.findByPk(req.params.id);
  if (!application) throw new AppError('Application not found.', 404);

  if (!['APPROVED', 'ASSIGNED'].includes(application.status)) {
    throw new AppError('Application must be approved before assigning a Manager.', 400);
  }
  if (!managerId) throw new AppError('managerId is required.', 400);

  const manager = await User.findByPk(managerId);
  if (!manager || manager.role !== 'Manager') throw new AppError('Selected user is not a Manager.', 400);
  if (manager.status !== 'Active') throw new AppError('Selected Manager is inactive.', 400);

  application.managerId = managerId;
  if (application.status === 'APPROVED') application.status = 'ASSIGNED';
  await application.save();

  await logActivity({
    userId: req.user.id,
    user: performedBy || req.user.name,
    action: 'ASSIGN_MANAGER',
    entity: 'Application',
    entityId: application.id,
    details: `Assigned ${manager.name} to ${application.fullName}'s application.`,
  });

  await notify(manager.id, 'New customer assigned', `You were assigned to ${application.fullName}'s application.`);
  await notify(application.userId, 'Manager assigned', `${manager.name} is now your dedicated Manager.`);

  return ok(res, application, 'Manager assigned.');
});

// PATCH /api/applications/:id/select-vehicle — assigned Manager or
// Super Admin, attaches the vehicle the customer picked (section 6/18).
const selectVehicle = asyncHandler(async (req, res) => {
  const { carId, performedBy } = req.body;
  const application = await Application.findByPk(req.params.id);
  if (!application) throw new AppError('Application not found.', 404);

  const isSuperAdmin = req.user.role === 'Super Admin';
  const isAssignedManager = req.user.role === 'Manager' && application.managerId === req.user.id;
  if (!isSuperAdmin && !isAssignedManager) throw new AppError('Not authorized.', 403);

  if (!carId) throw new AppError('carId is required.', 400);
  const vehicle = await Vehicle.findByPk(carId);
  if (!vehicle) throw new AppError('Vehicle not found.', 404);
  if (vehicle.status !== 'Available' && vehicle.id !== application.carId) {
    throw new AppError('Selected vehicle is not available.', 400);
  }

  application.carId = vehicle.id;
  application.carName = `${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`.trim();
  application.carImage = vehicle.images?.[0] || null;
  await application.save();

  await logActivity({
    userId: req.user.id,
    user: performedBy || req.user.name,
    action: 'UPDATE',
    entity: 'Application',
    entityId: application.id,
    details: `Confirmed vehicle ${application.carName} for ${application.fullName}.`,
  });

  return ok(res, application, 'Vehicle selected.');
});

module.exports = {
  getApplications,
  getApplicationsByUser,
  getApplicationById,
  createApplication,
  updateStatus,
  assignManager,
  selectVehicle,
  canAccessApplication,
};
