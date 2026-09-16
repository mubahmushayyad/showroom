const { Vehicle } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const { genId } = require('../utils/idGenerator');
const { logActivity } = require('../services/activityService');

const FIELDS = [
  'make', 'model', 'year', 'variant', 'purchaseRate', 'sellingPrice',
  'colors', 'stock', 'fuel', 'transmission', 'mileage', 'engine',
  'description', 'images', 'status', 'featured', 'supplierId',
];

function pick(body) {
  const out = {};
  FIELDS.forEach((f) => {
    if (body[f] !== undefined) out[f] = body[f];
  });
  return out;
}

// GET /api/cars — open to every authenticated role (customers browse
// the showroom, everyone else manages the catalog).
const getCars = asyncHandler(async (req, res) => {
  const cars = await Vehicle.findAll({ order: [['createdAt', 'DESC']] });
  return ok(res, cars, 'Vehicles fetched.');
});

const getCarById = asyncHandler(async (req, res) => {
  const car = await Vehicle.findByPk(req.params.id);
  if (!car) throw new AppError('Vehicle not found.', 404);
  return ok(res, car, 'Vehicle fetched.');
});

// POST /api/cars — Super Admin, Admin (section 2 permission matrix:
// Vehicle CRUD Super Admin FULL / Admin LIMITED — Admin can create/edit
// but not delete, see deleteCar below).
const createCar = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (!data.make || !data.model || !data.year) {
    throw new AppError('make, model and year are required.', 400);
  }

  const car = await Vehicle.create({ id: genId('CAR'), ...data });

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'CREATE',
    entity: 'Vehicle',
    entityId: car.id,
    details: `Added ${car.make} ${car.model} ${car.variant || ''} to the catalog.`,
  });

  return created(res, car, 'Vehicle added.');
});

const updateCar = asyncHandler(async (req, res) => {
  const car = await Vehicle.findByPk(req.params.id);
  if (!car) throw new AppError('Vehicle not found.', 404);

  Object.assign(car, pick(req.body));
  await car.save();

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'UPDATE',
    entity: 'Vehicle',
    entityId: car.id,
    details: `Updated ${car.make} ${car.model} ${car.variant || ''}.`,
  });

  return ok(res, car, 'Vehicle updated.');
});

// DELETE /api/cars/:id — Super Admin only (Admin is LIMITED, no delete).
const deleteCar = asyncHandler(async (req, res) => {
  const car = await Vehicle.findByPk(req.params.id);
  if (!car) throw new AppError('Vehicle not found.', 404);

  await car.destroy();

  await logActivity({
    userId: req.user.id,
    user: req.body.performedBy || req.user.name,
    action: 'DELETE',
    entity: 'Vehicle',
    entityId: req.params.id,
    details: `Removed ${car.make} ${car.model} ${car.variant || ''} from the catalog.`,
  });

  return ok(res, { id: req.params.id }, 'Vehicle deleted.');
});

// POST /api/cars/upload-images — Super Admin, Admin.
const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) throw new AppError('No images uploaded.', 400);
  const urls = files.map((f) => `/uploads/cars/${f.filename}`);
  return ok(res, { urls }, 'Images uploaded.');
});

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar, uploadImages };
