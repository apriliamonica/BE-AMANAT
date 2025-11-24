// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Data sudah ada',
      errors: { unique: err.meta?.target }
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Data tidak ditemukan'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token sudah expired'
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'Error upload file: ' + err.message
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;