import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export class ErrorHandler {
  static handle(err, req, res, next = null) {
    // Log error dengan structured logging
    logger.error('Error occurred', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      url: req?.url,
      method: req?.method,
      userId: req?.user?.id,
      code: err.code,
      name: err.name,
      statusCode: err.statusCode,
    });

    // Default error handling
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    // Jangan expose error detail di production untuk 500 errors
    const errorMessage =
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
        : message;

    return ApiResponse.error(res, errorMessage, statusCode);
  }

  static notFound(req, res) {
    logger.warn('Route not found', {
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
    return ApiResponse.error(
      res,
      `Route ${req.method} ${req.path} tidak ditemukan. Periksa URL dan method yang digunakan.`,
      404
    );
  }
}
