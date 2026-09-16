const { fail } = require('../utils/apiResponse');

function notFound(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// Central error handler — every controller either throws an AppError,
// a Sequelize validation error, or lets asyncHandler forward whatever
// it threw. Always responds with the { success:false, message, errors }
// envelope so the frontend's error handling stays consistent.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.isAppError) {
    return fail(res, err.message, err.statusCode, err.errors);
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = (err.errors || []).map((e) => ({ field: e.path, message: e.message }));
    const message =
      err.name === 'SequelizeUniqueConstraintError'
        ? `${errors[0]?.field || 'Value'} already in use.`
        : 'Validation failed.';
    return fail(res, message, 409, errors);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return fail(res, 'Related record not found or still referenced elsewhere.', 400);
  }

  if (err.name === 'MulterError') {
    return fail(res, err.message, 400);
  }

  console.error(err);
  return fail(res, 'Internal server error.', 500);
}

module.exports = { notFound, errorHandler };
