const { Customer } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { genId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityService');

const FIELDS = ['userId', 'name', 'email', 'phone', 'cnic', 'address', 'city'];
const pick = (body) => FIELDS.reduce((o, f) => (body[f] !== undefined ? { ...o, [f]: body[f] } : o), {});

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.findAll({ order: [['createdAt', 'DESC']] });
  return ok(res, customers, 'Customers fetched.');
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) throw new AppError('Customer not found.', 404);
  return ok(res, customer, 'Customer fetched.');
});

const createCustomer = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (!data.name) throw new AppError('Name is required.', 400);

  const customer = await Customer.create({ id: genId('CUS'), ...data });

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'CREATE',
    entity: 'Customer',
    entityId: customer.id,
    details: `Added customer profile for ${customer.name}.`,
  });

  return created(res, customer, 'Customer added.');
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) throw new AppError('Customer not found.', 404);

  Object.assign(customer, pick(req.body));
  await customer.save();

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'UPDATE',
    entity: 'Customer',
    entityId: customer.id,
    details: `Updated customer profile for ${customer.name}.`,
  });

  return ok(res, customer, 'Customer updated.');
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) throw new AppError('Customer not found.', 404);

  await customer.destroy();

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'DELETE',
    entity: 'Customer',
    entityId: req.params.id,
    details: `Removed customer profile for ${customer.name}.`,
  });

  return ok(res, { id: req.params.id }, 'Customer deleted.');
});

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
