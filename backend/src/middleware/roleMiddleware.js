const AppError = require('../utils/AppError');

// Usage: allowRoles('Super Admin', 'Admin'). Must run after `protect`.
// This is the real enforcement point (section 14 — "never trust React");
// the frontend's route guards are UX only.
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Not authenticated.', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
}

module.exports = { allowRoles };
