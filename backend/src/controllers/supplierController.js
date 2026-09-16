const { Supplier } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { genId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityService');

const FIELDS = ['company', 'contact', 'email', 'phone', 'city', 'address', 'cnic', 'status', 'notes'];
const pick = (body) => FIELDS.reduce((o, f) => (body[f] !== undefined ? { ...o, [f]: body[f] } : o), {});

const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.findAll({ order: [['createdAt', 'DESC']] });
  return ok(res, suppliers, 'Suppliers fetched.');
});

const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) throw new AppError('Supplier not found.', 404);
  return ok(res, supplier, 'Supplier fetched.');
});

const createSupplier = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (!data.company) throw new AppError('Company name is required.', 400);

  const supplier = await Supplier.create({ id: genId('SUP'), ...data });

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'CREATE',
    entity: 'Supplier',
    entityId: supplier.id,
    details: `Added supplier ${supplier.company}.`,
  });

  return created(res, supplier, 'Supplier added.');
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) throw new AppError('Supplier not found.', 404);

  Object.assign(supplier, pick(req.body));
  await supplier.save();

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'UPDATE',
    entity: 'Supplier',
    entityId: supplier.id,
    details: `Updated supplier ${supplier.company}.`,
  });

  return ok(res, supplier, 'Supplier updated.');
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByPk(req.params.id);
  if (!supplier) throw new AppError('Supplier not found.', 404);

  await supplier.destroy();

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'DELETE',
    entity: 'Supplier',
    entityId: req.params.id,
    details: `Removed supplier ${supplier.company}.`,
  });

  return ok(res, { id: req.params.id }, 'Supplier deleted.');
});

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
