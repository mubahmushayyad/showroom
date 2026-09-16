// Wraps an async route/controller so thrown errors (or rejected
// promises) are forwarded to Express's error middleware instead of
// crashing the process or hanging the request.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
