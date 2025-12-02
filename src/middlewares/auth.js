import { verifyToken } from "../config/jwt.js";
import { ApiResponse } from "../utils/response.js";
import { prisma } from "../config/index.js";

export class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.error(res, "Token tidak ditemukan", 401);
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nama_lengkap: true,
          username: true,
          password: true,
          role: true,
          kodeBagian: true,
          jabatan: true,
          phone: true,
          isActive: true,
        },
      });

      if (!user) {
        return ApiResponse.error(res, "User tidak ditemukan", 401);
      }

      req.user = user;
      next();
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Token tidak valid",
        error.statusCode || 401
      );
    }
  }

  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      if (!roles.includes(req.user.role)) {
        return ApiResponse.error(res, "Anda tidak memiliki akses", 403);
      }

      next();
    };
  }
}
