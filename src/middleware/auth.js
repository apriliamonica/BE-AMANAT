// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { errorResponse } = require('../utils/response');

/**
 * Verify JWT Token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Token tidak ditemukan', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        bagian: true,
        jabatan: true,
        isActive: true
      }
    });

    if (!user) {
      return errorResponse(res, 'User tidak ditemukan', 404);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User tidak aktif', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Token tidak valid', 401);
  }
};

/**
 * Check user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Tidak memiliki akses', 403);
    }
    next();
  };
};

/**
 * Check if user is admin or sekretaris
 */
const isAdminOrSekretaris = (req, res, next) => {
  if (!['ADMIN', 'SEKRETARIS_KANTOR'].includes(req.user.role)) {
    return errorResponse(res, 'Hanya admin atau sekretaris yang dapat mengakses', 403);
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  isAdminOrSekretaris
};