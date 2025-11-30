// ISI FILE: src/middleware/validate.js

const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/response");

/**
 * Middleware to handle validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Jika ada error validasi, kirim respons error 400 Bad Request
    return errorResponse(res, errors.array()[0].msg, 400);
  }
  // Jika validasi sukses, lanjutkan ke middleware berikutnya atau controller
  next();
};

module.exports = {
  validate,
};
