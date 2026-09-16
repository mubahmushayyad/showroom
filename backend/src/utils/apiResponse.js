// Every response follows { success, message, data, errors } so the
// frontend's services/api.js `unwrap()` helper works everywhere.
function ok(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data, errors: null });
}

function created(res, data = null, message = 'Created') {
  return ok(res, data, message, 201);
}

function fail(res, message = 'Something went wrong', status = 400, errors = null) {
  return res.status(status).json({ success: false, message, data: null, errors });
}

module.exports = { ok, created, fail };
