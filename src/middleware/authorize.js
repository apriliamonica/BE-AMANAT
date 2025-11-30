// src/middleware/authorize.js
import { errorResponse } from "../utils/response.js";

/**
 * Authorize Middleware - Cek role user
 * Usage: authorize(['ADMIN', 'KETUA_PENGURUS'])
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // 1. Cek user sudah authenticated (dari auth middleware)
      if (!req.user) {
        return errorResponse(res, 401, "User tidak authenticated");
      }

      // 2. Cek role user
      if (!allowedRoles.includes(req.user.role)) {
        return errorResponse(
          res,
          403,
          `Akses denied. Role Anda: ${
            req.user.role
          }. Role yang diizinkan: ${allowedRoles.join(", ")}`
        );
      }

      // 3. Lanjut ke next handler
      next();
    } catch (error) {
      return errorResponse(res, 500, `Authorize error: ${error.message}`);
    }
  };
};

/**
 * Optional: Middleware untuk cek multiple roles dengan logika AND/OR
 */
export const authorizeMultiple = (roleGroups, logic = "OR") => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 401, "User tidak authenticated");
      }

      const userRole = req.user.role;

      let hasAccess = false;

      if (logic === "OR") {
        // User harus punya salah satu role
        hasAccess = roleGroups.some((role) => role === userRole);
      } else if (logic === "AND") {
        // User harus punya semua role (jarang digunakan)
        hasAccess = roleGroups.every((role) => role === userRole);
      }

      if (!hasAccess) {
        return errorResponse(
          res,
          403,
          `Akses denied. Role Anda tidak memiliki izin untuk mengakses resource ini`
        );
      }

      next();
    } catch (error) {
      return errorResponse(res, 500, `Authorize error: ${error.message}`);
    }
  };
};
