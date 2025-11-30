import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-env";

/**
 * Auth Middleware - Verifikasi JWT Token
 * Harus ada di protected routes
 */
const authMiddleware = (req, res, next) => {
  try {
    // 1. Ambil token dari header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(
        res,
        401,
        "Token tidak ditemukan. Gunakan header: Authorization: Bearer <token>"
      );
    }

    // 2. Extract token (format: "Bearer <token>")
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    // 3. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Attach user data ke request
    req.user = decoded;

    // 5. Lanjut ke next handler
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        401,
        "Token sudah expired. Silakan login kembali"
      );
    }
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Token tidak valid");
    }
    return errorResponse(res, 401, `Auth error: ${error.message}`);
  }
};

export default authMiddleware;
