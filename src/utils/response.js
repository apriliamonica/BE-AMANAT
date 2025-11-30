// src/utils/response.js

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Success message
 * @param {*} data - Response data (optional)
 */
export const successResponse = (
  res,
  statusCode = 200,
  message = "Sukses",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Error details (optional)
 */
export const errorResponse = (
  res,
  statusCode = 500,
  message = "Terjadi kesalahan",
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Paginated Response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Array} data - Array of items
 * @param {number} total - Total count
 * @param {number} limit - Items per page
 * @param {number} offset - Current offset
 */
export const paginatedResponse = (
  res,
  statusCode = 200,
  message = "Sukses",
  data = [],
  total = 0,
  limit = 10,
  offset = 0
) => {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    pagination: {
      total,
      limit,
      offset,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
};
